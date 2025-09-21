'use client';

import Google from '@mui/icons-material/Google';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';

import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const tAuth = useTranslations('auth');
  const params = useSearchParams();
  const error = params.get('error');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top, rgba(90,62,133,0.4), transparent 60%)',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h5" align="center" fontWeight={700}>
            {tAuth('loginTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {tAuth('loginDescription')}
          </Typography>
          {error && (
            <Typography color="error" align="center">
              {tAuth('sessionExpired')}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Google />}
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            size="large"
          >
            {tAuth('loginButton')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
