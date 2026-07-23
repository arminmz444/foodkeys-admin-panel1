// src/components/FilterDrawer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { X, Filter, RotateCcw } from 'lucide-react';
import { useGetCategoryOptionsQuery } from 'src/app/main/category/CategoriesApi';
import { useGetServiceSubcategoryOptionsQuery } from '../../ServicesBankApi';

// Request status options
const requestStatusOptions = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 0, label: 'ثبت اولیه' },
  { value: 1, label: 'در انتظار' },
  { value: 2, label: 'تایید شده' },
  { value: 3, label: 'رد شده' }
];

// Request type options for services
const requestTypeOptions = [
  { value: '', label: 'همه درخواست‌ها' },
  { value: 1, label: 'درخواست ایجاد سرویس' },
  { value: 2, label: 'درخواست ویرایش سرویس' },
  { value: 3, label: 'درخواست حذف سرویس' },
  { value: 5, label: 'درخواست بازبینی' },
  { value: 6, label: 'ثبت سرویس' },
  { value: 9, label: 'به‌روزرسانی سرویس' },
  { value: 11, label: 'بررسی' }
];

const EMPTY_FILTERS = {
  status: null,
  type: null,
  search: '',
  categoryId: '',
  subCategoryId: ''
};

/**
 * FilterDrawer Component - Drawer for filtering service requests
 *
 * Dynamically loads SERVICE categories from `/category/options`, then loads
 * subcategories for the selected category via `/category/{categoryId}/subcategory`.
 */
export default function FilterDrawer({ open, onClose, filters, onApply, isLoading }) {
  const [localFilters, setLocalFilters] = useState({ ...EMPTY_FILTERS });

  const {
    data: categoryOptionsData,
    isLoading: isCategoriesLoading
  } = useGetCategoryOptionsQuery(
    {
      pageNumber: 1,
      pageSize: 1000,
      search: '',
      sort: '',
      filter: ''
    },
    { skip: !open }
  );

  const serviceCategories = useMemo(
    () =>
      (categoryOptionsData?.data || []).filter(
        (option) => option?.dependantEntityType === 'SERVICE'
      ),
    [categoryOptionsData]
  );

  const selectedCategoryId = localFilters.categoryId;

  const {
    data: subcategories = [],
    isLoading: isSubcategoriesLoading,
    isFetching: isSubcategoriesFetching
  } = useGetServiceSubcategoryOptionsQuery(selectedCategoryId, {
    skip: !open || selectedCategoryId == null || selectedCategoryId === ''
  });

  const subcategoryOptions = useMemo(() => {
    if (!Array.isArray(subcategories)) {
      return [];
    }

    return subcategories.map((item) => ({
      value: item.value ?? item.id ?? item.subCategoryId,
      label: item.label ?? item.name ?? item.subCategoryDisplayName ?? String(item.value ?? item.id)
    }));
  }, [subcategories]);

  useEffect(() => {
    if (open) {
      setLocalFilters({
        ...EMPTY_FILTERS,
        ...filters,
        categoryId: filters?.categoryId ?? '',
        subCategoryId: filters?.subCategoryId ?? '',
        status: filters?.status ?? null,
        type: filters?.type ?? null,
        search: filters?.search ?? ''
      });
    }
  }, [filters, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLocalFilters((prev) => {
      const next = { ...prev, [name]: value };

      // Changing category clears the dependent subcategory selection.
      if (name === 'categoryId') {
        next.subCategoryId = '';
      }

      return next;
    });
  };

  const handleApply = () => {
    onApply({
      ...localFilters,
      categoryId: localFilters.categoryId === '' ? null : localFilters.categoryId,
      subCategoryId: localFilters.subCategoryId === '' ? null : localFilters.subCategoryId,
      status: localFilters.status === '' ? null : localFilters.status,
      type: localFilters.type === '' ? null : localFilters.type
    });
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ ...EMPTY_FILTERS });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
          borderRadius: '0'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" display="flex" alignItems="center">
          <Filter size={20} className="mr-2" />
          فیلتر درخواست‌های سرویس
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          label="جستجو"
          name="search"
          value={localFilters.search || ''}
          onChange={handleChange}
          placeholder="نام سرویس، نام کاربر و..."
          variant="outlined"
          helperText="جستجو بر اساس نام سرویس، نام درخواست‌کننده"
        />

        <FormControl fullWidth>
          <InputLabel>دسته‌بندی سرویس</InputLabel>
          <Select
            name="categoryId"
            value={localFilters.categoryId ?? ''}
            onChange={handleChange}
            label="دسته‌بندی سرویس"
            disabled={isCategoriesLoading}
            endAdornment={isCategoriesLoading && <CircularProgress size={20} sx={{ mr: 2 }} />}
          >
            <MenuItem value="">همه دسته‌بندی‌ها</MenuItem>
            {serviceCategories.map((category) => (
              <MenuItem key={`category-${category.value}`} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>فیلتر بر اساس دسته‌بندی سرویس</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>زیردسته سرویس</InputLabel>
          <Select
            name="subCategoryId"
            value={localFilters.subCategoryId ?? ''}
            onChange={handleChange}
            label="زیردسته سرویس"
            disabled={
              !selectedCategoryId ||
              isSubcategoriesLoading ||
              isSubcategoriesFetching
            }
            endAdornment={
              (isSubcategoriesLoading || isSubcategoriesFetching) && (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              )
            }
          >
            <MenuItem value="">همه زیردسته‌ها</MenuItem>
            {subcategoryOptions.map((subcategory) => (
              <MenuItem
                key={`subcategory-${subcategory.value}`}
                value={subcategory.value}
              >
                {subcategory.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {!selectedCategoryId
              ? 'ابتدا یک دسته‌بندی انتخاب کنید'
              : 'فیلتر بر اساس زیردسته سرویس'}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>وضعیت درخواست</InputLabel>
          <Select
            name="status"
            value={localFilters.status ?? ''}
            onChange={handleChange}
            label="وضعیت درخواست"
          >
            {requestStatusOptions.map((option) => (
              <MenuItem key={`status-${option.value === '' ? 'all' : option.value}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>فیلتر بر اساس وضعیت درخواست</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>نوع درخواست</InputLabel>
          <Select
            name="type"
            value={localFilters.type ?? ''}
            onChange={handleChange}
            label="نوع درخواست"
          >
            {requestTypeOptions.map((option) => (
              <MenuItem key={`type-${option.value === '' ? 'all' : option.value}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>فیلتر بر اساس نوع درخواست</FormHelperText>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleReset}
            startIcon={<RotateCcw size={16} />}
            disabled={isLoading}
          >
            پاک کردن فیلترها
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
            startIcon={<Filter size={16} />}
            color="primary"
            disabled={isLoading}
          >
            اعمال فیلتر
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
