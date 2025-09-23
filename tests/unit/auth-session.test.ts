import { getServerAuthSession, requireServerSession } from '@/lib/auth/session';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const { getServerSession } = jest.requireMock('next-auth/next') as {
  getServerSession: jest.Mock;
};
const { redirect } = jest.requireMock('next/navigation') as {
  redirect: jest.Mock;
};

describe('auth session helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns session when user id is present', async () => {
    const session = { user: { id: 'user-1' }, expires: '2024-01-01' };
    getServerSession.mockResolvedValue(session);

    await expect(getServerAuthSession()).resolves.toEqual(session);
  });

  it('returns null when session is missing', async () => {
    getServerSession.mockResolvedValue(null);
    await expect(getServerAuthSession()).resolves.toBeNull();
  });

  it('returns null when user id is absent', async () => {
    getServerSession.mockResolvedValue({ user: {} });
    await expect(getServerAuthSession()).resolves.toBeNull();
  });

  it('returns session when requireServerSession succeeds', async () => {
    const session = { user: { id: 'user-1' } };
    getServerSession.mockResolvedValue(session);

    await expect(requireServerSession()).resolves.toEqual(session);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to /login when session is missing', async () => {
    getServerSession.mockResolvedValue(null);

    const result = await requireServerSession();
    expect(result).toBeNull();
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
