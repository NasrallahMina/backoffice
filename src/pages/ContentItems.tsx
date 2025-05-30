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
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';
import { ContentType, ContentItem, ContentTypeField } from '../types/content';
import {
  getContentType,
  getContentItems,
  createContentItem,
  updateContentItem,
  deleteContentItem,
} from '../api/contentApi';

const ContentItems = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<ContentTypeField | null>(null);
  const [fieldFormValues, setFieldFormValues] = useState<Partial<ContentTypeField>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContentTypeAndItems = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [typeResponse, itemsResponse] = await Promise.all([
        getContentType(id),
        getContentItems(id),
      ]);
      setContentType(typeResponse.data);
      setItems(itemsResponse.data);
    } catch (err) {
      setError('Failed to fetch content type and items');
      setSnackbar({
        open: true,
        message: 'Failed to fetch content type and items',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentTypeAndItems();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldFormValues({
      name: '',
      label: '',
      type: 'text',
      required: false,
      order: contentType?.fields.length || 0,
    });
    setOpenFieldDialog(true);
  };

  const handleMoveField = (field: ContentTypeField, direction: 'up' | 'down') => {
    if (!contentType || !id) return;
    
    const currentIndex = contentType.fields.findIndex(f => f.id === field.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === contentType.fields.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedFields = [...contentType.fields];
    const [movedField] = updatedFields.splice(currentIndex, 1);
    updatedFields.splice(newIndex, 0, movedField);

    // Update order values
    updatedFields.forEach((field, index) => {
      field.order = index;
    });

    const updatedType = { ...contentType, fields: updatedFields };
    
    // Update localStorage
    const storedTypes = localStorage.getItem('contentTypes');
    if (storedTypes) {
      const types = JSON.parse(storedTypes);
      const index = types.findIndex((t: ContentType) => t.id === id);
      if (index !== -1) {
        types[index] = updatedType;
        localStorage.setItem('contentTypes', JSON.stringify(types));
        setContentType(updatedType);
      }
    }
  };

  const handleEditField = (field: ContentTypeField) => {
    setEditingField(field);
    setFieldFormValues(field);
    setOpenFieldDialog(true);
  };

  const handleDeleteField = (field: ContentTypeField) => {
    if (!contentType || !id) return;
    if (window.confirm(`Are you sure you want to delete the field "${field.label}"?`)) {
      const updatedFields = contentType.fields.filter(f => f.id !== field.id);
      const updatedType = { ...contentType, fields: updatedFields };
      
      // Update localStorage
      const storedTypes = localStorage.getItem('contentTypes');
      if (storedTypes) {
        const types = JSON.parse(storedTypes);
        const index = types.findIndex((t: ContentType) => t.id === id);
        if (index !== -1) {
          types[index] = updatedType;
          localStorage.setItem('contentTypes', JSON.stringify(types));
          setContentType(updatedType);
          setSnackbar({
            open: true,
            message: 'Field deleted successfully',
            severity: 'success',
          });
        }
      }
    }
  };

  const handleSaveField = () => {
    if (!contentType || !id) return;

    const newField: ContentTypeField = {
      id: editingField?.id || Date.now().toString(),
      name: fieldFormValues.name || '',
      label: fieldFormValues.label || '',
      type: fieldFormValues.type || 'text',
      required: fieldFormValues.required || false,
      options: fieldFormValues.options,
      order: fieldFormValues.order || 0,
    };

    const updatedFields = editingField
      ? contentType.fields.map(f => f.id === editingField.id ? newField : f)
      : [...contentType.fields, newField];

    const updatedType = { ...contentType, fields: updatedFields };

    // Update localStorage
    const storedTypes = localStorage.getItem('contentTypes');
    if (storedTypes) {
      const types = JSON.parse(storedTypes);
      const index = types.findIndex((t: ContentType) => t.id === id);
      if (index !== -1) {
        types[index] = updatedType;
        localStorage.setItem('contentTypes', JSON.stringify(types));
        setContentType(updatedType);
        setOpenFieldDialog(false);
        setSnackbar({
          open: true,
          message: `Field ${editingField ? 'updated' : 'added'} successfully`,
          severity: 'success',
        });
      }
    }
  };

  const handleAddNew = () => {
    if (!contentType) return;
    setEditingItem(null);
    const initialValues: Record<string, any> = {};
    contentType.fields.forEach((field) => {
      initialValues[field.name] = '';
    });
    setFormValues(initialValues);
    setOpenDialog(true);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormValues(item.values);
    setOpenDialog(true);
  };

  const handleDelete = async (item: ContentItem) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete this item?`)) {
      try {
        await deleteContentItem(id, item.id);
        setSnackbar({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success',
        });
        fetchContentTypeAndItems();
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete item',
          severity: 'error',
        });
      }
    }
  };

  const handleSave = async () => {
    if (!contentType || !id) return;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    contentType.fields.forEach((field) => {
      if (field.required && (!formValues[field.name] || formValues[field.name].trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    // Clear any existing errors
    setFormErrors({});

    try {
      const now = new Date().toISOString();
      if (editingItem) {
        await updateContentItem(id, editingItem.id, {
          ...editingItem,
          values: formValues,
          updatedAt: now,
        });
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success',
        });
      } else {
        await createContentItem(id, {
          values: formValues,
          createdAt: now,
          updatedAt: now,
        });
        setSnackbar({
          open: true,
          message: 'Item created successfully',
          severity: 'success',
        });
      }
      setOpenDialog(false);
      fetchContentTypeAndItems();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderFieldInput = (field: any) => {
    const value = formValues[field.name] || '';

    switch (field.type) {
      case 'rich-text':
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 1, mb: 1 }}>
              <ToggleButtonGroup size="small" sx={{ p: 0.5 }}>
                <ToggleButton value="bold" size="small">
                  <FormatBold fontSize="small" />
                </ToggleButton>
                <ToggleButton value="italic" size="small">
                  <FormatItalic fontSize="small" />
                </ToggleButton>
                <ToggleButton value="underlined" size="small">
                  <FormatUnderlined fontSize="small" />
                </ToggleButton>
                <ToggleButton value="bulletList" size="small">
                  <FormatListBulleted fontSize="small" />
                </ToggleButton>
                <ToggleButton value="numberList" size="small">
                  <FormatListNumbered fontSize="small" />
                </ToggleButton>
                <ToggleButton value="alignLeft" size="small">
                  <FormatAlignLeft fontSize="small" />
                </ToggleButton>
                <ToggleButton value="alignCenter" size="small">
                  <FormatAlignCenter fontSize="small" />
                </ToggleButton>
                <ToggleButton value="alignRight" size="small">
                  <FormatAlignRight fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                },
              }}
            />
            {formErrors[field.name] && (
              <Typography color="error" variant="caption">
                {formErrors[field.name]}
              </Typography>
            )}
          </Box>
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
            required={field.required}
            margin="normal"
            error={!!formErrors[field.name]}
            helperText={formErrors[field.name]}
          />
        );
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
            required={field.required}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!formErrors[field.name]}
            helperText={formErrors[field.name]}
          />
        );
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
            required={field.required}
            margin="normal"
            error={!!formErrors[field.name]}
            helperText={formErrors[field.name]}
          />
        );
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === true}
                onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.checked })}
              />
            }
            label={field.label}
            sx={{ mt: 2 }}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth margin="normal" error={!!formErrors[field.name]}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
              label={field.label}
              required={field.required}
            >
              {field.options?.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {formErrors[field.name] && (
              <Typography color="error" variant="caption">
                {formErrors[field.name]}
              </Typography>
            )}
          </FormControl>
        );
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
            required={field.required}
            margin="normal"
            error={!!formErrors[field.name]}
            helperText={formErrors[field.name]}
          />
        );
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    
    // Search in all field values
    return Object.values(item.values).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
          {contentType.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={activeTab === 0 ? handleAddNew : handleAddField}
          sx={{
            bgcolor: '#2271b1',
            '&:hover': {
              bgcolor: '#135e96',
            },
          }}
        >
          {activeTab === 0 ? 'Add New Item' : 'Add New Field'}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Items" />
          <Tab label="Fields" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: 'text.secondary' }}>
                    <SearchIcon fontSize="small" />
                  </Box>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {contentType.fields.map((field) => (
                    <TableCell key={field.id}>{field.label}</TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    {contentType.fields.map((field) => (
                      <TableCell key={field.id}>{item.values[field.name]}</TableCell>
                    ))}
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(item)} title="Edit Item">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item)} title="Delete Item">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px">Order</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Required</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contentType.fields
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveField(field, 'up')}
                          disabled={field.order === 0}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveField(field, 'down')}
                          disabled={field.order === contentType.fields.length - 1}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditField(field)} title="Edit Field">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteField(field)} title="Delete Field">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {contentType.fields.map((field) => (
              <Box key={field.id}>
                {renderFieldInput(field)}
              </Box>
            ))}
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

      {/* Field Dialog */}
      <Dialog open={openFieldDialog} onClose={() => setOpenFieldDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Edit Field' : 'Add New Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Label"
              value={fieldFormValues.label || ''}
              onChange={(e) => setFieldFormValues({ ...fieldFormValues, label: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Name"
              value={fieldFormValues.name || ''}
              onChange={(e) => setFieldFormValues({ ...fieldFormValues, name: e.target.value })}
              margin="normal"
              required
              helperText="This will be used as the field identifier"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={fieldFormValues.type || 'text'}
                onChange={(e) => setFieldFormValues({ ...fieldFormValues, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="textarea">Text Area</MenuItem>
                <MenuItem value="rich-text">Rich Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="select">Select</MenuItem>
              </Select>
            </FormControl>
            {fieldFormValues.type === 'select' && (
              <TextField
                fullWidth
                label="Options"
                value={fieldFormValues.options?.join(', ') || ''}
                onChange={(e) => setFieldFormValues({
                  ...fieldFormValues,
                  options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt !== '')
                })}
                margin="normal"
                helperText="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={fieldFormValues.required || false}
                  onChange={(e) => setFieldFormValues({ ...fieldFormValues, required: e.target.checked })}
                />
              }
              label="Required"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFieldDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveField}
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

export default ContentItems; 