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
    authUnavailable: false,
    nextPlantId: 3,
    nextOrderId: 2,
    plants: createInitialPlants(),
    settings: createInitialSettings(),
    mediaItems: [],
    sessions: {
      'admin-session': createUserSession({
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        phone: '+380671234567',
        address: 'Київ, адміністративний офіс',
        bio: 'Керую магазином PlantShop.',
        role: 'ADMIN',
      }),
      'user-session': createUserSession({
        id: 2,
        email: 'user@example.com',
        name: 'Regular User',
        phone: '+380501112233',
        address: 'Львів, відділення 3',
        bio: 'Люблю монстери та фікуси.',
        role: 'USER',
      }),
    },
    orders: [
      createOrderRecord({
        id: 1,
        userId: 1,
        status: 'PENDING',
        customerName: 'Admin User',
        customerEmail: 'admin@example.com',
        customerPhone: '+380671234567',
        deliveryAddress: 'Київ, адміністративний офіс',
        note: 'Seeded admin order for cabinet smoke tests',
        totalAmount: 398,
        items: [
          {
            id: 1,
            plantId: 1,
            plantName: 'Монстера Деліціоза',
            plantImage: null,
            unitPrice: 199,
            quantity: 2,
            lineTotal: 398,
            createdAt: '2026-03-23T09:30:00.000Z',
          },
        ],
        createdAt: '2026-03-23T09:30:00.000Z',
        updatedAt: '2026-03-23T09:30:00.000Z',
      }),
    ],
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

function createUserSession(user) {
  return {
    ...user,
    emailNotifications: true,
    orderUpdates: true,
    careReminders: true,
    promotional: false,
    profileVisibility: 'friends',
    dataSharing: false,
    personalizedAds: false,
  };
}

function createOrderRecord(order) {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies.refresh_token || cookies.access_token || null;
}

function getSessionUser(req) {
  const token = getSessionToken(req);

  if (!token) {
    return null;
  }

  return state.sessions[token] ?? null;
}

function getSessionUserOrNull(req) {
  return getSessionUser(req);
}

function serializeOrderSummary(order) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    note: order.note,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function serializeOrderDetail(order) {
  return {
    ...serializeOrderSummary(order),
    items: order.items.map((item) => ({ ...item })),
  };
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeRequiredString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getPlantById(plantId) {
  return state.plants.find((plant) => plant.id === plantId) ?? null;
}

function toOrderResponse(order) {
  return serializeOrderDetail(order);
}

function getOrdersForUser(userId) {
  return state.orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.id - a.id)
    .map((order) => serializeOrderSummary(order));
}

function findOrderForUser(userId, orderId) {
  return state.orders.find(
    (order) => order.id === orderId && order.userId === userId,
  );
}

function findOrderById(orderId) {
  return state.orders.find((order) => order.id === orderId) ?? null;
}

function createOrderFromBody(user, body) {
  const customerName = normalizeRequiredString(body?.customerName);
  const customerPhone = normalizeRequiredString(body?.customerPhone);
  const deliveryAddress = normalizeRequiredString(body?.deliveryAddress);
  const note = normalizeOptionalString(body?.note);
  const items = Array.isArray(body?.items) ? body.items : null;

  if (!customerName) {
    return { error: 'Ім’я отримувача є обов’язковим.' };
  }

  if (!customerPhone) {
    return { error: 'Телефон отримувача є обов’язковим.' };
  }

  if (!deliveryAddress) {
    return { error: 'Адреса доставки є обов’язковою.' };
  }

  if (!items || items.length === 0) {
    return { error: 'Кошик порожній.' };
  }

  const normalizedItems = [];
  const merged = new Map();

  for (const rawItem of items) {
    const plantId = Number(rawItem?.plantId);
    const quantity = Number(rawItem?.quantity);

    if (!Number.isInteger(plantId) || plantId <= 0) {
      return { error: 'Некоректний товар у кошику.' };
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Некоректна кількість у кошику.' };
    }

    merged.set(plantId, (merged.get(plantId) ?? 0) + quantity);
  }

  for (const [plantId, quantity] of merged.entries()) {
    const plant = getPlantById(plantId);
    if (!plant) {
      return { error: `Plant with id ${plantId} not found` };
    }

    const plantImage = Array.isArray(plant.images) ? plant.images[0] ?? null : null;
    const unitPrice = plant.price;
    const lineTotal = unitPrice * quantity;

    normalizedItems.push({
      id: normalizedItems.length + 1,
      plantId,
      plantName: plant.name,
      plantImage,
      unitPrice,
      quantity,
      lineTotal,
      createdAt: new Date().toISOString(),
    });
  }

  const now = new Date().toISOString();
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const order = createOrderRecord({
    id: state.nextOrderId++,
    userId: user.id,
    status: 'PENDING',
    customerName,
    customerEmail: user.email,
    customerPhone,
    deliveryAddress,
    note,
    totalAmount,
    items: normalizedItems,
    createdAt: now,
    updatedAt: now,
  });

  state.orders.unshift(order);

  return { order };
}

function unauthorized(req, res) {
  sendJson(req, res, 401, { message: 'Unauthorized' });
}

function unavailable(req, res) {
  sendJson(req, res, 503, { message: 'Auth temporarily unavailable' });
}

function forbidden(req, res) {
  sendJson(req, res, 403, { message: 'Forbidden' });
}

function requireUser(req, res) {
  const user = getSessionUserOrNull(req);

  if (!user) {
    unauthorized(req, res);
    return null;
  }

  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) {
    return null;
  }

  if (user.role !== 'ADMIN') {
    forbidden(req, res);
    return null;
  }

  return user;
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

  if (req.method === 'POST' && url.pathname === '/__e2e/config') {
    const body = (await readJsonBody(req)) ?? {};

    if (typeof body.authUnavailable === 'boolean') {
      state.authUnavailable = body.authUnavailable;
    }

    sendJson(req, res, 200, {
      ok: true,
      authUnavailable: state.authUnavailable,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/auth/me') {
    const user = getSessionUser(req);
    if (state.authUnavailable) {
      unavailable(req, res);
      return;
    }

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
      [
        'refresh_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
        'access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
      ],
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'PATCH' && url.pathname === '/auth/me') {
    if (state.authUnavailable) {
      unavailable(req, res);
      return;
    }

    const user = getSessionUser(req);
    if (!user) {
      unauthorized(req, res);
      return;
    }

    const body = (await readJsonBody(req)) ?? {};
    const normalizedName =
      typeof body.name === 'string' ? body.name.trim() : undefined;
    const normalizedPhone =
      typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const normalizedAddress =
      typeof body.address === 'string' ? body.address.trim() : undefined;
    const normalizedBio =
      typeof body.bio === 'string' ? body.bio.trim() : undefined;

    const nextUser = {
      ...user,
      name: normalizedName !== undefined ? normalizedName || null : user.name,
      phone:
        normalizedPhone !== undefined ? normalizedPhone || null : user.phone,
      address:
        normalizedAddress !== undefined ? normalizedAddress || null : user.address,
      bio: normalizedBio !== undefined ? normalizedBio || null : user.bio,
      emailNotifications:
        typeof body.emailNotifications === 'boolean'
          ? body.emailNotifications
          : user.emailNotifications,
      orderUpdates:
        typeof body.orderUpdates === 'boolean'
          ? body.orderUpdates
          : user.orderUpdates,
      careReminders:
        typeof body.careReminders === 'boolean'
          ? body.careReminders
          : user.careReminders,
      promotional:
        typeof body.promotional === 'boolean' ? body.promotional : user.promotional,
      profileVisibility:
        typeof body.profileVisibility === 'string' &&
        ['public', 'friends', 'private'].includes(body.profileVisibility)
          ? body.profileVisibility
          : user.profileVisibility,
      dataSharing:
        typeof body.dataSharing === 'boolean'
          ? body.dataSharing
          : user.dataSharing,
      personalizedAds:
        typeof body.personalizedAds === 'boolean'
          ? body.personalizedAds
          : user.personalizedAds,
    };

    state.sessions[getSessionToken(req)] = nextUser;

    sendJson(req, res, 200, {
      user: nextUser,
    });
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

  if (req.method === 'POST' && url.pathname === '/orders') {
    if (state.authUnavailable) {
      unavailable(req, res);
      return;
    }

    const user = requireUser(req, res);
    if (!user) {
      return;
    }

    const body = (await readJsonBody(req)) ?? {};
    const result = createOrderFromBody(user, body);

    if ('error' in result) {
      sendJson(req, res, 400, { message: result.error });
      return;
    }

    sendJson(req, res, 201, toOrderResponse(result.order));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/orders/me') {
    if (state.authUnavailable) {
      unavailable(req, res);
      return;
    }

    const user = requireUser(req, res);
    if (!user) {
      return;
    }

    sendJson(req, res, 200, getOrdersForUser(user.id));
    return;
  }

  const currentUserOrderMatch = url.pathname.match(/^\/orders\/me\/(\d+)$/);
  if (req.method === 'GET' && currentUserOrderMatch) {
    if (state.authUnavailable) {
      unavailable(req, res);
      return;
    }

    const user = requireUser(req, res);
    if (!user) {
      return;
    }

    const orderId = Number(currentUserOrderMatch[1]);
    const order = findOrderForUser(user.id, orderId);
    if (!order) {
      sendJson(req, res, 404, { message: `Order with id ${orderId} not found` });
      return;
    }

    sendJson(req, res, 200, serializeOrderDetail(order));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/orders/admin') {
    const user = requireAdmin(req, res);
    if (!user) {
      return;
    }

    sendJson(req, res, 200, state.orders.slice().sort((a, b) => b.id - a.id).map(serializeOrderSummary));
    return;
  }

  const adminOrderMatch = url.pathname.match(/^\/orders\/admin\/(\d+)$/);
  if (adminOrderMatch && req.method === 'GET') {
    const user = requireAdmin(req, res);
    if (!user) {
      return;
    }

    const orderId = Number(adminOrderMatch[1]);
    const order = findOrderById(orderId);
    if (!order) {
      sendJson(req, res, 404, { message: `Order with id ${orderId} not found` });
      return;
    }

    sendJson(req, res, 200, serializeOrderDetail(order));
    return;
  }

  if (adminOrderMatch && req.method === 'PATCH') {
    const user = requireAdmin(req, res);
    if (!user) {
      return;
    }

    const orderId = Number(adminOrderMatch[1]);
    const order = findOrderById(orderId);
    if (!order) {
      sendJson(req, res, 404, { message: `Order with id ${orderId} not found` });
      return;
    }

    const body = (await readJsonBody(req)) ?? {};
    if (
      !body.status ||
      !['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(
        body.status,
      )
    ) {
      sendJson(req, res, 400, { message: 'Invalid order status' });
      return;
    }

    order.status = body.status;
    order.updatedAt = new Date().toISOString();
    sendJson(req, res, 200, serializeOrderDetail(order));
    return;
  }

  sendJson(req, res, 404, { message: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(
    `Mock backend listening on http://127.0.0.1:${PORT}\n`,
  );
});
