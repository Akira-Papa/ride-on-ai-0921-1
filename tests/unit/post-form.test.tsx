import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { useActionState } from 'react';

import { PostForm } from '@/components/posts/PostForm';
import type { ActionState } from '@/app/(dashboard)/posts/action-helpers';
import { renderWithProviders } from './test-utils';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useActionState: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/app/(dashboard)/posts/actions', () => ({
  createPostAction: jest.fn(),
  updatePostAction: jest.fn(),
}));

const useActionStateMock = useActionState as unknown as jest.Mock<
  [ActionState, (formData: FormData) => void, boolean]
>;

describe('PostForm', () => {
  const categories = [
    { id: 'cat-1', name: 'キャリア' },
    { id: 'cat-2', name: '健康' },
  ];

  beforeEach(() => {
    useActionStateMock.mockReturnValue([
      { status: 'idle' },
      jest.fn(),
      false,
    ]);
  });

  it('adds tags via button and prevents duplicates', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostForm categories={categories} mode="create" />);

    const input = screen.getByPlaceholderText('タグを入力して Enter');
    await user.type(input, 'tag1');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(screen.getByText('#tag1')).toBeInTheDocument();

    await user.type(input, 'tag1');
    await user.click(screen.getByRole('button', { name: '追加' }));

    const chips = screen.getAllByText(/^#tag1$/);
    expect(chips).toHaveLength(1);
  });

  it('disables add button when tag limit is reached', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostForm categories={categories} mode="create" />);

    const input = screen.getByPlaceholderText('タグを入力して Enter');
    const addButton = screen.getByRole('button', { name: '追加' });

    for (let index = 0; index < 5; index += 1) {
      await user.clear(input);
      await user.type(input, `tag${index}`);
      await user.click(addButton);
    }

    expect(addButton).toBeDisabled();
  });

  it('shows validation errors coming from action state', () => {
    useActionStateMock.mockReturnValue([
      {
        status: 'error',
        errors: { title: 'title.min', categoryId: 'category.required' },
      },
      jest.fn(),
      false,
    ]);

    renderWithProviders(<PostForm categories={categories} mode="create" />);

    expect(
      screen.getByText('タイトルは3文字以上で入力してください'),
    ).toBeInTheDocument();
    expect(screen.getByText('カテゴリを選択してください')).toBeInTheDocument();
  });
});
