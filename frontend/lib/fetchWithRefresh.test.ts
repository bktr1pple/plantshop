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

  it('не робить повторну сесійну перевірку для auth endpoint', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));

    const result = await fetchWithRefresh('/auth/me');

    expect(result.unauthorized).toBe(true);
    expect(result.temporaryFailure).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
