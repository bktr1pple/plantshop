import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function parseOrigin(value: string): string | null {
  if (value === 'null') {
    return null;
  }

  try {
    return new URL(value).origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(
  originOrReferer: string,
  allowedOrigins: string[],
): boolean {
  const origin = parseOrigin(originOrReferer);
  return origin !== null && allowedOrigins.includes(origin);
}

export function createOriginValidationMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const origin = req.get('origin');
    const referer = req.get('referer');
    const browserSource = origin || referer;

    // Non-browser clients may omit both headers. Browsers include Origin for
    // cross-origin unsafe requests, while SameSite=Lax protects legacy cases.
    if (!browserSource) {
      next();
      return;
    }

    if (!isAllowedRequestOrigin(browserSource, allowedOrigins)) {
      res.status(403).json({
        statusCode: 403,
        error: 'ORIGIN_NOT_ALLOWED',
        message: 'Request origin is not allowed',
      });
      return;
    }

    next();
  };
}
