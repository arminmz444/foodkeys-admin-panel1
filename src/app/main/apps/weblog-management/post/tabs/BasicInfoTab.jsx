import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { useGetWeblogCategoriesQuery, useGetWeblogTagsQuery } from '../../WeblogApi';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import faIR from 'date-fns/locale/fa-IR';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

/**
 * The basic info tab.
 */
function BasicInfoTab() {
  const methods = useFormContext();
  const { control, formState, watch } = methods;
  const { errors } = formState;

  const { data: categories = [] } = useGetWeblogCategoriesQuery({});
  const { data: tags = [] } = useGetWeblogTagsQuery({});

  const status = watch('status');

  return (
    <motion.div
      className="space-y-24"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Title & Slug Section */}
      <motion.div variants={sectionVariants}>
        <Paper 
          className="p-24 md:p-32 rounded-2xl space-y-24" 
          elevation={0} 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className="flex items-center gap-12 mb-8">
            <Box
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ 
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: (theme) => `0 4px 14px -4px ${alpha(theme.palette.primary.main, 0.4)}`
              }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:document-text</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">اطلاعات اصلی</Typography>
          </div>
          
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="عنوان پست *"
                fullWidth
                error={!!errors.title}
                helperText={errors?.title?.message}
                variant="outlined"
                placeholder="عنوان جذاب پست را وارد کنید..."
                InputProps={{
                  sx: { 
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }
                }}
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="نامک (Slug)"
                fullWidth
                variant="outlined"
                placeholder="نامک یکتا برای URL"
                helperText="اگر خالی باشد، از عنوان پست ساخته می‌شود"
                InputProps={{
                  dir: 'ltr',
                  sx: { borderRadius: '12px' },
                  startAdornment: (
                    <Box className="flex items-center gap-4 text-gray-400 mr-8">
                      <FuseSvgIcon size={18}>heroicons-outline:link</FuseSvgIcon>
                    </Box>
                  )
                }}
              />
            )}
          />

          <Controller
            name="excerpt"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="خلاصه"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="خلاصه کوتاه و جذاب از محتوای پست..."
                helperText="اگر خالی باشد، از ۱۶۰ کاراکتر اول محتوا ساخته می‌شود"
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
              />
            )}
          />
        </Paper>
      </motion.div>

      {/* Status & Category Section */}
      <motion.div variants={sectionVariants}>
        <Paper 
          className="p-24 md:p-32 rounded-2xl space-y-24" 
          elevation={0} 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className="flex items-center gap-12 mb-8">
            <Box
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ 
                background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                boxShadow: (theme) => `0 4px 14px -4px ${alpha(theme.palette.secondary.main, 0.4)}`
              }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:cog</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">وضعیت و دسته‌بندی</Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>وضعیت انتشار</InputLabel>
                  <Select {...field} label="وضعیت انتشار" sx={{ borderRadius: '12px' }}>
                    <MenuItem value="DRAFT">
                      <div className="flex items-center gap-12">
                        <Box className="w-10 h-10 rounded-full bg-amber-500" />
                        <span>پیش‌نویس</span>
                      </div>
                    </MenuItem>
                    <MenuItem value="PUBLISHED">
                      <div className="flex items-center gap-12">
                        <Box className="w-10 h-10 rounded-full bg-green-500" />
                        <span>منتشر شده</span>
                      </div>
                    </MenuItem>
                    <MenuItem value="SCHEDULED">
                      <div className="flex items-center gap-12">
                        <Box className="w-10 h-10 rounded-full bg-blue-500" />
                        <span>زمان‌بندی شده</span>
                      </div>
                    </MenuItem>
                    <MenuItem value="ARCHIVED">
                      <div className="flex items-center gap-12">
                        <Box className="w-10 h-10 rounded-full bg-gray-500" />
                        <span>آرشیو شده</span>
                      </div>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    {...field}
                    label="دسته‌بندی"
                    value={field.value || ''}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="">
                      <em className="text-gray-400">بدون دسته‌بندی</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{cat.name}</span>
                          {cat._count?.posts > 0 && (
                            <Chip
                              size="small"
                              label={`${cat._count.posts} پست`}
                              sx={{ 
                                ml: 1, 
                                height: 22, 
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                                color: 'secondary.main'
                              }}
                            />
                          )}
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </div>

          {(status === 'PUBLISHED' || status === 'SCHEDULED') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Controller
                name="publishedAt"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={faIR}>
                    <DateTimePicker
                      label="تاریخ انتشار"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: status === 'SCHEDULED' ? 'پست در این تاریخ منتشر خواهد شد' : '',
                          InputProps: { sx: { borderRadius: '12px' } }
                        }
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </motion.div>
          )}
        </Paper>
      </motion.div>

      {/* Tags Section */}
      <motion.div variants={sectionVariants}>
        <Paper 
          className="p-24 md:p-32 rounded-2xl space-y-24" 
          elevation={0} 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className="flex items-center gap-12 mb-8">
            <Box
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ 
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 4px 14px -4px rgba(245, 158, 11, 0.4)'
              }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:tag</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">برچسب‌ها</Typography>
          </div>
          
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name || ''}
                value={tags.filter((t) => field.value?.includes(t.id)) || []}
                onChange={(_, newValue) => {
                  field.onChange(newValue.map((v) => v.id));
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="برچسب‌ها"
                    placeholder="برچسب‌ها را انتخاب یا جستجو کنید..."
                    InputProps={{
                      ...params.InputProps,
                      sx: { borderRadius: '12px' }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 500,
                        backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.15),
                        color: 'warning.dark'
                      }}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div className="flex items-center justify-between w-full py-4">
                      <div className="flex items-center gap-8">
                        <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:tag</FuseSvgIcon>
                        <span>{option.name}</span>
                      </div>
                      {option._count?.posts > 0 && (
                        <Chip
                          size="small"
                          label={`${option._count.posts} پست`}
                          sx={{ 
                            height: 22, 
                            fontSize: '0.7rem',
                            borderRadius: '6px',
                            backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.1)
                          }}
                        />
                      )}
                    </div>
                  </li>
                )}
              />
            )}
          />
        </Paper>
      </motion.div>

      {/* Featured Image Section */}
      <motion.div variants={sectionVariants}>
        <Paper 
          className="p-24 md:p-32 rounded-2xl space-y-24" 
          elevation={0} 
          sx={{ 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className="flex items-center gap-12 mb-8">
            <Box
              className="w-40 h-40 rounded-xl flex items-center justify-center"
              sx={{ 
                background: (theme) => `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                boxShadow: (theme) => `0 4px 14px -4px ${alpha(theme.palette.info.main, 0.4)}`
              }}
            >
              <FuseSvgIcon className="text-white" size={20}>heroicons-outline:photograph</FuseSvgIcon>
            </Box>
            <Typography className="font-bold text-lg">تصویر شاخص</Typography>
          </div>
          
          <Controller
            name="featuredImage"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="آدرس تصویر شاخص"
                fullWidth
                variant="outlined"
                placeholder="https://example.com/image.jpg"
                helperText="آدرس URL تصویر شاخص پست"
                InputProps={{
                  dir: 'ltr',
                  sx: { borderRadius: '12px' },
                  startAdornment: (
                    <Box className="flex items-center gap-4 text-gray-400 mr-8">
                      <FuseSvgIcon size={18}>heroicons-outline:link</FuseSvgIcon>
                    </Box>
                  )
                }}
              />
            )}
          />

          {watch('featuredImage') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-16"
            >
              <Box 
                className="relative rounded-2xl overflow-hidden inline-block"
                sx={{ 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                  maxWidth: 400
                }}
              >
                <img
                  src={watch('featuredImage')}
                  alt="تصویر شاخص"
                  className="max-w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <Box
                  className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-16"
                >
                  <Typography className="text-white text-sm font-medium">پیش‌نمایش تصویر شاخص</Typography>
                </Box>
              </Box>
            </motion.div>
          )}
        </Paper>
      </motion.div>
    </motion.div>
  );
}

export default BasicInfoTab;
