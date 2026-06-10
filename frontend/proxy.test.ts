import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import { proxy } from './proxy';

function createRequest(path: string, cookie = 'refresh_token=session') {
  const url = new URL(`http://localhost:3000${path}`);

  return {
    headers: new Headers({
      cookie,
      host: 'localhost:3000',
    }),
    nextUrl: url,
    url: url.toString(),
  } as unknown as NextRequest;
}

function createAuthResponse(user: { role: 'USER' | 'ADMIN' }) {
  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('frontend proxy protected routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('перенаправляє authenticated USER з /admin на сторінку forbidden', async () => {
    vi.mocked(fetch).mockResolvedValue(createAuthResponse({ role: 'USER' }));

    const response = await proxy(createRequest('/admin/plants'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/forbidden',
    );
  });

  it('залишає ADMIN на /admin маршрутах', async () => {
    vi.mocked(fetch).mockResolvedValue(createAuthResponse({ role: 'ADMIN' }));

    const response = await proxy(createRequest('/admin/orders'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
