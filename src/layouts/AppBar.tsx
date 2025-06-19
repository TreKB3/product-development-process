import * as React from 'react';
import { AppBar as MuiAppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface AppBarProps {
  open: boolean;
  toggleDrawer: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ open, toggleDrawer }) => {
  return (
    <MuiAppBar position="absolute">
      <Toolbar
        sx={{
          pr: '24px',
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{
            marginRight: '36px',
            ...(open && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          Product Development Process
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
