'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        予期せぬエラーが発生しました
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error.message}
      </Typography>
      <Button variant="contained" onClick={reset}>
        再試行
      </Button>
    </Box>
  );
}
