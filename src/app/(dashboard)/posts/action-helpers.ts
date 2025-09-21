import { AppError } from '@/lib/utils/errors';

import type { ZodError } from 'zod';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
  postId?: string;
};

export const INITIAL_STATE: ActionState = { status: 'idle' };

export function mapZodErrors(error: ZodError): Record<string, string> {
  const flatten = error.flatten();
  const mapped: Record<string, string> = {};
  Object.entries(flatten.fieldErrors).forEach(([key, messages]) => {
    if (messages && messages.length > 0) {
      mapped[key] = messages[0];
    }
  });
  if (flatten.formErrors.length > 0) {
    mapped._form = flatten.formErrors[0];
  }
  return mapped;
}

export function extractPostForm(formData: FormData) {
  return {
    title: formData.get('title')?.toString() ?? '',
    lesson: formData.get('lesson')?.toString() ?? '',
    situationalContext: formData.get('situationalContext')?.toString() ?? '',
    categoryId: formData.get('categoryId')?.toString() ?? '',
    tags: formData.getAll('tags').map((tag) => tag.toString()),
    visibility: formData.get('visibility')?.toString() ?? 'member',
  };
}

export function mapAppErrorToMessage(error: AppError): string {
  switch (error.code) {
    case 'FORBIDDEN':
      return 'errors.forbidden';
    case 'POST_NOT_FOUND':
      return 'errors.notFound';
    case 'CATEGORY_NOT_FOUND':
      return 'errors.notFound';
    case 'AUTHOR_NOT_FOUND':
      return 'errors.notFound';
    default:
      return 'feedback.errorGeneric';
  }
}
