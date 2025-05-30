import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Article as ContentItemsIcon,
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { ContentType } from '../types/content';
import {
  getContentTypes,
  createContentType,
  updateContentType,
  deleteContentType,
} from '../api/contentApi';

const ContentTypes = () => {
  const navigate = useNavigate();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<ContentType | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    slug: '',
    order: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getContentTypes();
      setContentTypes(response.data);
    } catch (err) {
      setError('Failed to fetch content types');
      setSnackbar({
        open: true,
        message: 'Failed to fetch content types',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingType(null);
    setFormValues({ name: '', slug: '', order: contentTypes.length + 1 });
    setOpenDialog(true);
  };

  const handleEdit = (type: ContentType) => {
    setEditingType(type);
    setFormValues({
      name: type.name,
      slug: type.slug,
      order: type.order || 0,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (type: ContentType) => {
    if (window.confirm(`Are you sure you want to delete the "${type.name}" content type?`)) {
      try {
        await deleteContentType(type.id);
        setSnackbar({
          open: true,
          message: `Content type "${type.name}" deleted successfully`,
          severity: 'success',
        });
        fetchContentTypes();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete content type',
          severity: 'error',
        });
      }
    }
  };

  const handleSave = async () => {
    if (!formValues.name || !formValues.slug) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      if (editingType) {
        await updateContentType(editingType.id, {
          ...editingType,
          name: formValues.name,
          slug: formValues.slug,
          order: formValues.order,
        });
        setSnackbar({
          open: true,
          message: `Content type "${formValues.name}" updated successfully`,
          severity: 'success',
        });
      } else {
        await createContentType({
          name: formValues.name,
          slug: formValues.slug,
          order: formValues.order,
          fields: [],
        });
        setSnackbar({
          open: true,
          message: `Content type "${formValues.name}" created successfully`,
          severity: 'success',
        });
      }
      setOpenDialog(false);
      fetchContentTypes();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save content type',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to get the full path of a content type
  const getContentTypePath = (type: ContentType): string => {
    return type.name;
  };

  // Sort content types by order
  const sortedContentTypes = [...contentTypes].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Types
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            bgcolor: '#2271b1',
            '&:hover': {
              bgcolor: '#135e96',
            },
          }}
        >
          Add New Type
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Fields</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedContentTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {type.parentId && <ArrowRightIcon sx={{ mr: 1 }} />}
                    {getContentTypePath(type)}
                  </Box>
                </TableCell>
                <TableCell>{type.slug}</TableCell>
                <TableCell>{type.fields.length} fields</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/content-types/${type.id}/items`)}
                    title="View Items"
                  >
                    <ContentItemsIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/content-types/${type.id}/fields`)}
                    title="Manage Fields"
                  >
                    <SettingsIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEdit(type)} title="Edit Type">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(type)} title="Delete Type">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingType ? 'Edit Content Type' : 'Add New Content Type'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              margin="normal"
              required
              helperText="The display name of your content type"
            />
            <TextField
              fullWidth
              label="Slug"
              value={formValues.slug}
              onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
              margin="normal"
              required
              helperText="The slug is used in URLs and should contain only lowercase letters, numbers, and hyphens"
            />
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formValues.order}
              onChange={(e) => setFormValues({ ...formValues, order: parseInt(e.target.value) })}
              margin="normal"
              helperText="Used to sort content types in the list"
            />
            {!editingType && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                After creating the content type, click the settings icon to manage its fields.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{
              bgcolor: '#2271b1',
              '&:hover': {
                bgcolor: '#135e96',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContentTypes; 