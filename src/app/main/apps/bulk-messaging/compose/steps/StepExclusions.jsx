import { useState, useCallback } from "react";
import {
  Typography,
  TextField,
  Chip,
  Button,
  Box,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useParseExclusionFileMutation } from "../../BulkMessagingApi";
import { enqueueSnackbar } from "notistack";

function StepExclusions({ excludedUsernames, onExcludedUsernamesChange }) {
  const [inputValue, setInputValue] = useState("");
  const [parseFile, { isLoading: isParsing }] = useParseExclusionFileMutation();

  const addUsername = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !excludedUsernames.includes(trimmed)) {
      onExcludedUsernamesChange([...excludedUsernames, trimmed]);
      setInputValue("");
    }
  }, [inputValue, excludedUsernames, onExcludedUsernamesChange]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUsername();
    }
  };

  const removeUsername = (username) => {
    onExcludedUsernamesChange(excludedUsernames.filter((u) => u !== username));
  };

  const clearAll = () => {
    onExcludedUsernamesChange([]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      enqueueSnackbar("فرمت فایل باید Excel یا CSV باشد", {
        variant: "error",
        style: { fontSize: "medium" },
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await parseFile(formData).unwrap();
      const newUsernames = (result?.usernames || []).filter(
        (u) => !excludedUsernames.includes(u)
      );
      if (newUsernames.length > 0) {
        onExcludedUsernamesChange([...excludedUsernames, ...newUsernames]);
        enqueueSnackbar(
          `${newUsernames.length} نام کاربری از فایل اضافه شد`,
          { variant: "success", style: { fontSize: "medium" } }
        );
      } else {
        enqueueSnackbar("نام کاربری جدیدی در فایل یافت نشد", {
          variant: "info",
          style: { fontSize: "medium" },
        });
      }
    } catch {
      enqueueSnackbar("خطا در پردازش فایل", {
        variant: "error",
        style: { fontSize: "medium" },
      });
    }
    // Reset input
    event.target.value = "";
  };

  return (
    <div className="flex flex-col">
      <Typography variant="h6" className="font-bold mb-8" color="text.primary">
        لیست استثنا (اختیاری)
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-24">
        نام‌کاربری کاربرانی که نمی‌خواهید پیام دریافت کنند را وارد کنید. می‌توانید
        به صورت دستی وارد کنید یا فایل اکسل آپلود نمایید.
      </Typography>

      <Alert
        severity="info"
        variant="outlined"
        sx={{ mb: 3, borderRadius: 2 }}
        icon={
          <FuseSvgIcon size={20}>heroicons-outline:information-circle</FuseSvgIcon>
        }
      >
        پیام به <strong>تمام کاربران</strong> به‌جز کاربران لیست استثنا ارسال خواهد
        شد. اگر لیست استثنایی ندارید، این مرحله را رد کنید.
      </Alert>

      {/* Input Row */}
      <Box className="flex flex-col sm:flex-row gap-12 mb-16">
        <TextField
          fullWidth
          size="small"
          label="نام کاربری"
          placeholder="نام کاربری را وارد کنید..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />
        <Box className="flex gap-8 shrink-0">
          <Button
            variant="contained"
            color="secondary"
            onClick={addUsername}
            disabled={!inputValue.trim()}
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            افزودن
          </Button>
          <Tooltip title="آپلود فایل اکسل" placement="top">
            <Button
              variant="outlined"
              color="secondary"
              component="label"
              disabled={isParsing}
              sx={{ borderRadius: 2, minWidth: 48, px: 1 }}
            >
              <FuseSvgIcon size={20}>
                heroicons-outline:cloud-upload
              </FuseSvgIcon>
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {isParsing && (
        <Box className="mb-16">
          <LinearProgress color="secondary" />
          <Typography variant="caption" color="text.secondary" className="mt-4">
            در حال پردازش فایل...
          </Typography>
        </Box>
      )}

      {/* Chips display */}
      {excludedUsernames.length > 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: 2, maxHeight: 240, overflow: "auto" }}
        >
          <Box className="flex items-center justify-between mb-8">
            <Typography variant="caption" color="text.secondary">
              {excludedUsernames.length} کاربر در لیست استثنا
            </Typography>
            <Tooltip title="حذف همه">
              <IconButton size="small" onClick={clearAll} color="error">
                <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <Box className="flex flex-wrap gap-8">
            <AnimatePresence>
              {excludedUsernames.map((username) => (
                <motion.div
                  key={username}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Chip
                    label={username}
                    onDelete={() => removeUsername(username)}
                    color="default"
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      "& .MuiChip-deleteIcon": {
                        transition: "all 0.2s",
                        "&:hover": { color: "error.main" },
                      },
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Paper>
      )}

      {excludedUsernames.length === 0 && (
        <Box className="flex flex-col items-center justify-center py-32 opacity-50">
          <FuseSvgIcon size={48} color="disabled">
            heroicons-outline:user-remove
          </FuseSvgIcon>
          <Typography variant="body2" color="text.secondary" className="mt-8">
            لیست استثنا خالی است
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default StepExclusions;
