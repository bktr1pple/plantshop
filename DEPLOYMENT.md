# DEPLOYMENT.md — розгортання PlantShop на продакшн-сервері

Покрокова інструкція деплою монорепозиторію (`frontend` — Next.js 16, `backend` — NestJS 11 + Prisma 7 + MySQL 8) на Ubuntu/Debian-сервер із власним доменом і HTTPS.

У прикладах використовуються плейсхолдери — замініть їх на свої значення:

- `example.com` — домен фронтенда (сайт);
- `api.example.com` — піддомен бекенд-API;
- `/srv/plantshop` — директорія застосунку на сервері;
- `plantshop` — системний користувач, від якого працюють процеси.

---

## 1. Вимоги

| Компонент | Версія / примітка |
|---|---|
| ОС | Ubuntu 22.04+ / Debian 12+ |
| Node.js | **24.16.0** (через nvm; репозиторій пінить версію в `.nvmrc` / `.node-version`) |
| MySQL | 8.x |
| SMTP-акаунт | будь-який провайдер з логіном/паролем (security-листи + контакт-форма) |
| Домен | A-записи на IP сервера для `example.com` і `api.example.com` |
| reCAPTCHA v2 | пара ключів site key / secret key для продакшн-домену |
| nginx + certbot | reverse proxy та HTTPS |

### 1.1. Базова підготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx mysql-server build-essential curl

# окремий користувач без sudo для застосунку
sudo adduser --system --group --home /srv/plantshop plantshop
```

### 1.2. Node.js 24.16.0 через nvm (від користувача plantshop)

```bash
sudo -u plantshop bash -lc '
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
nvm install 24.16.0
nvm alias default 24.16.0
node --version
'
```

### 1.3. База даних MySQL

```bash
sudo mysql <<'SQL'
CREATE DATABASE plantshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'plantshop'@'localhost' IDENTIFIED BY 'STRONG_DB_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON plantshop.* TO 'plantshop'@'localhost';
FLUSH PRIVILEGES;
SQL
```

---

## 2. Клонування і env-файли

```bash
sudo -u plantshop bash -lc '
cd /srv/plantshop
git clone <URL-вашого-репозиторію> app
cd app
'
```

### 2.1. `backend/.env`

Скопіюйте `backend/.env.example` → `backend/.env` і заповніть **усі** змінні:

| Змінна | Прод-значення | Де взяти |
|---|---|---|
| `PORT` | `3001` | фіксований внутрішній порт API |
| `NODE_ENV` | `production` | обовʼязково — вмикає `secure` cookies |
| `DOMAIN_COOKIE` | `example.com` | спільний батьківський домен фронтенда і API (cookie ставиться як `.example.com`) |
| `TRUST_PROXY_HOPS` | `1` | один nginx перед бекендом |
| `FRONTEND_URL` | `https://example.com` | origin фронтенда (CORS/Origin allowlist) |
| `PUBLIC_API_URL` | `https://api.example.com` | публічний URL API для побудови посилань на медіа |
| `JWT_ACCESS_SECRET` | `openssl rand -hex 32` | згенерувати на сервері |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` | окремий, не повторювати |
| `REFRESH_TOKEN_DIGEST_SECRET` | `openssl rand -hex 32` | окремий, не повторювати |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | можна лишити дефолт |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | можна лишити дефолт |
| `DATABASE_URL` | `mysql://plantshop:STRONG_DB_PASSWORD_HERE@localhost:3306/plantshop` | з кроку 1.3 |
| `RECAPTCHA_SECRET_KEY` | секретний ключ | Google reCAPTCHA admin console |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_SECURE` | від SMTP-провайдера | `587` + `MAIL_SECURE=false` (STARTTLS) або `465` + `true` |
| `MAIL_USER` / `MAIL_PASSWORD` | від SMTP-провайдера | для Gmail — app password |
| `MAIL_FROM_EMAIL` / `MAIL_FROM_NAME` | адреса відправника | має бути дозволена провайдером |
| `MAX_REFRESH_SESSIONS_PER_USER` | `10` | дефолт |

> Усі три секрети мають бути **незалежними** значеннями ≥32 символів — бекенд відмовиться стартувати з плейсхолдерами або короткими секретами.

### 2.2. `frontend/.env`

Скопіюйте `frontend/.env.example` → `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
INTERNAL_API_URL=http://127.0.0.1:3001
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<site key reCAPTCHA>
```

> `INTERNAL_API_URL` — адреса, з якої Next.js-сервер (SSR/proxy) звертається до API; локальний `127.0.0.1:3001` швидший і не залежить від зовнішнього DNS. `NEXT_PUBLIC_API_URL` — те, що бачить браузер.
> ⚠️ `NEXT_PUBLIC_*` змінні вшиваються у бандл під час `npm run build` — після зміни цих значень фронтенд треба перебилдити.

---

## 3. Встановлення залежностей, міграції, build

```bash
sudo -u plantshop bash -lc '
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
cd /srv/plantshop/app

# backend: install + prisma generate (postinstall) + міграції + build
cd backend
npm ci
npx prisma migrate deploy
npm run build

# frontend: install + production build
cd ../frontend
npm ci
npm run build
'
```

- `prisma migrate deploy` застосовує **лише** наявні міграції з `backend/prisma/migrations` — без reset і без втрати даних.
- (Опційно) наповнити каталог демонстраційними рослинами: `cd backend && npm run seed`.

---

## 4. Запуск процесів — PM2 **або** systemd

Два процеси: `plantshop-backend` (порт 3001) і `plantshop-frontend` (порт 3000). Оберіть один із варіантів.

> ВАЖЛИВО: бекенд має запускатися з робочою директорією `backend/`, бо медіа зберігаються у `<cwd>/uploads`.

### Варіант А — PM2

```bash
sudo -u plantshop bash -lc 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && npm i -g pm2'
```

Створіть `/srv/plantshop/app/ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: 'plantshop-backend',
      cwd: '/srv/plantshop/app/backend',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: 'plantshop-frontend',
      cwd: '/srv/plantshop/app/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
```

```bash
sudo -u plantshop bash -lc '
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
cd /srv/plantshop/app
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u plantshop --hp /srv/plantshop   # виконайте команду, яку видасть pm2 (через sudo)
'
```

### Варіант Б — systemd

`/etc/systemd/system/plantshop-backend.service`:

```ini
[Unit]
Description=PlantShop backend (NestJS API)
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=plantshop
WorkingDirectory=/srv/plantshop/app/backend
ExecStart=/srv/plantshop/.nvm/versions/node/v24.16.0/bin/node dist/main.js
Environment=NODE_ENV=production
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/plantshop-frontend.service`:

```ini
[Unit]
Description=PlantShop frontend (Next.js)
After=network.target plantshop-backend.service

[Service]
Type=simple
User=plantshop
WorkingDirectory=/srv/plantshop/app/frontend
ExecStart=/srv/plantshop/.nvm/versions/node/v24.16.0/bin/node node_modules/next/dist/bin/next start -p 3000
Environment=NODE_ENV=production
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now plantshop-backend plantshop-frontend
sudo systemctl status plantshop-backend plantshop-frontend
```

---

## 5. nginx reverse proxy

Два server-блоки: сайт (`example.com` → 3000) і API (`api.example.com` → 3001).

**Роздача `/uploads`: через бекенд (proxy), а не nginx alias.** Причина: бекенд уже віддає файли через express.static, а всі перевірки шляхів/походження медіа і reference-aware видалення живуть у бекенді — один source of truth. Публічні URL медіа будуються від `PUBLIC_API_URL`, тож вони й так вказують на `api.example.com/uploads/...`. Для невеликого магазину це не є вузьким місцем; за потреби пізніше можна додати nginx `alias` на `/srv/plantshop/app/backend/uploads` як оптимізацію.

`/etc/nginx/sites-available/plantshop`:

```nginx
# Frontend — example.com
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Backend API — api.example.com
server {
    listen 80;
    server_name api.example.com;

    # обмеження розміру тіла: завантаження медіа до 5 МБ + запас на multipart
    client_max_body_size 60m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/plantshop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. HTTPS (certbot) і домен

1. Переконайтеся, що A-записи `example.com`, `www.example.com`, `api.example.com` вказують на IP сервера (перевірка: `dig +short example.com`).
2. Випустіть сертифікати:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com -d api.example.com
```

3. Certbot сам додасть `listen 443 ssl` і редирект з 80. Автопродовження вже налаштоване (`systemctl list-timers | grep certbot`).
4. Звірте фінальні значення env (вони мають бути https): `FRONTEND_URL=https://example.com`, `PUBLIC_API_URL=https://api.example.com`, `NEXT_PUBLIC_API_URL=https://api.example.com`. Якщо змінювали — перебилдіть фронтенд (`npm run build`) і перезапустіть обидва процеси.

> HSTS вмикається самим фронтендом лише в `NODE_ENV=production`; auth-cookies стають `Secure` за тієї ж умови. `TRUST_PROXY_HOPS=1` обовʼязковий, інакше rate-limiting рахуватиме всіх клієнтів за IP nginx.

---

## 7. Перший адміністратор

1. Зареєструйтеся на сайті звичайним способом і підтвердіть email за листом.
2. Підвищте акаунт до ADMIN:

```bash
sudo -u plantshop bash -lc '
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
cd /srv/plantshop/app/backend
npm run promote:admin -- admin@example.com
'
```

3. Перезайдіть на сайт — у меню користувача зʼявиться «Адмін панель» (`/admin`).

---

## 8. Smoke-чеклист після деплою

- [ ] `https://example.com` відкривається з валідним сертифікатом; головна показує hero-тексти з налаштувань.
- [ ] Реєстрація: лист підтвердження приходить, посилання `/verify-email` створює акаунт, після цього логін працює.
- [ ] Логін з нового браузера запитує код із листа (login challenge) і завершується в модалці.
- [ ] `/plants` показує каталог; пошук через лупу в навбарі знаходить рослину; пагінація працює.
- [ ] Кошик → оформлення замовлення (авторизованим) → замовлення видно в `/dashboard/orders`.
- [ ] `/admin/plants`: створення рослини із завантаженням фото; фото відкривається з `https://api.example.com/uploads/...`.
- [ ] `/admin/orders`: зміна статусу замовлення відображається користувачу.
- [ ] `/admin/settings`: зміна тексту hero одразу видно на головній.
- [ ] Контакт-форма `/contact`: повідомлення доходить на `contactEmail` із налаштувань.
- [ ] `/dashboard` під USER; `/admin` під USER → редирект на `/forbidden`.
- [ ] Зупиніть бекенд на хвилину: захищені сторінки ведуть на `/auth-unavailable`, а не «розлогінюють».

---

## 9. Бекапи

### 9.1. База даних (mysqldump, щодня о 03:00)

```bash
sudo mkdir -p /var/backups/plantshop && sudo chown plantshop:plantshop /var/backups/plantshop
sudo crontab -u plantshop -e
```

```cron
0 3 * * * mysqldump --single-transaction --routines plantshop | gzip > /var/backups/plantshop/db-$(date +\%F).sql.gz
10 3 * * * find /var/backups/plantshop -name 'db-*.sql.gz' -mtime +14 -delete
```

(Покладіть креденшали в `~/.my.cnf` користувача `plantshop` з правами 600.)

### 9.2. Медіафайли (`backend/uploads`, щодня о 03:20)

```cron
20 3 * * * tar -czf /var/backups/plantshop/uploads-$(date +\%F).tar.gz -C /srv/plantshop/app/backend uploads
30 3 * * * find /var/backups/plantshop -name 'uploads-*.tar.gz' -mtime +14 -delete
```

### 9.3. Операційний ризик локального файлового сховища

Медіа зберігаються **локально** у `backend/uploads` (це runtime-дані, не код):

- при переїзді на інший сервер цю директорію треба переносити разом із базою;
- горизонтальне масштабування бекенда на кілька машин неможливе без спільного сховища (NFS/S3) — це свідоме обмеження поточної архітектури;
- деплой/оновлення коду не повинні чистити чи перезаписувати `backend/uploads` (при `git clean`/CI-артефактах виключайте її).

---

## 10. Оновлення версії застосунку

```bash
sudo -u plantshop bash -lc '
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
cd /srv/plantshop/app
git pull
cd backend && npm ci && npx prisma migrate deploy && npm run build
cd ../frontend && npm ci && npm run build
'
# PM2:
sudo -u plantshop bash -lc 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && pm2 restart plantshop-backend plantshop-frontend'
# або systemd:
sudo systemctl restart plantshop-backend plantshop-frontend
```

> Увага: міграція `20260609113000_secure_refresh_token_lifecycle` (якщо застосовується вперше на старій базі) навмисно інвалідовує всі наявні refresh-сесії — користувачам доведеться увійти знову. Дані не втрачаються.
