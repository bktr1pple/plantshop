import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 3201);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:3200';

function createInitialSettings() {
  return {
    id: 1,
    siteName: 'PlantShop',
    siteTagline: 'PlantShop — турбота про ваш зелений простір',
    heroTitleLine1: 'Природа',
    heroTitleLine2: 'у сучасному',
    heroTitleLine3: 'дизайні',
    heroSubtitle:
      'Ексклюзивні рослини, професійний догляд та авторські рішення для створення ідеального простору',
    heroPrimaryCtaLabel: 'До каталогу',
    heroPrimaryCtaHref: '/plants',
    contactIntro:
      'Маєте запитання щодо рослин, замовлення або догляду? Напишіть нам — і ми допоможемо підібрати ідеальні рослини саме для вашого простору.',
    footerDescription:
      'Створюємо зелені простори, які надихають. Преміальні рослини, професійний догляд та індивідуальний підхід до кожного клієнта.',
    footerCtaLabel: "Зв'язатися з нами",
    footerCtaHref: '/contact',
    contactPhoneDisplay: '+38 (067) 123-45-67',
    contactPhoneHref: 'tel:+380671234567',
    contactEmail: 'hello@plantshop.ua',
    contactAddress: 'м. Київ, вул. Зелена, 123',
    showroomHours: 'Пн–Пт: 09:00–18:00\nСб: 10:00–16:00',
    messengerLabel: 'Telegram / Viber',
    messengerUrl: '#',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
  };
}

function createInitialPlants() {
  return [
    {
      id: 1,
      name: 'Монстера Деліціоза',
      description: 'Велика декоративна рослина для світлих просторів.',
      price: 199,
      images: [],
      createdAt: '2026-03-23T09:00:00.000Z',
      updatedAt: '2026-03-23T09:00:00.000Z',
    },
    {
      id: 2,
      name: 'Фікус Лірата',
      description: 'Структурна рослина для дому та офісу.',
      price: 249,
      images: [],
      createdAt: '2026-03-22T12:00:00.000Z',
      updatedAt: '2026-03-22T12:00:00.000Z',
    },
  ];
}

function createState() {
  return {
    nextPlantId: 3,
    plants: createInitialPlants(),
    settings: createInitialSettings(),
    mediaItems: [],
  };
}

let state = createState();

function resetState() {
  state = createState();
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');
        if (separatorIndex === -1) {
          return [part, ''];
        }

        return [
          decodeURIComponent(part.slice(0, separatorIndex)),
          decodeURIComponent(part.slice(separatorIndex + 1)),
        ];
      }),
  );
}

function getSessionUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.refresh_token || cookies.access_token;

  if (token === 'admin-session') {
    return {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    };
  }

  if (token === 'user-session') {
    return {
      id: 2,
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
    };
  }

  return null;
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = new Set([
    FRONTEND_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Cookie',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PATCH,DELETE,OPTIONS',
  );
}

function sendJson(req, res, statusCode, payload) {
  setCorsHeaders(req, res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) {
    return null;
  }

  return JSON.parse(raw);
}

function unauthorized(req, res) {
  sendJson(req, res, 401, { message: 'Unauthorized' });
}

function forbidden(req, res) {
  sendJson(req, res, 403, { message: 'Forbidden' });
}

function requireAdmin(req, res) {
  const user = getSessionUser(req);
  if (!user) {
    unauthorized(req, res);
    return null;
  }

  if (user.role !== 'ADMIN') {
    forbidden(req, res);
    return null;
  }

  return user;
}

function parsePlantId(pathname) {
  const match = pathname.match(/^\/plants\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function normalizePlant(input, currentPlant) {
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const price = Number(input?.price);
  const description =
    typeof input?.description === 'string' ? input.description.trim() : '';
  const images = Array.isArray(input?.images)
    ? input.images.filter((item) => typeof item === 'string')
    : [];

  if (!name) {
    return { error: 'Назва рослини є обов’язковою.' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Вкажіть коректну невід’ємну ціну.' };
  }

  const now = new Date().toISOString();

  return {
    plant: {
      id: currentPlant?.id ?? state.nextPlantId++,
      name,
      description: description || null,
      price,
      images,
      createdAt: currentPlant?.createdAt ?? now,
      updatedAt: now,
    },
  };
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(req, res, 404, { message: 'Not found' });
    return;
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/__e2e/health') {
    sendJson(req, res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/__e2e/reset') {
    resetState();
    sendJson(req, res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/auth/me') {
    const user = getSessionUser(req);
    if (!user) {
      unauthorized(req, res);
      return;
    }

    sendJson(req, res, 200, { user });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/auth/logout') {
    setCorsHeaders(req, res);
    res.setHeader(
      'Set-Cookie',
      'refresh_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/plants') {
    sendJson(req, res, 200, state.plants);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/plants') {
    if (!requireAdmin(req, res)) {
      return;
    }

    const body = await readJsonBody(req);
    const result = normalizePlant(body);
    if ('error' in result) {
      sendJson(req, res, 400, { message: result.error });
      return;
    }

    state.plants.unshift(result.plant);
    sendJson(req, res, 201, result.plant);
    return;
  }

  const plantId = parsePlantId(url.pathname);
  if (plantId !== null && req.method === 'PATCH') {
    if (!requireAdmin(req, res)) {
      return;
    }

    const currentPlant = state.plants.find((plant) => plant.id === plantId);
    if (!currentPlant) {
      sendJson(req, res, 404, { message: 'Plant not found' });
      return;
    }

    const body = await readJsonBody(req);
    const result = normalizePlant(body, currentPlant);
    if ('error' in result) {
      sendJson(req, res, 400, { message: result.error });
      return;
    }

    state.plants = state.plants.map((plant) =>
      plant.id === plantId ? result.plant : plant,
    );
    sendJson(req, res, 200, result.plant);
    return;
  }

  if (plantId !== null && req.method === 'DELETE') {
    if (!requireAdmin(req, res)) {
      return;
    }

    state.plants = state.plants.filter((plant) => plant.id !== plantId);
    sendJson(req, res, 200, { deleted: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/admin/media') {
    if (!requireAdmin(req, res)) {
      return;
    }

    const collection = url.searchParams.get('collection');
    const items =
      collection && collection !== 'all'
        ? state.mediaItems.filter((item) => item.collection === collection)
        : state.mediaItems;
    sendJson(req, res, 200, { items });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/site-settings/public') {
    sendJson(req, res, 200, state.settings);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/site-settings') {
    if (!requireAdmin(req, res)) {
      return;
    }

    sendJson(req, res, 200, state.settings);
    return;
  }

  if (req.method === 'PATCH' && url.pathname === '/site-settings') {
    if (!requireAdmin(req, res)) {
      return;
    }

    const body = (await readJsonBody(req)) ?? {};
    state.settings = {
      ...state.settings,
      ...body,
    };
    sendJson(req, res, 200, state.settings);
    return;
  }

  sendJson(req, res, 404, { message: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(
    `Mock backend listening on http://127.0.0.1:${PORT}\n`,
  );
});
