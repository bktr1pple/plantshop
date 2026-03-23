import type { APIRequestContext, BrowserContext } from '@playwright/test';

export const E2E_FRONTEND_ORIGIN = 'http://127.0.0.1:3200';
export const E2E_BACKEND_ORIGIN = 'http://127.0.0.1:3201';

type SessionRole = 'admin' | 'user' | 'anonymous';

const sessionTokens: Record<Exclude<SessionRole, 'anonymous'>, string> = {
  admin: 'admin-session',
  user: 'user-session',
};

export async function resetMockBackend(request: APIRequestContext) {
  const response = await request.post(`${E2E_BACKEND_ORIGIN}/__e2e/reset`);
  if (!response.ok()) {
    throw new Error(`Не вдалося скинути mock backend: ${response.status()}`);
  }
}

export async function setSessionRole(
  context: BrowserContext,
  role: SessionRole,
) {
  await context.clearCookies();

  if (role === 'anonymous') {
    return;
  }

  await context.addCookies([
    {
      name: 'refresh_token',
      value: sessionTokens[role],
      url: E2E_FRONTEND_ORIGIN,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
