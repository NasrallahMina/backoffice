import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { ContentType, ContentItem } from '../types/content';

const ContentItemEditor = () => {
  const { id: contentTypeId, itemId } = useParams<{ id: string; itemId: string }>();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [item, setItem] = useState<ContentItem | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Load content type from localStorage
      const storedTypes = localStorage.getItem('contentTypes');
      if (!storedTypes) {
        throw new Error('No content types found');
      }

      const types = JSON.parse(storedTypes);
      const currentType = types.find((type: ContentType) => type.id === contentTypeId);
      
      if (!currentType) {
        throw new Error('Content type not found');
      }

      setContentType(currentType);

      if (itemId !== 'new') {
        // Load existing item if editing
        const storedItems = localStorage.getItem(`contentItems_${contentTypeId}`);
        if (storedItems) {
          const items = JSON.parse(storedItems);
          const currentItem = items.find((item: ContentItem) => item.id === itemId);
          if (currentItem) {
            setItem(currentItem);
            setValues(currentItem.values);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content type');
    } finally {
      setLoading(false);
    }
  }, [contentTypeId, itemId]);

  const handleChange = (fieldName: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    contentType?.fields.forEach((field) => {
      if (field.required && (!values[field.name] || values[field.name].trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any existing errors
    setErrors({});
    
    // Save to localStorage
    const storedItems = localStorage.getItem(`contentItems_${contentTypeId}`);
    const items = storedItems ? JSON.parse(storedItems) : [];
    
    const newItem: ContentItem = {
      id: itemId === 'new' ? Date.now().toString() : (itemId || Date.now().toString()),
      contentTypeId: contentTypeId || '',
      values: values,
      createdAt: itemId === 'new' ? new Date().toISOString() : item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (itemId === 'new') {
      items.push(newItem);
    } else {
      const index = items.findIndex((item: ContentItem) => item.id === itemId);
      if (index !== -1) {
        items[index] = newItem;
      }
    }

    localStorage.setItem(`contentItems_${contentTypeId}`, JSON.stringify(items));
    setIsDirty(false);
    navigate(`/content-types/${contentTypeId}/items`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // In a real application, you would delete the item from an API
      navigate(`/content-types/${contentTypeId}/items`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !contentType) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Content type not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(`/content-types/${contentTypeId}/items`)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {itemId === 'new' ? 'Add New' : 'Edit'} {contentType.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => navigate(`/content-types/${contentTypeId}/items/${itemId}/preview`)}
            >
              Preview
            </Button>
            {itemId !== 'new' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              type="submit"
              form="content-item-form"
              disabled={!isDirty}
            >
              {itemId === 'new' ? 'Publish' : 'Update'}
            </Button>
          </Box>
        </Box>
        {isDirty && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have unsaved changes. Don't forget to save your work.
          </Alert>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Main Content */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Box 
              component="form" 
              id="content-item-form" 
              onSubmit={handleSubmit}
              noValidate
            >
              {contentType.fields.map((field) => (
                <Box key={field.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" component="label">
                      {field.label}
                      {field.required && (
                        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                          *
                        </Typography>
                      )}
                    </Typography>
                    <Tooltip title="Help">
                      <IconButton
                        size="small"
                        onClick={() => setShowHelp(!showHelp)}
                        sx={{ ml: 1 }}
                      >
                        <HelpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {field.type === 'textarea' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                    />
                  ) : field.type === 'date' ? (
                    <TextField
                      fullWidth
                      type="date"
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      value={values[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      error={!!errors[field.name]}
                      helperText={errors[field.name]}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Publish
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Status: <strong>Draft</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last modified: {item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<SaveIcon />}
                  type="submit"
                  form="content-item-form"
                  disabled={!isDirty}
                >
                  {itemId === 'new' ? 'Publish' : 'Update'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Type Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {contentType.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Slug:</strong> {contentType.slug}
                </Typography>
                <Typography variant="body2">
                  <strong>Fields:</strong> {contentType.fields.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ContentItemEditor; 