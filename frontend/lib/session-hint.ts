// Не-httpOnly підказка, яку бекенд ставить разом із auth-cookies.
// Дозволяє клієнту не смикати /auth/me у гостя, що ніколи не логінився
// (і чия сесія об'єктивно протухла — cookie зникає разом із refresh TTL).
// Це НЕ маркер автентичності: реальна перевірка завжди йде через
// httpOnly access/refresh на /auth/me; hint лише економить зайвий запит.
export const SESSION_HINT_COOKIE = 'ps_session';

export function hasSessionHint(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .some((entry) => entry.trim().startsWith(`${SESSION_HINT_COOKIE}=`));
}
