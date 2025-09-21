'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';

import type { ReactNode } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AppShellProps = {
  categories: Category[];
  user: User;
  children: ReactNode;
};

const drawerWidth = 280;

export function AppShell({ categories, user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppHeader
        categories={categories}
        user={user}
        onToggleSidebar={handleToggleSidebar}
      />
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleToggleSidebar}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Sidebar categories={categories} onNavigate={handleToggleSidebar} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          <Toolbar />
          <Sidebar categories={categories} />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
