import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  Pagination, 
  Box, 
  Chip, 
  Alert, 
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dropzone from 'react-dropzone';
import { 
  useGetConfigsQuery, 
  useGetConfigQuery, 
  useCreateConfigMutation, 
  useUpdateConfigMutation, 
  useDeleteConfigMutation,
  useGetConfigSchemasQuery,
  useGetConfigSchemaQuery,
  useUploadConfigFileMutation,
  useUploadConfigFileBase64Mutation,
  useGetConfigFilesQuery,
  useDeleteConfigFileMutation
} from './store/configManagementApi';
import CodeEditor from './components/CodeEditor';
import DynamicForm from './components/DynamicForm';
import { createFormStructure, prepareFormInitialValues, safeJsonParse, jsonSchemaToZod } from './utils/form-utils';

// Styled components
const Root = styled('div')(({ theme }) => ({
  '& .header': {
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  },
  '& .config-data-editor': {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  '& .dropzone': {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .dropzone-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Form validation schema for basic config properties
const configBasicSchema = z.object({
  name: z.string()
    .min(3, 'نام باید حداقل 3 کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیش از 50 کاراکتر باشد')
    .regex(/^[a-zA-Z0-9._-]+$/, 'نام فقط می‌تواند شامل حروف، اعداد، نقطه، خط تیره و زیرخط باشد')
    .nonempty('نام الزامی است'),
  displayName: z.string()
    .min(3, 'نام نمایشی باید حداقل 3 کاراکتر باشد')
    .max(100, 'نام نمایشی نمی‌تواند بیش از 100 کاراکتر باشد')
    .nonempty('نام نمایشی الزامی است'),
  schemaId: z.number({ invalid_type_error: 'انتخاب طرحواره الزامی است' })
    .positive('انتخاب طرحواره الزامی است'),
  category: z.string().optional(),
  placement: z.string().optional(),
  description: z.string().max(500, 'توضیحات نمی‌تواند بیش از 500 کاراکتر باشد').optional(),
});

const ConfigRecordsTab = () => {
  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentConfigName, setCurrentConfigName] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [configError, setConfigError] = useState(null);
  const [schemaFormValidation, setSchemaFormValidation] = useState(null);
  const [parsedSchema, setParsedSchema] = useState(null);
  const [formStructure, setFormStructure] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [shouldValidateSchema, setShouldValidateSchema] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(null);
  
  // RTK Query hooks
  const { 
    data: configsData, 
    isLoading: isLoadingConfigs, 
    isFetching: isFetchingConfigs, 
    error: configsError,
    refetch: refetchConfigs
  } = useGetConfigsQuery({
    pageNumber: page,
    pageSize,
    search: searchTerm,
    filter: categoryFilter ? { category: categoryFilter } : {}
  });
  
  const { 
    data: currentConfig, 
    isLoading: isLoadingCurrentConfig 
  } = useGetConfigQuery(currentConfigName, { 
    skip: !currentConfigName 
  });
  
  const { 
    data: schemasData, 
    isLoading: isLoadingSchemas 
  } = useGetConfigSchemasQuery({
    pageNumber: 1,
    pageSize: 100,
  });
  
  const { 
    data: schemaData, 
    isLoading: isLoadingSchema 
  } = useGetConfigSchemaQuery(selectedSchema, { 
    skip: !selectedSchema 
  });
  
  const {
    data: configFiles,
    isLoading: isLoadingFiles,
    refetch: refetchFiles
  } = useGetConfigFilesQuery(currentConfigName, {
    skip: !currentConfigName || !openDialog
  });
  
  const [uploadFile, { isLoading: isUploading }] = useUploadConfigFileMutation();
  const [uploadFileBase64, { isLoading: isUploadingBase64 }] = useUploadConfigFileBase64Mutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteConfigFileMutation();
  
  const [
    createConfig, 
    { isLoading: isCreating }
  ] = useCreateConfigMutation();
  
  const [
    updateConfig, 
    { isLoading: isUpdating }
  ] = useUpdateConfigMutation();
  
  const [
    deleteConfig, 
    { isLoading: isDeletingConfig }
  ] = useDeleteConfigMutation();
  
  // Form setup for basic config properties
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(configBasicSchema),
    defaultValues: {
      name: '',
      displayName: '',
      schemaId: '',
      data: '{}',
      category: '',
      placement: '',
      description: '',
    }
  });
  
  // Form setup for schema-based data
  const { 
    control: schemaFormControl, 
    handleSubmit: handleSchemaFormSubmit, 
    reset: resetSchemaForm, 
    formState: { errors: schemaFormErrors }
  } = useForm({
    resolver: schemaFormValidation ? zodResolver(schemaFormValidation) : undefined,
    defaultValues: formInitialValues,
  });
  
  // Watched values
  const watchedSchemaId = watch('schemaId');
  
  // Effects
  // Update selected schema when schemaId changes
  useEffect(() => {
    if (watchedSchemaId) {
      setSelectedSchema(watchedSchemaId);
    }
  }, [watchedSchemaId]);
  
  // Update form values when editing a config
  useEffect(() => {
    if (currentConfig && editMode) {
      reset({
        name: currentConfig.name,
        displayName: currentConfig.displayName,
        schemaId: currentConfig.schema?.id || '',
        category: currentConfig.category || '',
        placement: currentConfig.placement || '',
        description: currentConfig.description || '',
      });
      
      if (currentConfig.schema?.id) {
        setSelectedSchema(currentConfig.schema.id);
      }
      
      // Parse config data
      try {
        const configData = safeJsonParse(currentConfig.data, {});
        setFormInitialValues(configData);
      } catch (error) {
        console.error('Error parsing config data:', error);
        setFormInitialValues({});
      }
    }
  }, [currentConfig, reset, editMode]);
  
  // Update parsedSchema and form structure when schema data changes
  useEffect(() => {
    console.log(`schemaData ${schemaData}`)
    if (schemaData?.schemaDefinition) {
      try {
        const parsed = safeJsonParse(schemaData.schemaDefinition);
        setParsedSchema(parsed);
        
        // Create form structure from schema
        const structure = createFormStructure(parsed);
        setFormStructure(structure);
        
        // Create validation schema
        const zodSchema = jsonSchemaToZod(parsed);
        setSchemaFormValidation(zodSchema);
        
        // Prepare initial values
        if (!editMode || (editMode && !isDirty)) {
          const initialValues = prepareFormInitialValues(parsed, formInitialValues);
          setFormInitialValues(initialValues);
          resetSchemaForm(initialValues);
        }
      } catch (error) {
        console.error('Error parsing schema definition:', error);
      }
    }
  }, [schemaData, editMode, isDirty, resetSchemaForm]);
  
  // Handlers
  const handleOpenCreateDialog = () => {
    setEditMode(false);
    setCurrentConfigName(null);
    reset({
      name: '',
      displayName: '',
      schemaId: '',
      category: '',
      placement: '',
      description: '',
    });
    setSelectedSchema(null);
    setParsedSchema(null);
    setFormStructure([]);
    setFormInitialValues({});
    resetSchemaForm({});
    setOpenDialog(true);
    setShowDataEditor(false);
    setShowPreview(false);
    setTabValue(0);
    setConfigError(null);
    setIsDirty(false);
    setShouldValidateSchema(false);
  };
  
  const handleOpenEditDialog = (name) => {
    setEditMode(true);
    setCurrentConfigName(name);
    setOpenDialog(true);
    setShowDataEditor(false);
    setShowPreview(false);
    setTabValue(0);
    setConfigError(null);
    setIsDirty(false);
    setShouldValidateSchema(false);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFileUploadError(null);
  };
  
  const handleOpenDeleteDialog = (name) => {
    setCurrentConfigName(name);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };
  
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setSearchTerm(event.target.value);
      setPage(1);
    }
  };
  
  const handleSearchChange = (event) => {
    if (event.target.value === '') {
      setSearchTerm('');
      setPage(1);
    }
  };
  
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(1);
  };
  
  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const handleSchemaFormChange = () => {
    setIsDirty(true);
  };
  
  const handleConfigSubmit = async (basicData) => {
    setShouldValidateSchema(true);
    
    if (!parsedSchema) {
      setConfigError('لطفا ابتدا یک طرحواره انتخاب کنید');
      return;
    }
    
    try {
      // Get data from schema form
      let configData = {};
      if (formStructure.length > 0) {
        // Submit schema form to get its data
        configData = await handleSchemaFormSubmit((data) => data)();
      }
      console.log(JSON.stringify(configData))
      const payload = {
        name: basicData.name,
        displayName: basicData.displayName,
        schemaId: basicData.schemaId,
        data: JSON.stringify(configData),
        category: basicData.category || null,
        placement: basicData.placement || null,
        description: basicData.description || null,
      };
      
      setConfigError(null);
      
      if (editMode) {
        await updateConfig({ name: currentConfigName, ...payload }).unwrap();
        enqueueSnackbar('پیکربندی با موفقیت به‌روزرسانی شد', { variant: 'success' });
      } else {
        await createConfig(payload).unwrap();
        enqueueSnackbar('پیکربندی با موفقیت ایجاد شد', { variant: 'success' });
      }
      
      setOpenDialog(false);
      refetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      setConfigError(error.data?.message || 'خطا در ذخیره پیکربندی');
    }
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteConfig(currentConfigName).unwrap();
      enqueueSnackbar('پیکربندی با موفقیت حذف شد', { variant: 'success' });
      setOpenDeleteDialog(false);
      refetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      enqueueSnackbar(error.data?.message || 'خطا در حذف پیکربندی', { variant: 'error' });
      setOpenDeleteDialog(false);
    }
  };
  
  const handleFileDrop = async (acceptedFiles) => {
    if (!currentConfigName || acceptedFiles.length === 0) return;
    
    setFileUploadError(null);
    
    try {
      const file = acceptedFiles[0];
      console.log(file)
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileUploadError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }
      
      // Upload file
      await uploadFile({
        configName: currentConfigName,
        file
      }).unwrap();
      
      refetchFiles();
      enqueueSnackbar('فایل با موفقیت آپلود شد', { variant: 'success' });
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileUploadError(error.data?.message || 'خطا در آپلود فایل');
    }
  };
  
  const handleDeleteFile = async (fileId) => {
    if (!currentConfigName || !fileId) return;
    
    try {
      await deleteFile({
        configName: currentConfigName,
        fileId
      }).unwrap();
      
      refetchFiles();
      enqueueSnackbar('فایل با موفقیت حذف شد', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting file:', error);
      enqueueSnackbar(error.data?.message || 'خطا در حذف فایل', { variant: 'error' });
    }
  };
  
  // Computed values
  const isSubmitting = isCreating || isUpdating;
  const configs = configsData?.data?.data || configsData?.data || [];
  const totalPages = configsData?.data.totalPages || configsData?.totalPages || 0;
  const loading = isLoadingConfigs || isFetchingConfigs;
  const schemas = schemasData?.data?.data || schemasData?.data || [];
  
  // Category options for filtering
  const categoryOptions = React.useMemo(() => {
    if (typeof configs.map !== "function" && configs.data)
        configs
    const uniqueCategories = [...new Set(configs.map(config => config.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [configs]);
  
  return (
    <Root className="flex flex-col flex-auto min-h-full">
      <div className="header p-24 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <Typography className="text-3xl font-bold tracking-tight leading-8">
            مدیریت پیکربندی‌ها
          </Typography>
          <Typography className="font-medium tracking-tight" color="text.secondary">
            پیکربندی‌های سایت را مدیریت کنید
          </Typography>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center mt-16 md:mt-0 gap-16">
          <TextField
            label="جستجو"
            placeholder="نام یا نام نمایشی پیکربندی را وارد کنید..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FuseSvgIcon size={20}>heroicons-outline:search</FuseSvgIcon>
                </InputAdornment>
              ),
            }}
            onKeyPress={handleSearch}
            onChange={handleSearchChange}
            className="md:min-w-200"
          />
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleToggleFilter}
            startIcon={<FuseSvgIcon>{filterOpen ? 'heroicons-outline:minus' : 'heroicons-outline:plus'}</FuseSvgIcon>}
            className="whitespace-nowrap"
          >
            {filterOpen ? 'بستن فیلتر' : 'نمایش فیلتر'}
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenCreateDialog}
            startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
            className="whitespace-nowrap"
          >
            افزودن پیکربندی جدید
          </Button>
        </div>
      </div>
      
      <Collapse in={filterOpen}>
        <Paper className="mx-24 mb-24 p-16">
          <Typography variant="subtitle1" className="mb-16">
            فیلتر پیکربندی‌ها
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>دسته‌بندی</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="دسته‌بندی"
                >
                  <MenuItem value="">همه دسته‌بندی‌ها</MenuItem>
                  {categoryOptions.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-1 items-center justify-center px-24"
      >
        {configsError ? (
          <Alert severity="error" className="w-full max-w-4xl">
            خطا در بارگیری پیکربندی‌ها: {configsError.data?.message || 'خطای ناشناخته'}
          </Alert>
        ) : (
          <Paper className="w-full max-w-6xl rounded-lg shadow overflow-hidden">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>نام</TableCell>
                    <TableCell>نام نمایشی</TableCell>
                    <TableCell>طرحواره</TableCell>
                    <TableCell>دسته‌بندی</TableCell>
                    <TableCell>مکان</TableCell>
                    <TableCell align="center">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" height={250}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : configs.length > 0 ? (
                    configs?.map((config) => (
                      <TableRow key={config.name}>
                        <TableCell>
                          <Tooltip title={config.name}>
                            <span className="font-medium">{config.name}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{config.displayName}</TableCell>
                        <TableCell>
                          {config.schema?.displayName || config.schema?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {config.category ? (
                            <Chip 
                              label={config.category} 
                              size="small" 
                              className="rounded-full" 
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {config.placement || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                            <Tooltip title="ویرایش">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEditDialog(config.name)}
                              >
                                <FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="حذف">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(config.name)}
                              >
                                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" height={100}>
                        <Typography color="text.secondary">
                          هیچ پیکربندی‌ای یافت نشد
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {totalPages > 1 && (
              <Box className="flex justify-between items-center p-16 border-t">
                <FormControl variant="outlined" size="small">
                  <InputLabel>تعداد در صفحه</InputLabel>
                  <Select
                    value={pageSize}
                    onChange={handleChangePageSize}
                    label="تعداد در صفحه"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Paper>
        )}
      </motion.div>
      
      {/* Create/Edit Config Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'ویرایش پیکربندی' : 'افزودن پیکربندی جدید'}
        </DialogTitle>
        <DialogContent>
          <form id="config-form" onSubmit={handleSubmit(handleConfigSubmit)}>
            {isLoadingCurrentConfig && editMode ? (
              <Box className="flex justify-center my-24">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {configError && (
                  <Alert severity="error" className="mb-16">
                    {configError}
                  </Alert>
                )}
                
                <Tabs
                  value={tabValue}
                  onChange={handleChangeTab}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  className="mb-24"
                >
                  <Tab label="اطلاعات پایه" />
                  <Tab label="داده‌های پیکربندی" disabled={!selectedSchema} />
                  <Tab label="فایل‌ها" disabled={!editMode} />
                </Tabs>
                
                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="نام (کلید یکتا)"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={editMode}
                            required
                            className="mb-16"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="displayName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="نام نمایشی"
                            fullWidth
                            error={!!errors.displayName}
                            helperText={errors.displayName?.message}
                            required
                            className="mb-16"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="schemaId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.schemaId} className="mb-16">
                            <InputLabel>طرحواره</InputLabel>
                            <Select
                              {...field}
                              label="طرحواره"
                              disabled={editMode || isLoadingSchemas}
                            >
                              {isLoadingSchemas ? (
                                <MenuItem disabled>در حال بارگذاری...</MenuItem>
                              ) : (
                                schemas.map((schema) => (
                                  <MenuItem key={schema.id} value={schema.id}>
                                    {schema.displayName || schema.name}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {errors.schemaId && (
                              <FormHelperText>{errors.schemaId.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="دسته‌بندی"
                            fullWidth
                            error={!!errors.category}
                            helperText={errors.category?.message}
                            className="mb-16"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="placement"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="مکان"
                            fullWidth
                            error={!!errors.placement}
                            helperText={errors.placement?.message}
                            className="mb-16"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="توضیحات"
                            fullWidth
                            multiline
                            rows={3}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            className="mb-16"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" color="text.secondary">
                    نام پیکربندی به عنوان کلید یکتا استفاده می‌شود و پس از ایجاد قابل تغییر نیست.
                  </Typography>
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  {isLoadingSchema ? (
                    <Box className="flex justify-center my-24">
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {!parsedSchema ? (
                        <Alert severity="info">
                          لطفا ابتدا یک طرحواره انتخاب کنید
                        </Alert>
                      ) : (
                        <>
                          <Box className="mb-16">
                            <Typography variant="subtitle1" className="mb-16">
                              وارد کردن داده‌های پیکربندی بر اساس طرحواره {schemaData?.displayName || schemaData?.name}
                            </Typography>
                            
                            {formStructure.length === 0 ? (
                              <Alert severity="info">
                                این طرحواره هیچ فیلدی برای وارد کردن ندارد
                              </Alert>
                            ) : (
                              <DynamicForm
                                schema={schemaData?.schemaDefinition}
                                initialData={formInitialValues}
                                onSubmit={handleSchemaFormChange}
                                control={schemaFormControl}
                                errors={schemaFormErrors}
                                submitButtonProps={{ style: { display: 'none' } }}
                              />
                            )}
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  {!editMode ? (
                    <Alert severity="info">
                      لطفا ابتدا پیکربندی را ایجاد کنید تا بتوانید فایل آپلود کنید
                    </Alert>
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" className="mb-16">
                        مدیریت فایل‌های پیکربندی
                      </Typography>
                      
                      {fileUploadError && (
                        <Alert severity="error" className="mb-16">
                          {fileUploadError}
                        </Alert>
                      )}
                      
                      <Dropzone onDrop={handleFileDrop} disabled={isUploading}>
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <Box
                            {...getRootProps()}
                            className={`dropzone mb-24 ${isDragActive ? 'dropzone-active' : ''}`}
                          >
                            <input {...getInputProps()} />
                            {isUploading ? (
                              <Box className="flex flex-col items-center justify-center p-24">
                                <CircularProgress size={40} className="mb-16" />
                                <Typography>در حال آپلود فایل...</Typography>
                              </Box>
                            ) : (
                              <Box className="flex flex-col items-center justify-center p-24">
                                <FuseSvgIcon className="mb-8" size={48}>heroicons-outline:upload</FuseSvgIcon>
                                <Typography>فایل خود را اینجا رها کنید یا کلیک کنید</Typography>
                                <Typography variant="caption" color="text.secondary" className="mt-4">
                                  (حداکثر حجم فایل: 5 مگابایت)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Dropzone>
                      
                      <Typography variant="subtitle2" className="mb-16">
                        فایل‌های آپلود شده
                      </Typography>
                      
                      {isLoadingFiles ? (
                        <Box className="flex justify-center my-24">
                          <CircularProgress />
                        </Box>
                      ) : configFiles && configFiles.length > 0 ? (
                        <Paper variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>نام فایل</TableCell>
                                <TableCell>نوع فایل</TableCell>
                                <TableCell align="right">حجم</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {configFiles.map((file) => (
                                <TableRow key={file.id}>
                                  <TableCell>{file.fileName}</TableCell>
                                  <TableCell>{file.contentType}</TableCell>
                                  <TableCell align="right">
                                    {Math.round(file.fileSize / 1024)} کیلوبایت
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title="حذف فایل">
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteFile(file.id)}
                                        disabled={isDeleting}
                                      >
                                        <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      ) : (
                        <Alert severity="info">
                          هیچ فایلی برای این پیکربندی آپلود نشده است
                        </Alert>
                      )}
                    </Box>
                  )}
                </TabPanel>
              </>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>انصراف</Button>
          <Button
            type="submit"
            form="config-form"
            variant="contained"
            color="primary"
            disabled={isSubmitting || isLoadingCurrentConfig}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'ذخیره'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>حذف پیکربندی</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف این پیکربندی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>انصراف</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeletingConfig}
          >
            {isDeletingConfig ? <CircularProgress size={24} /> : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default ConfigRecordsTab;