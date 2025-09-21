import {
  createPostSchema,
  postsQuerySchema,
  reactionSchema,
} from '@/lib/validation/posts';

describe('createPostSchema', () => {
  it('trims fields and accepts valid payload', () => {
    const result = createPostSchema.parse({
      title: '  サンプルタイトル  ',
      lesson: '  これは大切な教訓です  ',
      situationalContext: '  文脈  ',
      categoryId: 'cat123',
      tags: ['tag1', 'tag2'],
      visibility: 'member',
    });

    expect(result.title).toBe('サンプルタイトル');
    expect(result.lesson).toBe('これは大切な教訓です');
    expect(result.situationalContext).toBe('文脈');
    expect(result.tags).toEqual(['tag1', 'tag2']);
  });

  it('rejects short titles with specific error code', () => {
    const result = createPostSchema.safeParse({
      title: 'あ',
      lesson: '十分な長さの教訓です',
      categoryId: 'cat123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('title.min');
    }
  });
});

describe('postsQuerySchema', () => {
  it('transforms limit into number and keeps search terms', () => {
    const result = postsQuerySchema.parse({
      limit: '5',
      search: 'キャリア',
      category: 'career',
      tag: '仕事',
    });

    expect(result.limit).toBe(5);
    expect(result.search).toBe('キャリア');
    expect(result.category).toBe('career');
    expect(result.tag).toBe('仕事');
  });
});

describe('reactionSchema', () => {
  it('rejects invalid reaction type', () => {
    const result = reactionSchema.safeParse({
      postId: 'post123',
      type: 'clap',
    });

    expect(result.success).toBe(false);
  });
});
