import { useState, useMemo } from "react";
import {
  Typography,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Paper,
  Chip,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useGetSubCategoriesForMessagingQuery } from "../../BulkMessagingApi";

function StepSubCategorySelection({
  selectedSubCategories,
  onSubCategoriesChange,
}) {
  const [search, setSearch] = useState("");
  const {
    data: subCategories = [],
    isLoading,
    isError,
  } = useGetSubCategoriesForMessagingQuery();

  const filtered = useMemo(() => {
    if (!search.trim()) return subCategories;
    const lower = search.toLowerCase();
    return subCategories.filter(
      (sc) =>
        sc.name?.toLowerCase().includes(lower) ||
        sc.title?.toLowerCase().includes(lower) ||
        sc.faName?.toLowerCase().includes(lower)
    );
  }, [subCategories, search]);

  const isSelected = (sc) =>
    selectedSubCategories.some((item) => item.id === sc.id);

  const toggleSubCategory = (sc) => {
    if (isSelected(sc)) {
      onSubCategoriesChange(
        selectedSubCategories.filter((item) => item.id !== sc.id)
      );
    } else {
      onSubCategoriesChange([...selectedSubCategories, sc]);
    }
  };

  const selectAll = () => {
    onSubCategoriesChange(filtered);
  };

  const deselectAll = () => {
    onSubCategoriesChange([]);
  };

  return (
    <div className="flex flex-col">
      <Typography variant="h6" className="font-bold mb-8" color="text.primary">
        زیردسته‌های مورد نظر را انتخاب کنید
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-24">
        پیام به شرکت‌ها/کاربرانی که در زیردسته‌های انتخاب شده ثبت‌نام کرده‌اند
        ارسال می‌شود
      </Typography>

      {/* Selected chips */}
      {selectedSubCategories.length > 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: 1.5, mb: 2 }}
        >
          <Box className="flex items-center gap-8 mb-8">
            <Typography variant="caption" color="text.secondary">
              {selectedSubCategories.length} زیردسته انتخاب شده
            </Typography>
            <Chip
              label="حذف همه"
              size="small"
              color="error"
              variant="outlined"
              onClick={deselectAll}
              sx={{ borderRadius: 1.5, cursor: "pointer" }}
            />
          </Box>
          <Box className="flex flex-wrap gap-6">
            <AnimatePresence>
              {selectedSubCategories.map((sc) => (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                >
                  <Chip
                    label={sc.faName || sc.name || sc.title}
                    onDelete={() => toggleSubCategory(sc)}
                    color="secondary"
                    variant="filled"
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Paper>
      )}

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="جستجوی زیردسته..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          sx: { borderRadius: 2 },
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18} color="action">
                heroicons-outline:search
              </FuseSvgIcon>
            </InputAdornment>
          ),
        }}
      />

      {/* Action buttons */}
      <Box className="flex gap-8 mb-8">
        <Chip
          label="انتخاب همه"
          variant="outlined"
          color="secondary"
          size="small"
          onClick={selectAll}
          sx={{ borderRadius: 1.5, cursor: "pointer" }}
        />
      </Box>

      {/* List */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          maxHeight: 320,
          overflow: "auto",
        }}
      >
        {isLoading && (
          <Box className="p-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            خطا در دریافت زیردسته‌ها
          </Alert>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Box className="flex flex-col items-center py-32 opacity-50">
            <FuseSvgIcon size={40} color="disabled">
              heroicons-outline:search
            </FuseSvgIcon>
            <Typography variant="body2" color="text.secondary" className="mt-8">
              زیردسته‌ای یافت نشد
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && (
          <List dense disablePadding>
            {filtered.map((sc, index) => (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
              >
                <ListItem disablePadding divider>
                  <ListItemButton
                    onClick={() => toggleSubCategory(sc)}
                    sx={{
                      transition: "all 0.15s ease",
                      bgcolor: isSelected(sc)
                        ? "action.selected"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={isSelected(sc)}
                        tabIndex={-1}
                        disableRipple
                        color="secondary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={sc.faName || sc.name || sc.title}
                      secondary={sc.categoryName || sc.description || null}
                      primaryTypographyProps={{ fontWeight: isSelected(sc) ? 700 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </Paper>
    </div>
  );
}

export default StepSubCategorySelection;
