import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  changePassword,
  forgotPassword,
  getSecurityErrorMessage,
  resetPassword,
  verifyEmail,
  verifyLoginChallenge,
} from './auth-security';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('auth-security client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('verifyEmail повертає success при валідному токені', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse({
        status: 'ok',
        message: 'Email успішно підтверджено. Тепер ви можете увійти.',
      }),
    );

    const result = await verifyEmail('a'.repeat(32));

    expect(result.success).toBe(true);
    expect(result.message).toContain('Email успішно підтверджено');
  });

  it('resetPassword мапить TOKEN_EXPIRED у distinct errorCode', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          error: 'TOKEN_EXPIRED',
          message: 'Термін дії токена минув.',
        },
        410,
      ),
    );

    const result = await resetPassword({
      token: 'a'.repeat(32),
      newPassword: 'new-password',
      confirmPassword: 'new-password',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('TOKEN_EXPIRED');
  });

  it('forgotPassword повертає нейтральний success message', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse({
        status: 'ok',
        message:
          'Якщо акаунт з таким email існує, інструкції для скидання пароля вже надіслані або були відправлені нещодавно.',
      }),
    );

    const result = await forgotPassword('user@example.com');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Якщо акаунт');
  });

  it('changePassword повертає TEMPORARILY_UNAVAILABLE при мережевій помилці', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network down'));

    const result = await changePassword({
      currentPassword: 'old-password',
      newPassword: 'new-password',
      confirmPassword: 'new-password',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('TEMPORARILY_UNAVAILABLE');
  });

  it('verifyLoginChallenge повертає success при валідному коді', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse({
        status: 'ok',
        message: 'Вхід підтверджено. Сесію відновлено.',
      }),
    );

    const result = await verifyLoginChallenge({
      challengeId: 17,
      code: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('getSecurityErrorMessage повертає distinct message для CODE_INVALID', () => {
    expect(getSecurityErrorMessage('CODE_INVALID', 'fallback')).toContain(
      'Код введено невірно',
    );
  });
});
