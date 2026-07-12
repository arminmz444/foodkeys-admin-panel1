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
  Chip,
} from "@mui/material";
import { Add, ShoppingCart, Delete, Settings, Email, Notifications, VpnKey, VerifiedUser, FormatListBulleted } from "@mui/icons-material";
import EmailEditor from "./components/EmailEditor";
import TestEmailPanel from "./components/TestEmailPanel";
import CreateTemplateModal from "./components/CreateTemplateModal";
import SmartTextModal from "./components/SmartTextModal";
import RecipientListModal from "./components/RecipientListModal";
import {
  setSelectedEmailTemplate,
  addEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  setEmailTemplates
} from "./store/templatesSlice";
import { 
  useGetEmailTemplatesQuery,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation 
} from "./store/templatesApi";

function EmailTemplatesContent() {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  
  // Use redux store and API data together
  const { data: apiTemplates, isLoading, isFetching } = useGetEmailTemplatesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });
  
  const templates = useSelector(
    (state) => state["messagingApp.templates"]?.emailTemplates
  );
  const systemTemplates = useSelector(
    (state) => state["messagingApp.templates"]?.systemEmailTemplates
  );
  const selectedTemplate = useSelector(
    (state) => state["messagingApp.templates"]?.selectedEmailTemplate
  );

  // Use memoized template lists to prevent unnecessary renders
  const templateList = useMemo(() => templates || [], [templates]);
  const systemTemplateList = useMemo(() => systemTemplates || [], [systemTemplates]);

  // State to track template content
  const [editorContent, setEditorContent] = useState({
    subject: "",
    body: ""
  });
  const [templateEnabled, setTemplateEnabled] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [templateSaved, setTemplateSaved] = useState(true);
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [smartTextModalOpen, setSmartTextModalOpen] = useState(false);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);

  // Initialize template state when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      setTemplateEnabled(!!selectedTemplate.enabled);
      setEditorContent({
        subject: selectedTemplate.subject || "",
        body: selectedTemplate.body || ""
      });
    }
  }, [selectedTemplate]);

  // Update templates in redux store when API data changes
  useEffect(() => {
    if (!apiTemplates?.data) return;

    const all = apiTemplates.data;
    dispatch(setEmailTemplates(all));

    if (all.length === 0) return;

    const currentId = selectedTemplate?.id;
    const stillValid = currentId && all.some((t) => t.id === currentId);
    if (!stillValid) {
      const preferred = all.find((t) => t.isSystem) || all[0];
      dispatch(setSelectedEmailTemplate(preferred));
    }
    // intentionally only react to API payload changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiTemplates, dispatch]);

  const [updateEmailTemplateApi] = useUpdateEmailTemplateMutation();
  const [deleteEmailTemplateApi] = useDeleteEmailTemplateMutation();

  const handleCreateTemplate = (newTemplate) => {
    const newTemp = newTemplate?.data || newTemplate;
    dispatch(addEmailTemplate(newTemp));
    dispatch(setSelectedEmailTemplate(newTemp));
    setCreateModalOpen(false);
  };

  // Show loading only when initially fetching, not on every update
  if (isLoading && !templates?.length) {
    return <FuseLoading />;
  }

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    // Get the latest content from the editor using the ref's getContent method
    let currentContent = editorContent;
    
    if (editorRef.current && typeof editorRef.current.getContent === 'function') {
      currentContent = editorRef.current.getContent();
    }
    
    // Create the updated template with the current content
    const updatedTemplate = {
      ...selectedTemplate,
      subject: currentContent.subject,
      body: currentContent.body,
      enabled: templateEnabled
    };
    
    // Update in store
    dispatch(updateEmailTemplate(updatedTemplate));
    
    // Update via API
    try {
      await updateEmailTemplateApi(updatedTemplate).unwrap();
      setTemplateSaved(true);
    } catch (error) {
      // Use proper error handling
      console.error("Error saving template:", error);
      setTemplateSaved(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    // Use a safer confirmation approach - in a real app you might use a confirmation dialog
    try {
      // Delete via API
      await deleteEmailTemplateApi(id).unwrap();
      
      // Delete in store
      dispatch(deleteEmailTemplate(id));
    } catch (error) {
      // Use proper error handling
      console.error("Error deleting template:", error);
    }
  };

  const handleAddSmartText = (property, defaultValue) => {
    // Add smart text to the template with double curly braces format
    const smartText = `{{${property}}}`; 
    
    // Make sure editorRef is available and has the insertVariable method
    if (editorRef.current && typeof editorRef.current.insertVariable === 'function') {
      // Pass the variable to the editor component via the ref callback
      editorRef.current.insertVariable(smartText);
      setSmartTextModalOpen(false);
    } else {
      console.error("Editor reference or insertVariable method not available");
      // Close the modal anyway
      setSmartTextModalOpen(false);
    }
  };

  const handleEditorContentChange = (content) => {
    setEditorContent(content);
    setTemplateSaved(false);
  };

  const getTemplateTypeColor = (templateType) => {
    if (!templateType) return "default";
    
    switch (templateType.toLowerCase()) {
      case "verification":
      case "تایید":
        return "success";
      case "registration":
      case "ثبت‌نام":
        return "primary";
      case "notification":
      case "اطلاع‌رسانی":
        return "info";
      case "password":
      case "رمز":
        return "warning";
      default:
        return "default";
    }
  };

  const getTemplateTypeRgb = (templateType) => {
    if (!templateType) return "0, 0, 0";
    
    switch (templateType.toLowerCase()) {
      case "verification":
      case "تایید":
        return "76, 175, 80"; // Green
      case "registration":
      case "ثبت‌نام":
        return "33, 150, 243"; // Blue
      case "notification":
      case "اطلاع‌رسانی":
        return "3, 169, 244"; // Light Blue
      case "password":
      case "رمز":
        return "255, 152, 0"; // Orange
      default:
        return "97, 97, 97"; // Gray
    }
  };

  const getTemplateTypeIcon = (templateType) => {
    if (!templateType) return <FormatListBulleted fontSize="small" />;
    
    switch (templateType.toLowerCase()) {
      case "verification":
      case "تایید":
        return <VerifiedUser fontSize="small" />;
      case "registration":
      case "ثبت‌نام":
        return <Email fontSize="small" />;
      case "notification":
      case "اطلاع‌رسانی":
        return <Notifications fontSize="small" />;
      case "password":
      case "رمز":
        return <VpnKey fontSize="small" />;
      default:
        return <FormatListBulleted fontSize="small" />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
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
            قالب‌های ایمیل
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
                onClick={() => dispatch(setSelectedEmailTemplate(template))}
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
                      backgroundColor: template.name.includes("تایید") || template.name.includes("ثبت‌نام")
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
                onClick={() => dispatch(setSelectedEmailTemplate(template))}
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
                       backgroundColor: template.enabled
                        ? "#4caf50"
                        : "#f44336",
                      // backgroundColor: "#4caf50",
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
          {/* Email Editor */}
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
                یک قالب ایمیل سیستمی با یک رویداد در سیستم مرتبط است. موضوع و متن پیام را انتخاب و وارد کنید. هنگامی که رویداد رخ می‌دهد، سیستم ایمیل را به کاربر مربوطه ارسال می‌کند.
              </Typography>
            </Paper>

            {selectedTemplate && (
              <EmailEditor
                ref={editorRef}
                template={selectedTemplate}
                onOpenSmartText={() => setSmartTextModalOpen(true)}
                onWordCountChange={setWordCount}
                onContentChange={handleEditorContentChange}
              />
            )}

            <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
              {!templateSaved && (
                <Alert severity="warning" sx={{ mr: 2 }}>
                  قالب ایمیل ذخیره نشده است
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
              <Typography sx={{ ml: 1 }}>قالب ایمیل فعال است</Typography>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <Settings fontSize="small" />
              </IconButton>
            </Box>

            {selectedTemplate && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  نوع قالب:
                </Typography>
                <Chip 
                  label={selectedTemplate.templateType || "استاندارد"} 
                  size="small"
                  color={getTemplateTypeColor(selectedTemplate.templateType)}
                  sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    minWidth: 80,
                    '& .MuiChip-label': {
                      padding: '0 8px'
                    }
                  }}
                  icon={getTemplateTypeIcon(selectedTemplate.templateType)}
                />
              </Box>
            )}

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
                      {"{{user_name}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - نام کاربر
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
                      {"{{email}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - آدرس ایمیل
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
                      {"{{app_name}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - نام برنامه
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
                      {"{{confirmation_url}}"}
                    </Box>
                    <Box component="span" sx={{ mr: 1 }}>
                      - آدرس تایید
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Test Email Panel */}
          <TestEmailPanel selectedTemplate={selectedTemplate} />
        </Box>
      </Box>

      {/* Modals */}
      <CreateTemplateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTemplate}
        type="Email"
      />

      <SmartTextModal
        open={smartTextModalOpen}
        onClose={() => setSmartTextModalOpen(false)}
        onAddSmartText={handleAddSmartText}
        type="Email"
      />

      <RecipientListModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        type="Email"
        selectedTemplate={selectedTemplate}
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

export default EmailTemplatesContent;