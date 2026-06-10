import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithRefresh } from './fetchWithRefresh';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('fetchWithRefresh', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('повторює GET після успішного відновлення сесії через /auth/me', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({
          user: {
            id: 1,
            email: 'user@example.com',
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: 1,
            totalAmount: 120,
          },
        ]),
      );

    const result = await fetchWithRefresh('/orders/me');

    expect(result.unauthorized).toBe(false);
    expect(result.temporaryFailure).toBe(false);
    expect(await result.res?.json()).toEqual([
      {
        id: 1,
        totalAmount: 120,
      },
    ]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/orders/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/auth/me',
      expect.objectContaining({
        credentials: 'include',
        cache: 'no-store',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3001/orders/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });

  it('не повторює POST, щоб не створювати дубль замовлення після мережевого збою', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(
        jsonResponse({
          user: {
            id: 1,
            email: 'user@example.com',
          },
        }),
      );

    const result = await fetchWithRefresh('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Іван',
      }),
    });

    expect(result.unauthorized).toBe(false);
    expect(result.temporaryFailure).toBe(true);
    expect(result.res).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/orders',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/auth/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });

  it('повторює POST після підтвердженого відновлення сесії через /auth/me', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({
          user: {
            id: 1,
            email: 'user@example.com',
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 77,
          status: 'PENDING',
        }),
      );

    const result = await fetchWithRefresh('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Іван',
        customerPhone: '+380501112233',
        deliveryAddress: 'Львів',
        items: [{ plantId: 1, quantity: 1 }],
      }),
    });

    expect(result.unauthorized).toBe(false);
    expect(result.temporaryFailure).toBe(false);
    expect(await result.res?.json()).toEqual({
      id: 77,
      status: 'PENDING',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/orders',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/auth/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3001/orders',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('повертає unauthorized, коли /auth/me підтверджує відсутню сесію', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 401 }));

    const result = await fetchWithRefresh('/orders/me/17');

    expect(result.unauthorized).toBe(true);
    expect(result.temporaryFailure).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('виконує лише одну auth recovery перевірку для паралельних 401', async () => {
    const fetchMock = vi.mocked(global.fetch);
    let resolveAuthCheck: ((response: Response) => void) | undefined;
    const authCheck = new Promise<Response>((resolve) => {
      resolveAuthCheck = resolve;
    });

    fetchMock.mockImplementation((input) => {
      const url = String(input);

      if (url.endsWith('/auth/me')) {
        return authCheck;
      }

      const orderCalls = fetchMock.mock.calls.filter(([calledInput]) =>
        String(calledInput).includes('/orders/me'),
      ).length;

      if (orderCalls <= 2) {
        return Promise.resolve(new Response('', { status: 401 }));
      }

      return Promise.resolve(jsonResponse([]));
    });

    const firstRequest = fetchWithRefresh('/orders/me');
    const secondRequest = fetchWithRefresh('/orders/me');

    await vi.waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([input]) =>
          String(input).endsWith('/auth/me'),
        ),
      ).toHaveLength(1);
    });

    resolveAuthCheck?.(
      jsonResponse({
        user: {
          id: 1,
          email: 'user@example.com',
        },
      }),
    );

    const [firstResult, secondResult] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(firstResult.res?.ok).toBe(true);
    expect(secondResult.res?.ok).toBe(true);
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).endsWith('/auth/me'),
      ),
    ).toHaveLength(1);
  });

  it('не робить повторну сесійну перевірку для auth endpoint', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));

    const result = await fetchWithRefresh('/auth/me');

    expect(result.unauthorized).toBe(true);
    expect(result.temporaryFailure).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
