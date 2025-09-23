import {
  createPostSchema,
  postsQuerySchema,
  reactionSchema,
  updatePostSchema,
} from '@/lib/validation/posts';

describe('createPostSchema', () => {
  const basePayload = {
    title: 'サンプルタイトル',
    lesson: 'これは十分な長さの教訓テキストです',
    situationalContext: '文脈',
    categoryId: 'cat123',
    tags: ['tag1', 'tag2'],
    visibility: 'member' as const,
  };

  it('trims fields and accepts valid payload', () => {
    const result = createPostSchema.parse({
      ...basePayload,
      title: '  サンプルタイトル  ',
      lesson: '  これは大切な教訓です  ',
      situationalContext: '  文脈  ',
      tags: ['  tag1  ', 'tag2'],
    });

    expect(result.title).toBe('サンプルタイトル');
    expect(result.lesson).toBe('これは大切な教訓です');
    expect(result.situationalContext).toBe('文脈');
    expect(result.tags).toEqual(['tag1', 'tag2']);
  });

  it('accepts title at minimum length of 3', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      title: 'あいう',
    });

    expect(result.success).toBe(true);
  });

  it('rejects titles shorter than 3 characters with code title.min', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      title: 'あい',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('title.min');
    }
  });

  it('rejects titles longer than 120 characters', () => {
    const longTitle = 'あ'.repeat(121);
    const result = createPostSchema.safeParse({
      ...basePayload,
      title: longTitle,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('title.max');
    }
  });

  it('accepts lesson at minimum length of 10 characters', () => {
    const payload = {
      ...basePayload,
      lesson: 'あ'.repeat(10),
    };
    const result = createPostSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects lesson shorter than 10 characters', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      lesson: '短い',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('lesson.min');
    }
  });

  it('rejects lesson longer than 2000 characters', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      lesson: 'あ'.repeat(2001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('lesson.max');
    }
  });

  it('normalises blank situationalContext to undefined', () => {
    const result = createPostSchema.parse({
      ...basePayload,
      situationalContext: '   ',
    });

    expect(result.situationalContext).toBe('');
  });

  it('requires categoryId', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      categoryId: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('category.required');
    }
  });

  it('enforces a maximum of five tags', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      tags: ['1', '2', '3', '4', '5', '6'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('tags.max');
    }
  });

  it('rejects individual tags longer than 30 characters', () => {
    const result = createPostSchema.safeParse({
      ...basePayload,
      tags: ['あ'.repeat(31)],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('tag.max');
    }
  });

  it('defaults visibility to "member" when omitted', () => {
    const { visibility, ...rest } = basePayload;
    const result = createPostSchema.parse(rest);
    expect(result.visibility).toBe('member');
  });
});

describe('updatePostSchema', () => {
  it('requires id field', () => {
    const result = updatePostSchema.safeParse({
      title: 'タイトル',
      lesson: '十分な長さのレッスン',
      categoryId: 'cat123',
      tags: [],
      visibility: 'member',
      id: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('id.required');
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

  it('rejects limit values lower than 1', () => {
    const result = postsQuerySchema.safeParse({ limit: '0' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('limit.range');
    }
  });

  it('rejects limit values greater than 50', () => {
    const result = postsQuerySchema.safeParse({ limit: '51' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('limit.range');
    }
  });

  it('allows optional search parameters to be omitted', () => {
    const result = postsQuerySchema.parse({});
    expect(result.search).toBeUndefined();
    expect(result.tag).toBeUndefined();
    expect(result.category).toBeUndefined();
  });
});

describe('reactionSchema', () => {
  it('accepts valid reaction payload', () => {
    const result = reactionSchema.safeParse({
      postId: 'post123',
      type: 'like',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid reaction type', () => {
    const result = reactionSchema.safeParse({
      postId: 'post123',
      type: 'clap',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('reaction.invalid');
    }
  });

  it('requires postId to be non-empty', () => {
    const result = reactionSchema.safeParse({
      postId: '',
      type: 'like',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('post.required');
    }
  });
});
