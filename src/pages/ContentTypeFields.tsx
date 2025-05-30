import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { ContentType, ContentTypeField, FieldType } from '../types/content';
import {
  getContentType,
  updateContentType,
} from '../api/contentApi';

const ContentTypeFields = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState<ContentTypeField | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    label: '',
    type: 'text' as FieldType,
    required: false,
    options: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ContentTypeFields mounted with id:', id);
    if (id) {
      fetchContentType();
    } else {
      setError('No content type ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchContentType = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching content type with ID:', id);
      const response = await getContentType(id!);
      console.log('Received content type:', response.data);
      // Ensure fields array exists
      const contentType = {
        ...response.data,
        fields: response.data.fields || []
      };
      setContentType(contentType);
    } catch (err) {
      console.error('Error fetching content type:', err);
      setError('Failed to fetch content type');
      setSnackbar({
        open: true,
        message: 'Failed to fetch content type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingField(null);
    setFormValues({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (field: ContentTypeField) => {
    setEditingField(field);
    setFormValues({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options?.join(', ') || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (field: ContentTypeField) => {
    if (!contentType) return;
    if (window.confirm(`Are you sure you want to delete the "${field.label}" field?`)) {
      try {
        const updatedFields = contentType.fields.filter((f) => f.id !== field.id);
        await updateContentType(contentType.id, {
          ...contentType,
          fields: updatedFields,
        });
        setSnackbar({
          open: true,
          message: `Field "${field.label}" deleted successfully`,
          severity: 'success',
        });
        fetchContentType();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete field',
          severity: 'error',
        });
      }
    }
  };

  const handleSave = async () => {
    if (!contentType) return;
    if (!formValues.name || !formValues.label || !formValues.type) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      const fieldData: ContentTypeField = {
        id: editingField?.id || Date.now().toString(),
        name: formValues.name,
        label: formValues.label,
        type: formValues.type,
        required: formValues.required,
        options: formValues.type === 'select' ? formValues.options.split(',').map(opt => opt.trim()) : undefined,
        order: editingField?.order ?? contentType.fields.length,
      };

      const updatedFields = editingField
        ? contentType.fields.map((f) => (f.id === editingField.id ? fieldData : f))
        : [...(contentType.fields || []), fieldData];

      await updateContentType(contentType.id, {
        ...contentType,
        fields: updatedFields,
      });

      setSnackbar({
        open: true,
        message: `Field ${editingField ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
      setOpenDialog(false);
      fetchContentType();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save field',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !contentType) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Content type not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/content-types')}
          sx={{ color: 'inherit', textDecoration: 'none' }}
        >
          Content Types
        </Link>
        <Typography color="text.primary">{contentType.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {contentType.name} Fields
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
          Add New Field
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contentType.fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.label}</TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(field)} title="Edit Field">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(field)} title="Delete Field">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Field' : 'Add New Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Label"
              value={formValues.label}
              onChange={(e) => setFormValues({ ...formValues, label: e.target.value })}
              required
              margin="normal"
              helperText="The display name of the field"
            />
            <TextField
              fullWidth
              label="Name"
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              required
              margin="normal"
              helperText="The field name used in the API (lowercase, no spaces)"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={formValues.type as FieldType ?? 'text'}
                onChange={(e) => setFormValues({ ...formValues, type: e.target.value as FieldType })}
                label="Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="textarea">Text Area</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="image">Image</MenuItem>
              </Select>
            </FormControl>
            {formValues.type === 'select' && (
              <TextField
                fullWidth
                label="Options"
                value={formValues.options || ''}
                onChange={(e) => setFormValues({ ...formValues, options: e.target.value })}
                margin="normal"
                helperText="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.required}
                  onChange={(e) => setFormValues({ ...formValues, required: e.target.checked })}
                />
              }
              label="Required"
              sx={{ mt: 2 }}
            />
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

export default ContentTypeFields; 