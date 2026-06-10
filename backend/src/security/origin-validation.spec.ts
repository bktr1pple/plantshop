import type { NextFunction, Request, Response } from 'express';
import {
  createOriginValidationMiddleware,
  isAllowedRequestOrigin,
} from './origin-validation';

describe('origin validation', () => {
  const allowedOrigins = ['http://localhost:3000'];

  function createResponseMock() {
    const status = jest.fn();
    const json = jest.fn();
    const response = {
      status,
      json,
    };
    status.mockReturnValue(response);
    return {
      response: response as unknown as Response,
      status,
      json,
    };
  }

  it('приймає точний дозволений origin та referer з його сторінки', () => {
    expect(
      isAllowedRequestOrigin('http://localhost:3000', allowedOrigins),
    ).toBe(true);
    expect(
      isAllowedRequestOrigin(
        'http://localhost:3000/dashboard/settings',
        allowedOrigins,
      ),
    ).toBe(true);
  });

  it('відхиляє схожий, але сторонній origin', () => {
    expect(
      isAllowedRequestOrigin('http://localhost:3000.evil.test', allowedOrigins),
    ).toBe(false);
  });

  it('блокує unsafe browser request зі стороннього origin', () => {
    const middleware = createOriginValidationMiddleware(allowedOrigins);
    const next = jest.fn() as NextFunction;
    const { response, status, json } = createResponseMock();
    const request = {
      method: 'POST',
      get: jest.fn((name: string) =>
        name === 'origin' ? 'https://evil.test' : undefined,
      ),
    } as unknown as Request;

    middleware(request, response, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'ORIGIN_NOT_ALLOWED' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('пропускає safe request без origin-перевірки', () => {
    const middleware = createOriginValidationMiddleware(allowedOrigins);
    const next = jest.fn() as NextFunction;
    const { response, status } = createResponseMock();
    const request = {
      method: 'GET',
      get: jest.fn(),
    } as unknown as Request;

    middleware(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(status).not.toHaveBeenCalled();
  });
});
