export interface MailTemplatePayload {
  subject: string;
  text: string;
  html: string;
}

function wrapHtml(
  title: string,
  body: string,
  ctaLabel: string,
  ctaUrl: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">${title}</h1>
      <p style="margin-bottom: 16px;">${body}</p>
      <p style="margin-bottom: 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#059669;color:#ffffff;text-decoration:none;border-radius:10px;">
          ${ctaLabel}
        </a>
      </p>
      <p style="font-size: 14px; color: #6b7280;">Якщо кнопка не працює, відкрийте це посилання вручну: ${ctaUrl}</p>
    </div>
  `.trim();
}

export function buildVerifyEmailTemplate(params: {
  verifyUrl: string;
  expiresInHours: number;
}): MailTemplatePayload {
  const { verifyUrl, expiresInHours } = params;
  const subject = 'Підтвердження email для PlantShop';
  const text =
    `Підтвердіть вашу email-адресу для PlantShop.\n\n` +
    `Посилання дійсне ${expiresInHours} год.\n` +
    `${verifyUrl}`;
  const html = wrapHtml(
    'Підтвердіть email',
    `Ми створили обліковий запис PlantShop для цієї адреси. Підтвердіть email протягом ${expiresInHours} годин, щоб завершити активацію.`,
    'Підтвердити email',
    verifyUrl,
  );

  return { subject, text, html };
}

export function buildPasswordResetTemplate(params: {
  resetUrl: string;
  expiresInMinutes: number;
}): MailTemplatePayload {
  const { resetUrl, expiresInMinutes } = params;
  const subject = 'Скидання пароля PlantShop';
  const text =
    `Ми отримали запит на скидання пароля PlantShop.\n\n` +
    `Посилання дійсне ${expiresInMinutes} хв.\n` +
    `${resetUrl}`;
  const html = wrapHtml(
    'Скидання пароля',
    `Перейдіть за посиланням нижче, щоб встановити новий пароль. Посилання дійсне ${expiresInMinutes} хвилин.`,
    'Скинути пароль',
    resetUrl,
  );

  return { subject, text, html };
}

export function buildLoginChallengeTemplate(params: {
  code: string;
  expiresInMinutes: number;
  userAgentSummary?: string | null;
}): MailTemplatePayload {
  const { code, expiresInMinutes, userAgentSummary } = params;
  const subject = 'Код підтвердження входу PlantShop';
  const text =
    `Використайте цей код для підтвердження входу в PlantShop: ${code}\n\n` +
    `Код дійсний ${expiresInMinutes} хв.` +
    (userAgentSummary ? `\nКонтекст входу: ${userAgentSummary}` : '');
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Підтвердження входу</h1>
      <p style="margin-bottom: 16px;">Ми помітили новий або невпізнаний контекст входу. Введіть цей код у PlantShop:</p>
      <div style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;border-radius:12px;font-size:28px;font-weight:700;letter-spacing:0.3em;">
        ${code}
      </div>
      <p style="margin-top:16px;">Код дійсний ${expiresInMinutes} хвилин.</p>
      ${userAgentSummary ? `<p style="font-size:14px;color:#6b7280;">Контекст входу: ${userAgentSummary}</p>` : ''}
    </div>
  `.trim();

  return { subject, text, html };
}
