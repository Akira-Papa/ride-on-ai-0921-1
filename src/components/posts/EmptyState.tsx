import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LightbulbCircle from '@mui/icons-material/LightbulbCircle';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations('statuses');
  const tPosts = useTranslations('posts');
  const router = useRouter();

  return (
    <Box
      sx={{
        border: '1px dashed rgba(255,255,255,0.2)',
        borderRadius: 4,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <LightbulbCircle sx={{ fontSize: 48, color: 'secondary.main' }} />
      <Typography variant="h6">{t('emptyFeedTitle')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('emptyFeedDescription')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => router.push('/posts/new')}
      >
        {tPosts('createTitle')}
      </Button>
    </Box>
  );
}
