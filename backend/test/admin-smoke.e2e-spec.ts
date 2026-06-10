import './jest.setup';

import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import type { SendMailInput } from '../src/mail/mail.service';
import { MailService } from '../src/mail/mail.service';
import { PrismaService } from '../src/prisma/prisma.service';

const runRealStackSmoke = process.env.RUN_REAL_STACK_SMOKE === '1';
const describeRealStackSmoke = runRealStackSmoke ? describe : describe.skip;
type HttpServer = Parameters<typeof request>[0];
type Agent = ReturnType<typeof request.agent>;
type AuthMeResponse = {
  user: {
    email: string;
    role: 'ADMIN' | 'USER';
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    bio?: string | null;
    emailNotifications?: boolean;
    orderUpdates?: boolean;
    careReminders?: boolean;
    promotional?: boolean;
    profileVisibility?: 'public' | 'friends' | 'private';
    dataSharing?: boolean;
    personalizedAds?: boolean;
  };
};
type SiteSettingsResponse = {
  siteName: string;
};
type OrderSummaryResponse = {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  itemCount: number;
};
type OrderDetailResponse = OrderSummaryResponse & {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  note: string | null;
  items: Array<{
    plantId: number | null;
    plantName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};
type LoginResponseBody =
  | { status: 'ok' }
  | {
      status: 'verification_required';
      email: string;
      waitSeconds?: number;
      message: string;
    }
  | {
      status: 'challenge_required';
      email: string;
      challengeId: number;
      waitSeconds?: number;
      message: string;
    }
  | {
      status: 'error';
      message: string;
    };

function isRecaptchaRequest(input: unknown): boolean {
  if (typeof input === 'string') {
    return input === 'https://www.google.com/recaptcha/api/siteverify';
  }

  if (input instanceof URL) {
    return (
      input.toString() === 'https://www.google.com/recaptcha/api/siteverify'
    );
  }

  if (input instanceof Request) {
    return input.url === 'https://www.google.com/recaptcha/api/siteverify';
  }

  return false;
}

describeRealStackSmoke('Admin real-stack smoke', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminEmail: string;
  let userEmail: string;
  let plantId: number;
  const password = 'SmokePass123!';
  let hadSiteSettingsInitially = false;
  let originalSiteName = 'Plant Shop';
  let httpServer: HttpServer;
  let bootstrapped = false;
  const sentMails: SendMailInput[] = [];

  function createSmokePreconditionError(cause: unknown): Error {
    const databaseUrl =
      process.env.DATABASE_URL?.replace(/:[^:@/]+@/, ':***@') ?? 'undefined';

    const details =
      cause instanceof Error ? cause.message : 'Unknown bootstrap error';

    return new Error(
      [
        'Real-stack smoke не зміг підняти Nest + Prisma.',
        `DATABASE_URL: ${databaseUrl}`,
        `Причина: ${details}`,
        'Перевір локальну test DB, користувача, пароль і доступ до бази перед RUN_REAL_STACK_SMOKE=1.',
      ].join(' '),
    );
  }

  beforeAll(async () => {
    const originalFetch = global.fetch;
    const createCookieParser = cookieParser as unknown as () => RequestHandler;

    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (isRecaptchaRequest(input)) {
        return {
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        } as Response;
      }

      return originalFetch(input, init);
    });
    jest
      .spyOn(MailService.prototype, 'sendMail')
      .mockImplementation((input) => {
        sentMails.push(input);
        return Promise.resolve();
      });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(createCookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    try {
      await app.init();
      httpServer = app.getHttpServer() as HttpServer;
      prisma = moduleRef.get(PrismaService);
      bootstrapped = true;
    } catch (error) {
      jest.restoreAllMocks();

      if (app) {
        await app.close().catch(() => undefined);
      }

      throw createSmokePreconditionError(error);
    }

    const currentSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { siteName: true },
    });

    hadSiteSettingsInitially = currentSettings !== null;
    originalSiteName = currentSettings?.siteName ?? originalSiteName;

    if (!currentSettings) {
      await prisma.siteSettings.create({
        data: {
          heroSubtitle:
            'Тестові налаштування для smoke-перевірки адміністративного API.',
          contactIntro:
            'Напишіть команді PlantShop, щоб узгодити деталі замовлення.',
          footerDescription:
            'PlantShop допомагає підібрати рослини для дому та офісу.',
          showroomHours: 'Пн-Пт: 10:00-18:00',
        },
      });
    }

    const suffix = Date.now().toString();
    adminEmail = `admin.smoke.${suffix}@example.com`;
    userEmail = `user.smoke.${suffix}@example.com`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Smoke Admin',
        role: 'ADMIN',
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Smoke User',
        role: 'USER',
        emailVerifiedAt: new Date(),
      },
    });

    const plant = await prisma.plant.create({
      data: {
        name: 'Smoke Monstera',
        description: 'Smoke order plant',
        price: 149.5,
        images: '["http://localhost:3001/uploads/plants/smoke-monstera.png"]',
      },
    });
    plantId = plant.id;
  });

  afterAll(async () => {
    if (!bootstrapped) {
      jest.restoreAllMocks();
      return;
    }

    try {
      await prisma.siteSettings.update({
        where: { id: 1 },
        data: { siteName: originalSiteName },
      });

      if (!hadSiteSettingsInitially) {
        await prisma.siteSettings.delete({
          where: { id: 1 },
        });
      }

      await prisma.user.deleteMany({
        where: {
          email: { in: [adminEmail, userEmail] },
        },
      });

      if (plantId) {
        await prisma.plant.deleteMany({
          where: { id: plantId },
        });
      }
    } finally {
      jest.restoreAllMocks();

      if (app) {
        await app.close();
      }
    }
  });

  async function loginAs(agent: Agent, email: string, rawPassword: string) {
    const initialResponse = await agent.post('/auth/login').send({
      email,
      password: rawPassword,
      captchaToken: 'real-stack-smoke',
    });

    const response = await completeLoginIfNeeded(agent, email, initialResponse);

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual({ status: 'ok' });

    const setCookieHeader = response.headers['set-cookie'];
    const setCookie: string[] = Array.isArray(setCookieHeader)
      ? setCookieHeader.filter(
          (cookie): cookie is string => typeof cookie === 'string',
        )
      : [];
    expect(setCookie.some((cookie) => cookie.startsWith('access_token='))).toBe(
      true,
    );
    expect(
      setCookie.some((cookie) => cookie.startsWith('refresh_token=')),
    ).toBe(true);
    expect(
      setCookie.some((cookie) => cookie.startsWith('trusted_login=')),
    ).toBe(true);
  }

  function getLatestMail(to: string, subject: string): SendMailInput {
    const mail = [...sentMails]
      .reverse()
      .find((item) => item.to === to && item.subject === subject);

    expect(mail).toBeDefined();
    return mail!;
  }

  function extractTokenFromMail(text: string, path: string): string {
    const line = text
      .split('\n')
      .map((value) => value.trim())
      .find((value) => value.includes(path));

    expect(line).toBeDefined();

    const url = new URL(line!);
    const token = url.searchParams.get('token');

    expect(token).toBeTruthy();
    return token!;
  }

  function extractLoginCode(text: string): string {
    const match = text.match(/\b(\d{6})\b/);

    expect(match).not.toBeNull();
    return match![1];
  }

  async function completeLoginIfNeeded(
    agent: Agent,
    email: string,
    response: request.Response,
  ): Promise<request.Response> {
    const body = response.body as LoginResponseBody;

    if (body?.status === 'verification_required') {
      const verifyMail = getLatestMail(
        email,
        'Підтвердження email для PlantShop',
      );
      const token = extractTokenFromMail(verifyMail.text, '/verify-email');
      const verifyResponse = await request(httpServer)
        .post('/auth/verify-email')
        .send({
          token,
        });

      expect([200, 201]).toContain(verifyResponse.status);
      expect(verifyResponse.body).toMatchObject({
        status: 'ok',
        email,
      });

      const retriedLogin = await agent.post('/auth/login').send({
        email,
        password,
        captchaToken: 'real-stack-smoke',
      });

      return completeLoginIfNeeded(agent, email, retriedLogin);
    }

    if (body?.status === 'challenge_required') {
      const challengeMail = getLatestMail(
        email,
        'Код підтвердження входу PlantShop',
      );
      const code = extractLoginCode(challengeMail.text);
      const challengeResponse = await agent
        .post('/auth/login-challenge/verify')
        .send({
          challengeId: body.challengeId,
          code,
        });

      return challengeResponse;
    }

    return response;
  }

  async function createOrderAs(agent: Agent) {
    const res = await agent.post('/orders').send({
      customerName: 'Smoke User',
      customerPhone: '+380501112233',
      deliveryAddress: 'Львів, відділення 3',
      note: 'Подзвоніть перед доставкою',
      items: [
        {
          plantId,
          quantity: 2,
        },
      ],
    });

    expect([200, 201]).toContain(res.status);
    return res.body as OrderDetailResponse;
  }

  it('ADMIN може увійти, пройти /auth/me і оновити site settings через реальні cookies', async () => {
    const agent = request.agent(httpServer);
    await loginAs(agent, adminEmail, password);

    const meRes = await agent.get('/auth/me');
    expect(meRes.status).toBe(200);
    const meBody = meRes.body as AuthMeResponse;
    expect(meBody.user).toMatchObject({
      email: adminEmail,
      role: 'ADMIN',
    });

    const siteName = `Smoke site ${Date.now()}`;

    const patchRes = await agent.patch('/site-settings').send({
      siteName,
    });

    expect(patchRes.status).toBe(200);
    const patchBody = patchRes.body as SiteSettingsResponse;
    expect(patchBody.siteName).toBe(siteName);

    const publicRes = await request(httpServer).get('/site-settings/public');
    expect(publicRes.status).toBe(200);
    const publicBody = publicRes.body as SiteSettingsResponse;
    expect(publicBody.siteName).toBe(siteName);

    const persistedSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: { siteName: true },
    });
    expect(persistedSettings?.siteName).toBe(siteName);
  });

  it('USER з реальною сесією не може оновити site settings', async () => {
    const agent = request.agent(httpServer);
    await loginAs(agent, userEmail, password);

    const patchRes = await agent.patch('/site-settings').send({
      siteName: 'Should not be saved',
    });

    expect(patchRes.status).toBe(403);
  });

  it('logout відкликає реальну сесію: після logout /auth/me більше недоступний', async () => {
    const agent = request.agent(httpServer);
    await loginAs(agent, userEmail, password);

    const beforeLogoutMe = await agent.get('/auth/me');
    expect(beforeLogoutMe.status).toBe(200);

    const persistedBeforeLogout = await prisma.refreshToken.count({
      where: {
        user: {
          email: userEmail,
        },
      },
    });
    expect(persistedBeforeLogout).toBeGreaterThan(0);

    const logoutRes = await agent.post('/auth/logout');
    expect([200, 201]).toContain(logoutRes.status);
    expect(logoutRes.body).toEqual({ status: 'ok' });

    const setCookieHeader = logoutRes.headers['set-cookie'];
    const setCookie: string[] = Array.isArray(setCookieHeader)
      ? setCookieHeader.filter(
          (cookie): cookie is string => typeof cookie === 'string',
        )
      : [];
    expect(setCookie.some((cookie) => cookie.startsWith('access_token='))).toBe(
      true,
    );
    expect(
      setCookie.some((cookie) => cookie.startsWith('refresh_token=')),
    ).toBe(true);

    const afterLogoutMe = await agent.get('/auth/me');
    expect(afterLogoutMe.status).toBe(401);

    const persistedAfterLogout = await prisma.refreshToken.count({
      where: {
        user: {
          email: userEmail,
        },
      },
    });
    expect(persistedAfterLogout).toBeLessThan(persistedBeforeLogout);
  });

  it('USER може оновити власні account settings через /auth/me і бачить persisted дані', async () => {
    const agent = request.agent(httpServer);
    await loginAs(agent, userEmail, password);

    const patchRes = await agent.patch('/auth/me').send({
      name: 'Updated Smoke User',
      phone: '+380501112233',
      address: 'Львів',
      bio: 'Люблю фікуси',
      emailNotifications: true,
      orderUpdates: false,
      careReminders: true,
      promotional: true,
      profileVisibility: 'private',
      dataSharing: true,
      personalizedAds: true,
    });

    expect(patchRes.status).toBe(200);
    const patchBody = patchRes.body as AuthMeResponse;
    expect(patchBody.user).toMatchObject({
      email: userEmail,
      role: 'USER',
      name: 'Updated Smoke User',
      phone: '+380501112233',
      address: 'Львів',
      bio: 'Люблю фікуси',
      emailNotifications: true,
      orderUpdates: false,
      careReminders: true,
      promotional: true,
      profileVisibility: 'private',
      dataSharing: true,
      personalizedAds: true,
    });

    const meRes = await agent.get('/auth/me');
    expect(meRes.status).toBe(200);
    const meBody = meRes.body as AuthMeResponse;
    expect(meBody.user).toMatchObject({
      email: userEmail,
      name: 'Updated Smoke User',
      phone: '+380501112233',
      orderUpdates: false,
      profileVisibility: 'private',
      personalizedAds: true,
    });

    const persistedUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        name: true,
        phone: true,
        address: true,
        bio: true,
        emailNotifications: true,
        orderUpdates: true,
        careReminders: true,
        promotional: true,
        profileVisibility: true,
        dataSharing: true,
        personalizedAds: true,
      },
    });

    expect(persistedUser).toMatchObject({
      name: 'Updated Smoke User',
      phone: '+380501112233',
      address: 'Львів',
      bio: 'Люблю фікуси',
      emailNotifications: true,
      orderUpdates: false,
      careReminders: true,
      promotional: true,
      profileVisibility: 'private',
      dataSharing: true,
      personalizedAds: true,
    });
  });

  it('USER може створити реальне замовлення та побачити його у власній історії', async () => {
    const agent = request.agent(httpServer);
    await loginAs(agent, userEmail, password);

    const createdOrder = await createOrderAs(agent);
    expect(createdOrder).toMatchObject({
      customerEmail: userEmail,
      customerName: 'Smoke User',
      customerPhone: '+380501112233',
      deliveryAddress: 'Львів, відділення 3',
      totalAmount: 299,
      itemCount: 1,
      status: 'PENDING',
      items: [
        expect.objectContaining({
          plantId,
          plantName: 'Smoke Monstera',
          quantity: 2,
          unitPrice: 149.5,
          lineTotal: 299,
        }),
      ],
    });

    const listRes = await agent.get('/orders/me');
    expect(listRes.status).toBe(200);
    const listBody = listRes.body as OrderSummaryResponse[];
    expect(listBody.some((order) => order.id === createdOrder.id)).toBe(true);

    const detailRes = await agent.get(`/orders/me/${createdOrder.id}`);
    expect(detailRes.status).toBe(200);
    const detailBody = detailRes.body as OrderDetailResponse;
    expect(detailBody).toMatchObject({
      id: createdOrder.id,
      customerEmail: userEmail,
      totalAmount: 299,
    });

    const persistedOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      select: {
        user: {
          select: {
            email: true,
          },
        },
        totalAmount: true,
        items: {
          select: {
            plantId: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
    });

    expect(persistedOrder).toMatchObject({
      user: {
        email: userEmail,
      },
      totalAmount: 299,
      items: [
        {
          plantId,
          quantity: 2,
          lineTotal: 299,
        },
      ],
    });
  });

  it('ADMIN може переглядати замовлення та оновлювати їхній статус', async () => {
    const userAgent = request.agent(httpServer);
    await loginAs(userAgent, userEmail, password);
    const createdOrder = await createOrderAs(userAgent);

    const adminAgent = request.agent(httpServer);
    await loginAs(adminAgent, adminEmail, password);

    const adminListRes = await adminAgent.get('/orders/admin');
    expect(adminListRes.status).toBe(200);
    const adminList = adminListRes.body as OrderSummaryResponse[];
    expect(adminList.some((order) => order.id === createdOrder.id)).toBe(true);

    const adminDetailRes = await adminAgent.get(
      `/orders/admin/${createdOrder.id}`,
    );
    expect(adminDetailRes.status).toBe(200);
    const adminDetail = adminDetailRes.body as OrderDetailResponse;
    expect(adminDetail).toMatchObject({
      id: createdOrder.id,
      customerEmail: userEmail,
      status: 'PENDING',
    });

    const updateRes = await adminAgent
      .patch(`/orders/admin/${createdOrder.id}`)
      .send({
        status: 'SHIPPED',
      });
    expect(updateRes.status).toBe(200);
    const updatedBody = updateRes.body as OrderDetailResponse;
    expect(updatedBody.status).toBe('SHIPPED');

    const persistedOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      select: { status: true },
    });
    expect(persistedOrder?.status).toBe('SHIPPED');
  });
});
