import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useGetWeblogCategoriesQuery } from '../WeblogApi';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import Chip from '@mui/material/Chip';

/**
 * The category form.
 */
function CategoryForm() {
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { categoryId } = useParams();
  const isNew = categoryId === 'new';

  const { data: categories = [] } = useGetWeblogCategoriesQuery({});

  // Filter out current category from parent options
  const parentOptions = categories.filter((cat) => cat.id !== parseInt(categoryId));

  return (
    <div className="space-y-24">
      {/* Basic Info */}
      <Paper className="p-24 space-y-24" elevation={0} sx={{ backgroundColor: 'background.default' }}>
        <Typography className="font-semibold text-lg border-b pb-8">اطلاعات دسته‌بندی</Typography>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="نام دسته‌بندی *"
              fullWidth
              error={!!errors.name}
              helperText={errors?.name?.message}
              variant="outlined"
              placeholder="نام دسته‌بندی را وارد کنید..."
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
              helperText="اگر خالی باشد، از نام دسته‌بندی ساخته می‌شود"
              InputProps={{
                dir: 'ltr'
              }}
            />
          )}
        />

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
              variant="outlined"
              placeholder="توضیحات دسته‌بندی..."
            />
          )}
        />

        <Controller
          name="parentId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>دسته‌بندی والد</InputLabel>
              <Select
                {...field}
                label="دسته‌بندی والد"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              >
                <MenuItem value="">
                  <em>بدون والد (دسته‌بندی اصلی)</em>
                </MenuItem>
                {parentOptions.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{cat.name}</span>
                      {cat._count?.posts > 0 && (
                        <Chip
                          size="small"
                          label={`${cat._count.posts} پست`}
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Paper>

      {/* SEO Settings */}
      <Paper className="p-24 space-y-24" elevation={0} sx={{ backgroundColor: 'background.default' }}>
        <Typography className="font-semibold text-lg border-b pb-8">تنظیمات سئو</Typography>

        <Controller
          name="metaTitle"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="عنوان متا"
              fullWidth
              variant="outlined"
              placeholder="عنوان سئو برای موتورهای جستجو"
              helperText="اگر خالی باشد، از نام دسته‌بندی استفاده می‌شود"
            />
          )}
        />

        <Controller
          name="metaDescription"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="توضیحات متا"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="توضیحات سئو برای موتورهای جستجو"
              helperText="اگر خالی باشد، از توضیحات دسته‌بندی استفاده می‌شود"
            />
          )}
        />
      </Paper>
    </div>
  );
}

export default CategoryForm;
