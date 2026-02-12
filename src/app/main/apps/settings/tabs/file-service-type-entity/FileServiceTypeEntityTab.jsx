import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MdTextFields, MdNumbers, MdExtension } from 'react-icons/md';
import { BiCodeCurly } from 'react-icons/bi';
import { FaDatabase } from 'react-icons/fa';
import { z } from 'zod';
import { 
  useGetFileServiceTypesQuery, 
  useCreateFileServiceTypeMutation,
  useUpdateFileServiceTypeMutation,
  useDeleteFileServiceTypeMutation
} from './store/fileServiceTypeEntityApi';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { Edit, Delete, Add } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

// Standard file types array
const standardFileTypes = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Word Document', value: 'doc,docx' },
  { label: 'Excel Spreadsheet', value: 'xls,xlsx' },
  { label: 'PowerPoint Presentation', value: 'ppt,pptx' },
  { label: 'Text File', value: 'txt' },
  { label: 'CSV File', value: 'csv' },
  { label: 'Image (JPEG)', value: 'jpg,jpeg' },
  { label: 'Image (PNG)', value: 'png' },
  { label: 'Image (GIF)', value: 'gif' },
  { label: 'Image (SVG)', value: 'svg' },
  { label: 'Image (WEBP)', value: 'webp' },
  { label: 'Audio (MP3)', value: 'mp3' },
  { label: 'Audio (WAV)', value: 'wav' },
  { label: 'Video (MP4)', value: 'mp4' },
  { label: 'Video (AVI)', value: 'avi' },
  { label: 'Video (MOV)', value: 'mov' },
  { label: 'Archive (ZIP)', value: 'zip' },
  { label: 'Archive (RAR)', value: 'rar' },
  { label: 'JSON File', value: 'json' },
  { label: 'XML File', value: 'xml' },
  { label: 'HTML File', value: 'html,htm' },
  { label: 'CSS File', value: 'css' },
  { label: 'JavaScript File', value: 'js' },
  { label: 'Java File', value: 'java' },
  { label: 'Python File', value: 'py' },
  { label: 'C/C++ File', value: 'c,cpp,h' },
  { label: 'SQL File', value: 'sql' },
  { label: 'Markdown File', value: 'md' },
  { label: 'Font File', value: 'ttf,otf' },
  { label: 'EPS File', value: 'eps' }
];

// Schema validation with Zod
const schema = z.object({
  name: z.string().nonempty('نام الزامی می‌باشد.'),
  displayName: z.string().nonempty('نام نمایشی الزامی می‌باشد.'),
  maxSize: z.number().positive('حداکثر اندازه باید عدد مثبت باشد.').or(z.string().transform(val => val ? Number(val) : undefined)),
  entityClass: z.string().optional(),
  fileEntityChild: z.string().optional(),
  entityMappings: z.string().optional(),
  jsonSchema: z.string().optional(),
  zodSchema: z.string().optional(),
  validExtensions: z.string().optional(),
  selectedFileTypes: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  maxFiles: z.number().int('حداکثر تعداد فایل‌ها باید عدد صحیح باشد.').positive('حداکثر تعداد فایل‌ها باید عدد مثبت باشد.').or(z.string().transform(val => val ? Number(val) : undefined)),
  scanWithAntivirus: z.boolean().optional()
});

const defaultValues = {
  name: '',
  displayName: '',
  maxSize: 100000,
  entityClass: '',
  fileEntityChild: '',
  entityMappings: '',
  jsonSchema: '',
  zodSchema: '',
  validExtensions: '',
  selectedFileTypes: [],
  maxFiles: 1,
  scanWithAntivirus: true
};

function FileServiceTypeTab() {
  const { data: fileServiceTypes = [], isLoading } = useGetFileServiceTypesQuery();
  const [createFileServiceType] = useCreateFileServiceTypeMutation();
  const [updateFileServiceType] = useUpdateFileServiceTypeMutation();
  const [deleteFileServiceType] = useDeleteFileServiceTypeMutation();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  
  const { control, reset, handleSubmit, formState } = useForm({
    defaultValues,
    mode: 'all',
    resolver: zodResolver(schema)
  });
  
  const { isValid, dirtyFields, errors } = formState;
  
  useEffect(() => {
    if (selectedType) {
      // Convert validExtensions string to selectedFileTypes array
      const validExtensions = selectedType.validExtensions || '';
      const extensions = validExtensions.split(',').filter(ext => ext.trim() !== '');
      
      const selectedFileTypes = [];
      if (extensions.length > 0) {
        // Find matching file types from the standard list
        standardFileTypes.forEach(fileType => {
          const fileTypeExtensions = fileType.value.split(',');
          if (fileTypeExtensions.some(ext => extensions.includes(ext))) {
            selectedFileTypes.push(fileType);
          }
        });
        
        // Add any custom extensions not in the standard list
        const standardExtensions = standardFileTypes.flatMap(fileType => 
          fileType.value.split(',')
        );
        
        const customExtensions = extensions.filter(ext => 
          !standardExtensions.includes(ext)
        );
        
        if (customExtensions.length > 0) {
          selectedFileTypes.push({
            label: 'Custom',
            value: customExtensions.join(',')
          });
        }
      }
      
      reset({
        ...selectedType,
        selectedFileTypes
      });
    } else {
      reset(defaultValues);
    }
  }, [selectedType, reset]);
  
  const handleOpenDialog = (type = null) => {
    if (type) {
      setSelectedType(type);
      setIsEdit(true);
    } else {
      setSelectedType(null);
      setIsEdit(false);
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedType(null);
    setIsEdit(false);
    reset(defaultValues);
  };
  
  const handleDelete = (name) => {
    if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      deleteFileServiceType(name);
    }
  };
  
  const onSubmit = (formData) => {
    // Convert selectedFileTypes array to validExtensions string
    const selectedFileTypes = formData.selectedFileTypes || [];
    const validExtensions = selectedFileTypes
      .flatMap(fileType => fileType.value.split(','))
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .join(',');
    
    const dataToSubmit = {
      ...formData,
      validExtensions
    };
    
    // Remove the selectedFileTypes field as it's not needed in the backend
    delete dataToSubmit.selectedFileTypes;
    
    if (isEdit) {
      updateFileServiceType(dataToSubmit);
    } else {
      createFileServiceType(dataToSubmit);
    }
    handleCloseDialog();
  };
  
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="w-full h-full flex flex-col p-24 md:p-32" 
      initial="hidden"
      animate="show"
      variants={containerAnimation}
    >
      <motion.div 
        className="flex items-center justify-between mb-24 flex-shrink-0"
        variants={itemAnimation}
      >
        <div>
          <Typography className="text-2xl font-bold">مدیریت انواع فایل سرویس</Typography>
          <Typography color="text.secondary" className="mt-4">
            در این بخش می‌توانید انواع فایل‌های سرویس را مدیریت کنید.
          </Typography>
        </div>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          className="flex-shrink-0"
        >
          افزودن نوع جدید
        </Button>
      </motion.div>
      
      <motion.div 
        variants={itemAnimation}
        className="flex-1 min-h-0"
      >
        <Paper className="h-full flex flex-col">
          <TableContainer className="flex-1 overflow-auto">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">نام</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">نام نمایشی</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">حداکثر اندازه</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">پسوندهای مجاز</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">حداکثر فایل</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold">آنتی‌ویروس</TableCell>
                  <TableCell className="bg-gray-50 dark:bg-gray-800 font-semibold" align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-64">
                      <div className="flex flex-col items-center gap-8">
                        <FuseSvgIcon className="animate-spin" size={32}>heroicons-outline:refresh</FuseSvgIcon>
                        <Typography color="text.secondary">در حال بارگذاری...</Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : fileServiceTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-64">
                      <div className="flex flex-col items-center gap-8">
                        <FuseSvgIcon size={48} className="text-gray-400">heroicons-outline:document</FuseSvgIcon>
                        <Typography color="text.secondary">هیچ نوع فایل سرویسی تعریف نشده است</Typography>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleOpenDialog()}
                        >
                          افزودن اولین مورد
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  fileServiceTypes.map((type) => (
                    <TableRow 
                      key={type.name}
                      hover
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-8">
                          <FuseSvgIcon size={20} className="text-gray-500">heroicons-outline:tag</FuseSvgIcon>
                          <Typography className="font-medium">{type.name}</Typography>
                        </div>
                      </TableCell>
                      <TableCell>{type.displayName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(type.maxSize / 1024).toFixed(0)} KB`} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-4 max-w-xs">
                          {type.validExtensions ? (
                            type.validExtensions.split(',').slice(0, 3).map((ext, idx) => (
                              <Chip 
                                key={idx}
                                label={`.${ext.trim()}`} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                          {type.validExtensions && type.validExtensions.split(',').length > 3 && (
                            <Chip 
                              label={`+${type.validExtensions.split(',').length - 3}`} 
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={type.maxFiles} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={type.scanWithAntivirus ? 'فعال' : 'غیرفعال'}
                          size="small"
                          color={type.scanWithAntivirus ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex gap-4 justify-center">
                          <IconButton 
                            onClick={() => handleOpenDialog(type)} 
                            color="primary"
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(type.name)} 
                            color="error"
                            size="small"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </motion.div>
      
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b">
          <div className="flex items-center gap-8">
            <FuseSvgIcon size={24} color="action">
              {isEdit ? 'heroicons-outline:pencil' : 'heroicons-outline:plus-circle'}
            </FuseSvgIcon>
            <Typography variant="h6">
              {isEdit ? 'ویرایش نوع فایل سرویس' : 'افزودن نوع فایل سرویس جدید'}
            </Typography>
          </div>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <DialogContent className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام"
                    placeholder="نام انحصاری برای نوع فایل سرویس"
                    id="name"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    disabled={isEdit}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdTextFields size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="displayName"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام نمایشی"
                    placeholder="نام نمایشی برای نوع فایل سرویس"
                    id="displayName"
                    error={!!errors.displayName}
                    helperText={errors?.displayName?.message}
                    variant="outlined"
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdTextFields size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="maxSize"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="حداکثر اندازه"
                    placeholder="حداکثر اندازه به بایت"
                    id="maxSize"
                    type="number"
                    error={!!errors.maxSize}
                    helperText={errors?.maxSize?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdNumbers size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="maxFiles"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="حداکثر تعداد فایل‌ها"
                    placeholder="حداکثر تعداد فایل‌های مجاز"
                    id="maxFiles"
                    type="number"
                    error={!!errors.maxFiles}
                    helperText={errors?.maxFiles?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdNumbers size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="entityClass"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="کلاس موجودیت"
                    placeholder="نام کلاس موجودیت"
                    id="entityClass"
                    error={!!errors.entityClass}
                    helperText={errors?.entityClass?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaDatabase size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="fileEntityChild"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="فرزند موجودیت فایل"
                    placeholder="نام فرزند موجودیت فایل"
                    id="fileEntityChild"
                    error={!!errors.fileEntityChild}
                    helperText={errors?.fileEntityChild?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaDatabase size={20} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                control={control}
                name="selectedFileTypes"
                render={({ field: { onChange, value = [] } }) => (
                  <Autocomplete
                    multiple
                    id="fileTypes"
                    options={standardFileTypes}
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="پسوندهای مجاز"
                        placeholder="انتخاب پسوندهای مجاز"
                        error={!!errors.selectedFileTypes}
                        helperText={errors?.selectedFileTypes?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <MdExtension size={20} />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.label}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                )}
              />
              
              <Controller
                name="scanWithAntivirus"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col justify-center">
                    <FormControlLabel
                      classes={{ root: 'm-0', label: 'flex flex-1' }}
                      labelPlacement="start"
                      label="اسکن با آنتی‌ویروس"
                      control={
                        <Switch
                          onChange={(ev) => {
                            onChange(ev.target.checked);
                          }}
                          checked={value}
                          name="scanWithAntivirus"
                        />
                      }
                    />
                    <FormHelperText className="font-300">
                      فایل‌ها با آنتی‌ویروس اسکن شوند؟
                    </FormHelperText>
                  </div>
                )}
              />
              
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="entityMappings"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نگاشت‌های موجودیت"
                      placeholder="JSON نگاشت‌های موجودیت"
                      id="entityMappings"
                      error={!!errors.entityMappings}
                      helperText={errors?.entityMappings?.message}
                      variant="outlined"
                      multiline
                      rows={4}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" className="self-start mt-16">
                            <BiCodeCurly size={20} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </div>
              
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="jsonSchema"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="طرح JSON"
                      placeholder="طرح JSON برای اعتبارسنجی"
                      id="jsonSchema"
                      error={!!errors.jsonSchema}
                      helperText={errors?.jsonSchema?.message}
                      variant="outlined"
                      multiline
                      rows={4}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" className="self-start mt-16">
                            <BiCodeCurly size={20} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </div>
              
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="zodSchema"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="طرح Zod"
                      placeholder="طرح Zod برای اعتبارسنجی"
                      id="zodSchema"
                      error={!!errors.zodSchema}
                      helperText={errors?.zodSchema?.message}
                      variant="outlined"
                      multiline
                      rows={4}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" className="self-start mt-16">
                            <BiCodeCurly size={20} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </DialogContent>
          
          <DialogActions className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t p-16 gap-8">
            <Button
              variant="outlined"
              onClick={handleCloseDialog}
              size="large"
              fullWidth
            >
              انصراف
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={_.isEmpty(dirtyFields) || !isValid}
              type="submit"
              size="large"
              fullWidth
            >
              {isEdit ? 'بروزرسانی' : 'ذخیره'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
}

export default FileServiceTypeTab;