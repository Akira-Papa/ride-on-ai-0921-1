'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ReactNode } from 'react';

type Severity = 'success' | 'error' | 'info';

type FeedbackContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | undefined>(
  undefined,
);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    severity: Severity;
  }>({ open: false, message: '', severity: 'info' });

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openWith = useCallback((severity: Severity, message: string) => {
    setState({ open: true, message, severity });
  }, []);

  const value = useMemo<FeedbackContextValue>(() => ({
    showSuccess: (message: string) => openWith('success', message),
    showError: (message: string) => openWith('error', message),
    showInfo: (message: string) => openWith('info', message),
  }), [openWith]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={state.severity}
          elevation={6}
          variant="filled"
          onClose={close}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
}
