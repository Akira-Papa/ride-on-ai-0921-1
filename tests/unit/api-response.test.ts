jest.mock('next/server');

import { jsonError, jsonOk } from '@/lib/utils/apiResponse';

describe('api response helpers', () => {
  it('returns 200 with payload', async () => {
    const response = jsonOk({ ok: true });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });

  it('returns structured error payload', async () => {
    const response = jsonError({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied',
    });
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied',
      },
    });
  });
});
