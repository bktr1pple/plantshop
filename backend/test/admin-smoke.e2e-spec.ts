import './jest.setup';

import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
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
  const password = 'SmokePass123!';
  let hadSiteSettingsInitially = false;
  let originalSiteName = 'Plant Shop';
  let httpServer: HttpServer;
  let bootstrapped = false;

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
        data: {},
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
      },
    });

    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Smoke User',
        role: 'USER',
      },
    });
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
    } finally {
      jest.restoreAllMocks();

      if (app) {
        await app.close();
      }
    }
  });

  async function loginAs(agent: Agent, email: string, rawPassword: string) {
    const res = await agent.post('/auth/login').send({
      email,
      password: rawPassword,
      captchaToken: 'real-stack-smoke',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });

    const setCookieHeader = res.headers['set-cookie'];
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
});
