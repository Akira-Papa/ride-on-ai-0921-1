import { listCategories, getCategoryBySlug, ensureDefaultCategories } from '@/lib/services/categoryService';

jest.mock('@/lib/db/mongoose', () => ({
  connectMongo: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/models/Category', () => ({
  CategoryModel: {
    find: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

const categoryModel = jest.requireMock('@/lib/models/Category')
  .CategoryModel as unknown as {
  find: jest.Mock;
  findOne: jest.Mock;
  updateOne: jest.Mock;
};

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped list of categories sorted by name', async () => {
    const docs = [
      {
        _id: { toString: () => '1' },
        slug: 'career',
        name: 'キャリア',
        description: '仕事',
      },
      {
        _id: { toString: () => '2' },
        slug: 'finance',
        name: 'お金',
        description: undefined,
      },
    ];
    categoryModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(docs),
    });

    const result = await listCategories();
    expect(result).toEqual([
      {
        id: '1',
        slug: 'career',
        name: 'キャリア',
        description: '仕事',
      },
      {
        id: '2',
        slug: 'finance',
        name: 'お金',
        description: undefined,
      },
    ]);
  });

  it('returns mapped category when slug matches', async () => {
    categoryModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: { toString: () => '10' },
        slug: 'career',
        name: 'キャリア',
        description: '説明',
      }),
    });

    const result = await getCategoryBySlug('career');
    expect(result).toEqual({
      id: '10',
      slug: 'career',
      name: 'キャリア',
      description: '説明',
    });
  });

  it('returns null when slug does not exist', async () => {
    categoryModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const result = await getCategoryBySlug('missing');
    expect(result).toBeNull();
  });

  it('upserts default categories when ensuring seeds', async () => {
    categoryModel.updateOne.mockResolvedValue(undefined);
    await ensureDefaultCategories();
    expect(categoryModel.updateOne).toHaveBeenCalledTimes(5);
    expect(categoryModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'career' }),
      expect.objectContaining({ $setOnInsert: expect.objectContaining({ name: expect.any(String) }) }),
      { upsert: true },
    );
  });
});
