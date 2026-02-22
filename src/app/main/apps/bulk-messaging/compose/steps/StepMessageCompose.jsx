import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { enqueueSnackbar } from "notistack";
import {
  useGetBulkMessagingTemplatesQuery,
  useCreateBulkMessagingTemplateMutation,
  useDeleteBulkMessagingTemplateMutation,
} from "../../BulkMessagingApi";

function StepMessageCompose({
  messageContent,
  onMessageContentChange,
  selectedTemplateId,
  onTemplateIdChange,
}) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
  } = useGetBulkMessagingTemplatesQuery();

  const [createTemplate, { isLoading: isCreating }] =
    useCreateBulkMessagingTemplateMutation();
  const [deleteTemplate] = useDeleteBulkMessagingTemplateMutation();

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      enqueueSnackbar("نام قالب نمی‌تواند خالی باشد", {
        variant: "warning",
        style: { fontSize: "medium" },
      });
      return;
    }
    if (!messageContent.trim()) {
      enqueueSnackbar("ابتدا متن پیام را وارد کنید", {
        variant: "warning",
        style: { fontSize: "medium" },
      });
      return;
    }

    // Check if name already exists
    const exists = templates.some(
      (t) => t.name?.toLowerCase() === templateName.trim().toLowerCase()
    );
    if (exists) {
      enqueueSnackbar("قالبی با این نام قبلاً وجود دارد", {
        variant: "error",
        style: { fontSize: "medium" },
      });
      return;
    }

    try {
      await createTemplate({
        name: templateName.trim(),
        content: messageContent,
      }).unwrap();
      enqueueSnackbar("قالب با موفقیت ذخیره شد", {
        variant: "success",
        style: { fontSize: "medium" },
      });
      setSaveDialogOpen(false);
      setTemplateName("");
    } catch {
      enqueueSnackbar("خطا در ذخیره قالب", {
        variant: "error",
        style: { fontSize: "medium" },
      });
    }
  };

  const handleSelectTemplate = (template) => {
    onMessageContentChange(template.content);
    onTemplateIdChange(template.id);
    setShowTemplates(false);
    enqueueSnackbar(`قالب "${template.name}" بارگذاری شد`, {
      variant: "info",
      style: { fontSize: "medium" },
    });
  };

  const handleDeleteTemplate = async (e, templateId) => {
    e.stopPropagation();
    try {
      await deleteTemplate(templateId).unwrap();
      if (selectedTemplateId === templateId) {
        onTemplateIdChange(null);
      }
      enqueueSnackbar("قالب حذف شد", {
        variant: "success",
        style: { fontSize: "medium" },
      });
    } catch {
      enqueueSnackbar("خطا در حذف قالب", {
        variant: "error",
        style: { fontSize: "medium" },
      });
    }
  };

  return (
    <div className="flex flex-col">
      <Typography variant="h6" className="font-bold mb-8" color="text.primary">
        متن پیام
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-24">
        متن پیام را وارد کنید یا از قالب‌های ذخیره شده استفاده نمایید
      </Typography>

      {/* Template toggle */}
      <Box className="flex gap-8 mb-16">
        <Button
          variant={showTemplates ? "contained" : "outlined"}
          color="secondary"
          size="small"
          onClick={() => setShowTemplates(!showTemplates)}
          startIcon={
            <FuseSvgIcon size={16}>heroicons-outline:template</FuseSvgIcon>
          }
          sx={{ borderRadius: 2 }}
        >
          {showTemplates ? "بستن قالب‌ها" : "انتخاب از قالب‌ها"}
        </Button>
      </Box>

      {/* Templates List */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, p: 2, mb: 3, maxHeight: 200, overflow: "auto" }}
            >
              {isLoadingTemplates && (
                <Box className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={40} sx={{ borderRadius: 1 }} />
                  ))}
                </Box>
              )}

              {!isLoadingTemplates && templates.length === 0 && (
                <Box className="flex items-center justify-center py-16 opacity-50">
                  <Typography variant="body2" color="text.secondary">
                    قالبی ذخیره نشده است
                  </Typography>
                </Box>
              )}

              {!isLoadingTemplates &&
                templates.map((tpl) => (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between px-12 py-8 rounded-lg cursor-pointer hover:bg-grey-100 dark:hover:bg-grey-800 transition-colors"
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    <Box className="flex items-center gap-8 min-w-0 flex-1">
                      <FuseSvgIcon size={16} color="action">
                        heroicons-outline:document-text
                      </FuseSvgIcon>
                      <Typography
                        variant="body2"
                        className="font-medium truncate"
                      >
                        {tpl.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="truncate hidden sm:block"
                      >
                        — {tpl.content?.substring(0, 50)}...
                      </Typography>
                    </Box>
                    <Tooltip title="حذف قالب">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                        color="error"
                      >
                        <FuseSvgIcon size={14}>
                          heroicons-outline:trash
                        </FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                ))}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Text Area */}
      <Box className="relative">
        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={14}
          label="متن پیام"
          placeholder="متن پیام گروهی خود را اینجا بنویسید..."
          value={messageContent}
          onChange={(e) => {
            onMessageContentChange(e.target.value);
            onTemplateIdChange(null); // clear template selection on manual edit
          }}
          InputProps={{
            sx: { borderRadius: 3, fontSize: "0.95rem", lineHeight: 1.8 },
          }}
          sx={{ mb: 2 }}
        />
        <Box className="flex items-center justify-between">
          <Typography variant="caption" color="text.secondary">
            {messageContent.length} کاراکتر
          </Typography>
          <Tooltip title="ذخیره به عنوان قالب">
            <Button
              size="small"
              variant="text"
              color="secondary"
              disabled={!messageContent.trim()}
              onClick={() => setSaveDialogOpen(true)}
              startIcon={
                <FuseSvgIcon size={16}>heroicons-outline:bookmark</FuseSvgIcon>
              }
              sx={{ borderRadius: 2 }}
            >
              ذخیره به عنوان قالب
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {selectedTemplateId && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mt: 2, borderRadius: 2 }}
          onClose={() => onTemplateIdChange(null)}
        >
          از قالب ذخیره شده استفاده شده است. در صورت ویرایش، قالب حذف می‌شود.
        </Alert>
      )}

      {/* Save Template Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle className="font-bold">ذخیره قالب پیام</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" className="mb-16">
            یک نام یکتا برای قالب انتخاب کنید تا بعداً بتوانید از آن استفاده
            کنید
          </Typography>
          <TextField
            fullWidth
            label="نام قالب"
            placeholder="مثلاً: پیام تبریک نوروز"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            autoFocus
            InputProps={{ sx: { borderRadius: 2 } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)} color="inherit">
            انصراف
          </Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            color="secondary"
            disabled={isCreating || !templateName.trim()}
            sx={{ borderRadius: 2 }}
          >
            {isCreating ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default StepMessageCompose;
