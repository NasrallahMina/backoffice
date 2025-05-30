import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Category as ContentTypesIcon,
  Article as ContentItemsIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
} from '@mui/icons-material';
import { ContentType } from '../types/content';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [contentTypesOpen, setContentTypesOpen] = useState(true);

  useEffect(() => {
    // Load content types from localStorage
    const loadContentTypes = () => {
      const storedTypes = localStorage.getItem('contentTypes');
      if (storedTypes) {
        setContentTypes(JSON.parse(storedTypes));
      }
    };

    loadContentTypes();
    // Listen for changes to contentTypes in localStorage
    window.addEventListener('storage', loadContentTypes);
    return () => window.removeEventListener('storage', loadContentTypes);
  }, []);

  const handleContentTypesClick = () => {
    setContentTypesOpen(!contentTypesOpen);
  };

  const isContentTypeActive = (typeId: string) => {
    const path = location.pathname;
    return path === `/content-types/${typeId}` || 
           path.startsWith(`/content-types/${typeId}/items/`);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/content-types') return 'Content Types';
    
    // Handle content type specific pages
    const contentTypeMatch = path.match(/\/content-types\/([^\/]+)/);
    if (contentTypeMatch) {
      const typeId = contentTypeMatch[1];
      const contentType = contentTypes.find(type => type.id === typeId);
      if (contentType) {
        if (path.endsWith('/items/new')) return `New ${contentType.name} Item`;
        return `${contentType.name} Items`;
      }
    }
    
    return 'Backoffice Panel';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: '#fff',
          color: '#1d2327',
          boxShadow: 'none',
          borderBottom: '1px solid #dcdcde',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {getPageTitle()}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1d2327',
            color: '#fff',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ bgcolor: '#1d2327' }}>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#fff' }}>
            Backoffice
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List>
          <ListItem
            component={Link}
            to="/"
            sx={{
              color: '#fff',
              bgcolor: location.pathname === '/' ? '#2271b1' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname === '/' ? '#2271b1' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItemButton
            onClick={handleContentTypesClick}
            sx={{
              color: '#fff',
              bgcolor: location.pathname.startsWith('/content-types') ? '#2271b1' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname.startsWith('/content-types') ? '#2271b1' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}><ContentTypesIcon /></ListItemIcon>
            <ListItemText primary="Content Types" />
            {contentTypesOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={contentTypesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                component={Link}
                to="/content-types"
                sx={{
                  pl: 4,
                  color: '#fff',
                  bgcolor: location.pathname === '/content-types' ? '#2271b1' : 'transparent',
                  '&:hover': {
                    bgcolor: location.pathname === '/content-types' ? '#2271b1' : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}><AddIcon /></ListItemIcon>
                <ListItemText primary="Add New Type" />
              </ListItem>
              {contentTypes.map((type) => (
                <ListItem
                  key={type.id}
                  component={Link}
                  to={`/content-types/${type.id}`}
                  sx={{
                    pl: 4,
                    color: '#fff',
                    bgcolor: isContentTypeActive(type.id) ? '#2271b1' : 'transparent',
                    '&:hover': {
                      bgcolor: isContentTypeActive(type.id) ? '#2271b1' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}><ContentItemsIcon /></ListItemIcon>
                  <ListItemText primary={type.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f0f0f1',
          minHeight: '100vh',
          width: `calc(100% - ${drawerWidth}px)`,
          p: 2,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 