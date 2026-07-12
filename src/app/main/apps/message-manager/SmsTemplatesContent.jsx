import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FuseLoading from "@fuse/core/FuseLoading";
import {
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Button,
  Alert,
  Box,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add, ShoppingCart, Delete, Settings } from "@mui/icons-material";
import SmsEditor from "./components/SmsEditor";
import TestSmsPanel from "./components/TestSmsPanel";
import CreateTemplateModal from "./components/CreateTemplateModal";
import SmartTextModal from "./components/SmartTextModal";
import RecipientListModal from "./components/RecipientListModal";
import {
  setSelectedSmsTemplate,
  addSmsTemplate,
  updateSmsTemplate,
  deleteSmsTemplate,
  setSmsTemplates,
} from "./store/templatesSlice";
import { 
  useGetSmsTemplatesQuery,
  useUpdateSmsTemplateMutation,
  useDeleteSmsTemplateMutation 
} from "./store/templatesApi";

function SmsTemplatesContent() {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  
  const { data: apiTemplates, isLoading, isFetching } = useGetSmsTemplatesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });
  
  const templates = useSelector(
    (state) => state["messagingApp.templates"]?.smsTemplates
  );
  const systemTemplates = useSelector(
    (state) => state["messagingApp.templates"]?.systemSmsTemplates
  );
  const selectedTemplate = useSelector(
    (state) => state["messagingApp.templates"]?.selectedSmsTemplate
  );

  const templateList = useMemo(() => templates || [], [templates]);
  const systemTemplateList = useMemo(() => systemTemplates || [], [systemTemplates]);

  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  useEffect(() => {
    if (!apiTemplates?.data) return;

    const all = apiTemplates.data;
    dispatch(setSmsTemplates(all));

    if (all.length === 0) return;

    const currentId = selectedTemplate?.id;
    const stillValid = currentId && all.some((t) => t.id === currentId);
    if (!stillValid) {
      const preferred = all.find((t) => t.isSystem) || all[0];
      dispatch(setSelectedSmsTemplate(preferred));
    }
    // intentionally only react to API payload changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiTemplates, dispatch]);

  const [updateSmsTemplateApi] = useUpdateSmsTemplateMutation();
  const [deleteSmsTemplateApi] = useDeleteSmsTemplateMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [smartTextModalOpen, setSmartTextModalOpen] = useState(false);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [templateEnabled, setTemplateEnabled] = useState(true);
  const [charCount, setCharCount] = useState(66);
  const [templateSaved, setTemplateSaved] = useState(true);

  const handleCreateTemplate = (newTemplate) => {
    dispatch(addSmsTemplate(newTemplate));
    dispatch(setSelectedSmsTemplate(newTemplate));
    setCreateModalOpen(false);
  };

  // Show loading only when initially fetching, not on every update
  if (isLoading && !templates?.length) {
    return <FuseLoading />;
  }

  const handleSaveTemplate = async () => {
    // Update in store
    dispatch(updateSmsTemplate({
      ...selectedTemplate,
      enabled: templateEnabled
    }));
    
    // Update via API
    try {
      await updateSmsTemplateApi({
        id: selectedTemplate.id,
        ...selectedTemplate,
        enabled: templateEnabled
      }).unwrap();
      
      setTemplateSaved(true);
    } catch (error) {
      setErrorDialog({
        open: true,
        message: `خطا در ذخیره قالب: ${error.data?.message || error.message || "خطای نامشخص"}`
      });
    }
  };

  const handleConfirmDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleDeleteConfirmed = async () => {
    const { id } = confirmDialog;
    setConfirmDialog({ open: false, id: null });
    
    if (id) {
      try {
        // Delete via API
        await deleteSmsTemplateApi(id).unwrap();
        
        // Delete in store
        dispatch(deleteSmsTemplate(id));
      } catch (error) {
        setErrorDialog({
          open: true,
          message: `خطا در حذف قالب: ${error.data?.message || error.message || "خطای نامشخص"}`
        });
      }
    }
  };

  const handleAddSmartText = (property, defaultValue) => {
    // Add smart text to the template with double curly braces format
    const smartText = `{{${property}}}`; 
    
    // Pass the variable to the editor component via a ref callback
    if (editorRef.current && editorRef.current.insertVariable) {
      editorRef.current.insertVariable(smartText);
    }
    
    setSmartTextModalOpen(false);
  };

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Dialogs */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: "" })}
      >
        <DialogTitle>خطا</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog({ open: false, message: "" })} color="primary">
            باشه
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
      >
        <DialogTitle>تایید حذف</DialogTitle>
        <DialogContent>
          <DialogContentText>آیا از حذف این قالب اطمینان دارید؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, id: null })} color="primary">
            انصراف
          </Button>
          <Button onClick={handleDeleteConfirmed} color="primary" variant="contained">
            تایید
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: "#1e2738",
          color: "white",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "white" }}>
            قالب‌های پیامک
          </Typography>
        </Box>
        <Box sx={{ display: "flex", p: 1, gap: 1 }}>
          <IconButton
            size="small"
            sx={{ color: "white" }}
            onClick={() => setCreateModalOpen(true)}
          >
            <Add />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <ShoppingCart />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <Delete />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <Settings />
          </IconButton>
        </Box>

        {isFetching ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} sx={{ color: "white" }} />
          </Box>
        ) : (
          <List component="nav" sx={{ mt: 2 }}>
            <ListItem sx={{ color: "white", fontWeight: "bold" }}>
              <ListItemText primary="قالب‌های سیستمی" />
            </ListItem>

            {systemTemplateList.map((template) => (
              <ListItem
                key={template.id}
                component="div"
                selected={selectedTemplate?.id === template.id}
                onClick={() => dispatch(setSelectedSmsTemplate(template))}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedTemplate?.id === template.id
                      ? "rgba(66, 133, 244, 0.15)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: template.name.includes("رمز") || template.name.includes("تایید")
                        ? "#4caf50"
                        : "#f44336",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  primaryTypographyProps={{
                    sx: { color: "white", fontSize: "0.875rem" },
                  }}
                />
              </ListItem>
            ))}

            <Divider
              sx={{ my: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />

            <ListItem sx={{ color: "white", fontWeight: "bold" }}>
              <ListItemText primary="قالب‌های سفارشی" />
            </ListItem>

            {templateList.map((template) => (
              <ListItem
                key={template.id}
                component="div"
                selected={selectedTemplate?.id === template.id}
                onClick={() => dispatch(setSelectedSmsTemplate(template))}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedTemplate?.id === template.id
                      ? "rgba(66, 133, 244, 0.15)"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#4caf50",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  primaryTypographyProps={{
                    sx: { color: "white", fontSize: "0.875rem" },
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ color: "white" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmDelete(template.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
          overflow: "auto",
        }}
      >
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* SMS Editor */}
          <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: "#e6f7ff",
                borderRadius: 1,
              }}
            >
              <Typography>
                یک قالب پیامک سیستمی با یک رویداد در سیستم مرتبط است. موضوع و متن پیام را انتخاب و وارد کنید. هنگامی که رویداد رخ می‌دهد، سیستم پیام پیامک را به کاربر مربوطه ارسال می‌کند.
              </Typography>
            </Paper>

            {selectedTemplate && (
              <SmsEditor
                ref={editorRef}
                template={selectedTemplate}
                onOpenSmartText={() => setSmartTextModalOpen(true)}
                onCharCountChange={setCharCount}
                onContentChange={() => setTemplateSaved(false)}
              />
            )}

            <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
              {!templateSaved && (
                <Alert severity="warning" sx={{ mr: 2 }}>
                  قالب پیامک ذخیره نشده است
                </Alert>
              )}
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
                  onClick={handleSaveTemplate}
                >
                  ذخیره قالب
                </Button>
                <Button variant="outlined">تولید کد</Button>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
              <Switch
                checked={templateEnabled}
                onChange={(e) => setTemplateEnabled(e.target.checked)}
                color="primary"
              />
              <Typography sx={{ ml: 1 }}>قالب پیامک فعال است</Typography>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <Settings fontSize="small" />
              </IconButton>
            </Box>

            {selectedTemplate && (
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: "#e6f7ff",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  متغیرهای جایگزین:
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {"{{phone}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - شماره تلفن کاربر
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {"{{otp}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - کد رمز یکبار مصرف
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {"{{user_object_id}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - شناسه کاربر
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {"{{company_name}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - نام شرکت
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      {"{{app_name}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - نام برنامه
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Test SMS Panel */}
          <TestSmsPanel />
        </Box>
      </Box>

      {/* Modals */}
      <CreateTemplateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTemplate}
        type="SMS"
      />

      <SmartTextModal
        open={smartTextModalOpen}
        onClose={() => setSmartTextModalOpen(false)}
        onAddSmartText={handleAddSmartText}
        type="SMS"
      />

      <RecipientListModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        type="SMS"
      />

      {/* Floating Action Button */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ bgcolor: "#2196f3", "&:hover": { bgcolor: "#1976d2" } }}
          onClick={() => setRecipientModalOpen(true)}
        >
          مدیریت گیرندگان
        </Button>
      </Box>
    </Box>
  );
}

export default SmsTemplatesContent;