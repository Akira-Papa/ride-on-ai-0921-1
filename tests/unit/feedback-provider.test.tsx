import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFeedback } from '@/components/feedback/FeedbackProvider';
import { renderWithProviders } from './test-utils';
import { useEffect } from 'react';

describe('FeedbackProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function Trigger({ onTrigger }: { onTrigger: (show: ReturnType<typeof useFeedback>) => void }) {
    const feedback = useFeedback();
    useEffect(() => {
      onTrigger(feedback);
    }, [feedback, onTrigger]);
    return null;
  }

  it('shows success snackbar when showSuccess is called', async () => {
    let feedbackApi: ReturnType<typeof useFeedback> | undefined;
    renderWithProviders(<Trigger onTrigger={(api) => (feedbackApi = api)} />);

    expect(feedbackApi).toBeDefined();
    act(() => {
      feedbackApi?.showSuccess('保存しました');
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('保存しました');
  });

  it('auto-hides snackbar after duration', async () => {
    let feedbackApi: ReturnType<typeof useFeedback> | undefined;
    renderWithProviders(<Trigger onTrigger={(api) => (feedbackApi = api)} />);

    act(() => {
      feedbackApi?.showError('失敗しました');
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('失敗しました');

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('allows manual close via close icon button', async () => {
    let feedbackApi: ReturnType<typeof useFeedback> | undefined;
    renderWithProviders(<Trigger onTrigger={(api) => (feedbackApi = api)} />);

    act(() => {
      feedbackApi?.showInfo('情報です');
    });

    const alert = await screen.findByRole('alert');
    const closeButton = within(alert).getByRole('button');
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(closeButton);

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
