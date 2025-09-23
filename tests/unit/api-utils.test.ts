import { jsonOk, jsonCreated, jsonNoContent, jsonError } from '@/lib/utils/apiResponse';
import { handleRouteError, ensure } from '@/lib/utils/errorMapping';
import { AppError } from '@/lib/utils/errors';

describe('apiResponse helpers', () => {
  it('returns 200 with JSON body for jsonOk', async () => {
    const response = jsonOk({ ok: true });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('returns 201 for jsonCreated', () => {
    const response = jsonCreated({ id: '1' });
    expect(response.status).toBe(201);
  });

  it('returns 204 with null body for jsonNoContent', async () => {
    const response = jsonNoContent();
    expect(response.status).toBe(204);
    await expect(response.json()).resolves.toBeNull();
  });

  it('wraps error payload with provided metadata', async () => {
    const response = jsonError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid',
      details: { field: 'title' },
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid',
        details: { field: 'title' },
      },
    });
  });
});

describe('errorMapping helpers', () => {
  it('returns jsonError response for AppError', async () => {
    const error = new AppError('FORBIDDEN', 'Forbidden', 403, {
      reason: 'ownership',
    });
    const response = handleRouteError(error);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: { reason: 'ownership' },
      },
    });
  });

  it('returns internal error response for generic Error', async () => {
    const response = handleRouteError(new Error('Boom'));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Boom',
        details: undefined,
      },
    });
  });

  it('returns fallback response for unknown throwable', async () => {
    const response = handleRouteError('unexpected');
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
        details: undefined,
      },
    });
  });

  it('does nothing when ensure condition is truthy', () => {
    expect(() => ensure(true, new AppError('ERR', 'error'))).not.toThrow();
  });

  it('throws provided error when ensure condition is falsy', () => {
    const error = new AppError('ERR', 'error');
    expect(() => ensure(false, error)).toThrow(error);
  });
});
