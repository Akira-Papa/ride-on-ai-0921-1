import { z } from 'zod';

import {
  INITIAL_STATE,
  extractPostForm,
  mapAppErrorToMessage,
  mapZodErrors,
} from '@/app/(dashboard)/posts/action-helpers';
import { AppError } from '@/lib/utils/errors';

describe('mapZodErrors', () => {
  it('maps field level errors using the first message', () => {
    const result = z
      .object({ title: z.string().min(3, 'title.min') })
      .safeParse({ title: 'a' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const mapped = mapZodErrors(result.error);
      expect(mapped).toEqual({ title: 'title.min' });
    }
  });

  it('maps form level errors to _form key', () => {
    const schema = z
      .object({ value: z.string() })
      .superRefine((_data, ctx) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'form.error',
          path: [],
        });
      });
    const result = schema.safeParse({ value: 'ok' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const mapped = mapZodErrors(result.error);
      expect(mapped._form).toBe('form.error');
    }
  });
});

describe('extractPostForm', () => {
  it('normalises form data into typed payload', () => {
    const formData = new FormData();
    formData.append('title', ' タイトル ');
    formData.append('lesson', ' 教訓 ');
    formData.append('situationalContext', ' 状況 ');
    formData.append('categoryId', 'cat123');
    formData.append('tags', 'tag1');
    formData.append('tags', 'tag2');

    const payload = extractPostForm(formData);

    expect(payload).toEqual({
      title: ' タイトル ',
      lesson: ' 教訓 ',
      situationalContext: ' 状況 ',
      categoryId: 'cat123',
      tags: ['tag1', 'tag2'],
      visibility: 'member',
    });
  });

  it('falls back to empty strings when form entries are missing', () => {
    const payload = extractPostForm(new FormData());
    expect(payload).toEqual({
      title: '',
      lesson: '',
      situationalContext: '',
      categoryId: '',
      tags: [],
      visibility: 'member',
    });
  });
});

describe('mapAppErrorToMessage', () => {
  it('maps known error codes to translation keys', () => {
    expect(
      mapAppErrorToMessage(new AppError('FORBIDDEN', 'Forbidden', 403)),
    ).toBe('errors.forbidden');
    expect(
      mapAppErrorToMessage(new AppError('POST_NOT_FOUND', 'Missing', 404)),
    ).toBe('errors.notFound');
    expect(
      mapAppErrorToMessage(new AppError('CATEGORY_NOT_FOUND', 'Missing', 404)),
    ).toBe('errors.notFound');
    expect(
      mapAppErrorToMessage(new AppError('AUTHOR_NOT_FOUND', 'Missing', 404)),
    ).toBe('errors.notFound');
  });

  it('returns generic feedback key for unknown errors', () => {
    expect(mapAppErrorToMessage(new AppError('UNKNOWN', 'Oops'))).toBe(
      'feedback.errorGeneric',
    );
  });
});

describe('INITIAL_STATE', () => {
  it('starts in idle status without message', () => {
    expect(INITIAL_STATE).toEqual({ status: 'idle' });
  });
});
