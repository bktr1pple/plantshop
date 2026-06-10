const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type SecurityErrorCode =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_CONSUMED'
  | 'CODE_INVALID'
  | 'TOO_MANY_ATTEMPTS'
  | 'CURRENT_PASSWORD_INVALID'
  | 'PASSWORD_MISMATCH'
  | 'TEMPORARILY_UNAVAILABLE';

export interface SecurityFlowResult {
  success: boolean;
  message: string;
  errorCode?: SecurityErrorCode;
  waitSeconds?: number;
  email?: string;
  challengeId?: number;
}

type ResponsePayload = {
  status?: string;
  error?: SecurityErrorCode;
  message?: string | string[];
  waitSeconds?: number;
  email?: string;
  challengeId?: number;
};

function extractMessage(payload: ResponsePayload | null, fallback: string): string {
  const rawMessage = payload?.message;
  if (Array.isArray(rawMessage)) {
    return rawMessage[0] || fallback;
  }

  return rawMessage || fallback;
}

function mapTemporaryFailure(): SecurityFlowResult {
  return {
    success: false,
    errorCode: 'TEMPORARILY_UNAVAILABLE',
    message:
      'Сервіс тимчасово недоступний. Спробуйте ще раз трохи пізніше.',
  };
}

async function postSecurity(
  path: string,
  body: Record<string, unknown>,
  successMessage: string,
): Promise<SecurityFlowResult> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as
      | ResponsePayload
      | null;

    if (!response.ok) {
      if (response.status >= 500) {
        return mapTemporaryFailure();
      }

      return {
        success: false,
        errorCode: payload?.error,
        waitSeconds: payload?.waitSeconds,
        message: extractMessage(payload, 'Не вдалося виконати дію.'),
      };
    }

    return {
      success: true,
      message: extractMessage(payload, successMessage),
      waitSeconds: payload?.waitSeconds,
      email: payload?.email,
      challengeId: payload?.challengeId,
    };
  } catch {
    return mapTemporaryFailure();
  }
}

export function getSecurityErrorMessage(
  errorCode: SecurityErrorCode | undefined,
  fallback: string,
): string {
  switch (errorCode) {
    case 'TOKEN_INVALID':
      return 'Посилання або токен недійсні. Запросіть новий лист або код.';
    case 'TOKEN_EXPIRED':
      return 'Термін дії токена минув. Запросіть новий лист або код.';
    case 'TOKEN_CONSUMED':
      return 'Цей токен уже використано. Запросіть новий лист або код.';
    case 'CODE_INVALID':
      return 'Код введено невірно. Перевірте лист і спробуйте ще раз.';
    case 'TOO_MANY_ATTEMPTS':
      return 'Вичерпано ліміт спроб. Запросіть новий код і повторіть вхід.';
    case 'CURRENT_PASSWORD_INVALID':
      return 'Поточний пароль введено невірно.';
    case 'PASSWORD_MISMATCH':
      return 'Новий пароль і підтвердження не співпадають.';
    case 'TEMPORARILY_UNAVAILABLE':
      return 'Сервіс тимчасово недоступний. Спробуйте ще раз трохи пізніше.';
    default:
      return fallback;
  }
}

export async function verifyEmail(token: string): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/verify-email',
    { token },
    'Email успішно підтверджено. Тепер ви можете увійти.',
  );
}

export async function resendVerificationEmail(
  email: string,
): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/resend-verification-email',
    { email },
    'Якщо акаунт ще не підтверджений, лист уже надіслано або був відправлений нещодавно.',
  );
}

export async function forgotPassword(
  email: string,
): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/forgot-password',
    { email },
    'Якщо акаунт з таким email існує, інструкції для скидання пароля вже надіслані або були відправлені нещодавно.',
  );
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/reset-password',
    params,
    'Пароль оновлено. Увійдіть знову з новим паролем.',
  );
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/change-password',
    params,
    'Пароль успішно змінено. Увійдіть знову.',
  );
}

export async function verifyLoginChallenge(params: {
  challengeId: number;
  code: string;
}): Promise<SecurityFlowResult> {
  return postSecurity(
    '/auth/login-challenge/verify',
    params,
    'Вхід підтверджено. Сесію відновлено.',
  );
}
