import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function parsePort(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw?.trim() || fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid MAIL_PORT value: ${raw}`);
  }

  return parsed;
}

function parseSecure(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() === 'true';
}

function getFromAddress(): string {
  const email = process.env.MAIL_FROM_EMAIL?.trim();
  const name = process.env.MAIL_FROM_NAME?.trim() || 'PlantShop';

  if (!email) {
    throw new Error('Missing required environment variable: MAIL_FROM_EMAIL');
  }

  return `"${name.replace(/"/g, '')}" <${email}>`;
}

function createTransporter(): Transporter {
  if (process.env.NODE_ENV === 'test') {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const host = process.env.MAIL_HOST?.trim();
  const user = process.env.MAIL_USER?.trim();
  const password = process.env.MAIL_PASSWORD?.trim();

  if (!host || !user || !password) {
    throw new Error(
      'Missing MAIL_HOST, MAIL_USER or MAIL_PASSWORD for SMTP transport',
    );
  }

  const port = parsePort(process.env.MAIL_PORT, 587);
  const secure = parseSecure(process.env.MAIL_SECURE);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
  });
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    this.transporter = createTransporter();
    this.from = getFromAddress();
  }

  async sendMail(input: SendMailInput): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
    } catch (error) {
      console.error('Failed to send mail', error);
      throw new ServiceUnavailableException({
        error: 'TEMPORARILY_UNAVAILABLE',
        message:
          'Поштовий сервіс тимчасово недоступний. Спробуйте ще раз трохи пізніше.',
      });
    }
  }
}
