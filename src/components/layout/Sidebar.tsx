'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Lightbulb from '@mui/icons-material/Lightbulb';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import type { ReactNode } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type SidebarProps = {
  categories: Category[];
  onNavigate?: () => void;
};

export function Sidebar({ categories, onNavigate }: SidebarProps) {
  const t = useTranslations('categories');
  const tNav = useTranslations('navigation');
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onNavigate?.();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Lightbulb color="secondary" />
        <Typography variant="subtitle1" fontWeight={600}>
          {t('title')}
        </Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => handleNavigate('/dashboard')}>
          <ListItemText primary={tNav('all')} />
        </ListItemButton>
        {categories.map((category) => (
          <ListItemButton
            key={category.id}
            onClick={() => handleNavigate(`/categories/${category.slug}`)}
          >
            <ListItemText primary={category.name} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 3 }} />
      <Typography variant="body2" color="text.secondary">
        anotoki はメンバー同士で経験を共有する学習コミュニティです。
      </Typography>
    </Box>
  );
}
