import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createExecutionContext(user?: {
  userId: number;
  email: string;
  role?: 'USER' | 'ADMIN';
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => class TestClass {},
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflectorMock: {
    getAllAndOverride: jest.Mock;
  };

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    guard = new RolesGuard(reflectorMock as unknown as Reflector);
  });

  it('дозволяє доступ, якщо ролі не вимагаються', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createExecutionContext())).toBe(true);
  });

  it('кидає ForbiddenException, якщо роль відсутня', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() => guard.canActivate(createExecutionContext())).toThrow(
      ForbiddenException,
    );
  });

  it('кидає ForbiddenException, якщо роль не підходить', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          userId: 1,
          email: 'user@example.com',
          role: 'USER',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('дозволяє доступ, якщо роль підходить', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(
      guard.canActivate(
        createExecutionContext({
          userId: 1,
          email: 'admin@example.com',
          role: 'ADMIN',
        }),
      ),
    ).toBe(true);
  });
});
