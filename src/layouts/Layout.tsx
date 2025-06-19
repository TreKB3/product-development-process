import React, { ReactNode } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import AppBar from './AppBar';
import Drawer from './Drawer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar open={open} toggleDrawer={toggleDrawer} />
      <Drawer open={open} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
