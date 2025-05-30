import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Category as CategoryIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface Statistics {
  totalUsers: number;
  totalContentTypes: number;
  totalContentItems: number;
  recentActivity: Array<{
    id: string;
    action: 'create' | 'update' | 'delete';
    type: 'user' | 'content';
    name: string;
    timestamp: string;
  }>;
}

const Home = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    totalContentTypes: 0,
    totalContentItems: 0,
    recentActivity: [],
  });

  useEffect(() => {
    // Simulate fetching statistics
    setStatistics({
      totalUsers: 25,
      totalContentTypes: 3,
      totalContentItems: 42,
      recentActivity: [
        {
          id: '1',
          action: 'create',
          type: 'user',
          name: 'John Doe',
          timestamp: '2024-02-20T10:30:00Z',
        },
        {
          id: '2',
          action: 'update',
          type: 'content',
          name: 'Blog Post',
          timestamp: '2024-02-20T09:15:00Z',
        },
        {
          id: '3',
          action: 'delete',
          type: 'user',
          name: 'Jane Smith',
          timestamp: '2024-02-19T16:45:00Z',
        },
      ],
    });
  }, []);

  const navigationCards = [
    {
      title: 'User Management',
      description: 'Manage system users and their permissions',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      actions: [
        { label: 'Add User', icon: <AddIcon />, path: '/users/new' },
        { label: 'View Users', icon: <ViewIcon />, path: '/users' },
      ],
    },
    {
      title: 'Content Types',
      description: 'Define and manage content types',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      actions: [
        { label: 'Add Type', icon: <AddIcon />, path: '/content-types' },
        { label: 'View Types', icon: <ViewIcon />, path: '/content-types' },
      ],
    },
    {
      title: 'Content Items',
      description: 'Manage content items across all types',
      icon: <ArticleIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      actions: [
        { label: 'Browse Items', icon: <ViewIcon />, path: '/content-types' },
      ],
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      actions: [
        { label: 'View Settings', icon: <ViewIcon />, path: '/settings' },
      ],
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return '#2e7d32';
      case 'update':
        return '#ed6c02';
      case 'delete':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <AddIcon />;
      case 'update':
        return <ViewIcon />;
      case 'delete':
        return <SettingsIcon />;
      default:
        return <ViewIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">{statistics.totalUsers}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Content Types
            </Typography>
            <Typography variant="h4">{statistics.totalContentTypes}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Content Items
            </Typography>
            <Typography variant="h4">{statistics.totalContentItems}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Navigation Cards */}
        <Box sx={{ flex: '2 1 600px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {navigationCards.map((card) => (
            <Card
              key={card.title}
              sx={{
                flex: '1 1 300px',
                minWidth: 300,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                      p: 1,
                      borderRadius: 1,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {card.title}
                  </Typography>
                </Box>
                <Typography color="textSecondary">{card.description}</Typography>
              </CardContent>
              <CardActions>
                {card.actions.map((action) => (
                  <Button
                    key={action.label}
                    size="small"
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                  >
                    {action.label}
                  </Button>
                ))}
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {statistics.recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'background.default',
                    }}
                  >
                    <Box
                      sx={{
                        color: getActionColor(activity.action),
                        mr: 2,
                      }}
                    >
                      {getActionIcon(activity.action)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}{' '}
                        {activity.type}: {activity.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 