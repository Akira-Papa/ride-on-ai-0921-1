'use client';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

import type { ReactNode } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type AppHeaderProps = {
  categories: Category[];
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onToggleSidebar: () => void;
};

export function AppHeader({ categories, user, onToggleSidebar }: AppHeaderProps) {
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleCategoryClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setCategoryAnchor(event.currentTarget);
  };

  const handleCategoryClose = () => setCategoryAnchor(null);

  const handleSelectCategory = (slug: string | null) => {
    handleCategoryClose();
    if (!slug) {
      router.push('/dashboard');
      return;
    }
    router.push(`/categories/${slug}`);
  };

  const handleCreatePost = () => {
    router.push('/posts/new');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AppBar position="fixed" elevation={0} color="transparent">
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: { md: 'none' } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation"
            onClick={onToggleSidebar}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Typography
          variant="h6"
          component={Link}
          href="/dashboard"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          anotoki
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button
            color="inherit"
            endIcon={<ExpandMore />}
            onClick={handleCategoryClick}
            aria-haspopup="true"
            aria-expanded={Boolean(categoryAnchor)}
          >
            {tNav('categories')}
          </Button>
          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={handleCategoryClose}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            <MenuItem onClick={() => handleSelectCategory(null)}>
              {tNav('dashboard')}
            </MenuItem>
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                onClick={() => handleSelectCategory(category.slug)}
              >
                {category.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Button
            color="secondary"
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={handleCreatePost}
          >
            {tNav('createPost')}
          </Button>
        </Box>
        <Tooltip title={user.email ?? ''}>
          <IconButton onClick={handleMenu} size="small" aria-haspopup="true">
            <Avatar src={user.image ?? undefined} alt={user.name ?? 'Profile'}>
              {user.name?.[0] ?? 'A'}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          slotProps={{ paper: { sx: { minWidth: 200 } } }}
        >
          <MenuItem disabled>{user.name}</MenuItem>
          <MenuItem onClick={handleSignOut}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            {tAuth('logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
