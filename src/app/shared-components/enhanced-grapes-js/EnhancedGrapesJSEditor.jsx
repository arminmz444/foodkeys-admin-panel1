import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsTailwind from 'grapesjs-tailwind';
import gjsCustomCode from 'grapesjs-custom-code';
// import gjsReactComponents from 'grapesjs-react-component';
import { 
  Box, 
  Button, 
  Drawer, 
  Typography, 
  TextField, 
  Autocomplete, 
  LinearProgress, 
  Modal, 
  Paper, 
  IconButton,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Code as CodeIcon, 
  Publish as PublishIcon, 
  Add as AddIcon, 
  Close as CloseIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Devices as DevicesIcon,
  DataObject as DataObjectIcon
} from '@mui/icons-material';
import SimpleCodeEditor from '@/app/shared-components/simple-code-editor/SimpleCodeEditor';
import { useDispatch, useSelector } from 'react-redux';
// import { saveTemplate, publishTemplate, getTemplateVersions } from '../../store/miniAppSlice';
import VariableSelector from './VariableSelector';
import VersionSelector from './VersionSelector';
import PlacementSelector from './PlacementSelector';
import { styled } from '@mui/material/styles';

const RTLBox = styled(Box)(({ theme }) => ({
  direction: 'rtl',
  fontFamily: 'Vazirmatn, sans-serif',
  '& .gjs-cv-canvas': {
    direction: 'ltr', 
  }
}));

const EditorContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)', // Adjust based on your header height
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '& #gjs': {
    height: '100%',
    width: '100%',
  }
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 400,
  padding: theme.spacing(3),
  direction: 'rtl',
}));

const CodeEditorModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const CodeEditorPaper = styled(Paper)(({ theme }) => ({
  width: '80%',
  height: '80%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'white',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PreviewFrame = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}));

const EnhancedGrapesJSEditor = ({ initialContent = '', onSave, templateId = null }) => {
  const editorRef = useRef(null);
  const previewIframeRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishComplete, setPublishComplete] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [miniAppName, setMiniAppName] = useState('');
  const [miniAppVersion, setMiniAppVersion] = useState('1.0.0');
  const [placement, setPlacement] = useState(null);
  const [newPageName, setNewPageName] = useState('');
  const [showInNav, setShowInNav] = useState(true);
  const [navIcon, setNavIcon] = useState('');
  const [navTooltip, setNavTooltip] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [renderMethod, setRenderMethod] = useState('iframe'); // 'iframe' or 'federation'
  const [deviceMenuAnchor, setDeviceMenuAnchor] = useState(null);
  const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);
  
  const dispatch = useDispatch();
  const templateVersions = useSelector(state => state.miniApp?.templateVersions || []);
  const availablePlacements = useSelector(state => state.miniApp?.availablePlacements || []);
  const injectableVariables = useSelector(state => state.miniApp?.injectableVariables || []);
  
  // Initialize GrapesJS
  useEffect(() => {
    if (!editorRef.current) return;
    
    const editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      width: '100%',
      storageManager: false,
      plugins: [
        gjsPresetWebpage,
        gjsBlocksBasic,
        gjsTailwind,
        gjsCustomCode,
        // gjsReactComponents,
        (editor) => addCustomButtons(editor),
      ],
      pluginsOpts: {
        gjsTailwind: {
          /* Tailwind config options */
        },
        // gjsReactComponents: {
        //   /* React components config */
        //   componentsToRegister: [
        //     // Register your MUI components here
        //     // Example: { component: Button, name: 'MuiButton', props: {...} }
        //   ]
        // }
      },
      canvas: {
        styles: [
          'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
          // Add your custom styles here
        ],
        scripts: [
          // Add your custom scripts here
        ],
      },
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '768px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '320px',
          },
        ],
      },
    });

    // Load initial content if provided
    if (initialContent) {
      editor.setComponents(initialContent);
    }

    // Add custom panels and buttons
    addCustomPanels(editor);
    
    // Handle component selection for code editor
    editor.on('component:selected', (component) => {
      setSelectedComponent(component);
    });

    setEditor(editor);
    
    return () => {
      editor.destroy();
    };
  }, [initialContent]);

  // Add custom buttons to the editor
  const addCustomButtons = (editor) => {
    editor.Panels.addButton('options', {
      id: 'publish-btn',
      className: 'fa fa-upload',
      command: 'publish-command',
      attributes: { title: 'Publish Template' }
    });

    editor.Panels.addButton('options', {
      id: 'code-editor-btn',
      className: 'fa fa-code',
      command: 'code-editor-command',
      attributes: { title: 'Custom JavaScript' }
    });

    editor.Panels.addButton('options', {
      id: 'variable-btn',
      className: 'fa fa-database',
      command: 'variable-command',
      attributes: { title: 'Insert Variable' }
    });

    editor.Panels.addButton('options', {
      id: 'preview-btn',
      className: 'fa fa-eye',
      command: 'preview-command',
      attributes: { title: 'Preview' }
    });

    editor.Commands.add('publish-command', {
      run: () => setPublishDrawerOpen(true),
    });

    editor.Commands.add('code-editor-command', {
      run: () => setCodeEditorOpen(true),
    });

    editor.Commands.add('variable-command', {
      run: () => {
        setVariableSelectorOpen(true);
      },
    });

    editor.Commands.add('preview-command', {
      run: () => {
        setPreviewMode(true);
        updatePreview();
      },
      stop: () => {
        setPreviewMode(false);
      }
    });
  };

  // Add custom panels to the editor
  const addCustomPanels = (editor) => {
    // Add RTL support
    const styleManager = editor.StyleManager;
    styleManager.addProperty('dimension', {
      name: 'direction',
      property: 'direction',
      type: 'radio',
      defaults: 'ltr',
      list: [
        { value: 'ltr', name: 'LTR' },
        { value: 'rtl', name: 'RTL' },
      ],
    });
  };

  // Update preview iframe
  const updatePreview = () => {
    if (!editor || !previewIframeRef.current) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const js = customCode;
    
    const iframeDoc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow.document;
    
    // Create a full HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();
  };

  // Handle save
  const handleSave = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const js = customCode;
    const components = JSON.stringify(editor.getComponents());
    
    const templateData = {
      html,
      css,
      js,
      components,
      templateId,
    };
    
    // dispatch(saveTemplate(templateData));
    
    if (onSave) {
      onSave(templateData);
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (!editor) return;
    
    // Start progress simulation
    setPublishProgress(0);
    const interval = setInterval(() => {
      setPublishProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const js = customCode;
    const components = JSON.stringify(editor.getComponents());
    
    const publishData = {
      html,
      css,
      js,
      components,
      name: miniAppName,
      version: miniAppVersion,
      placement: placement?.id || 'new',
      newPageName: placement?.id === 'new' ? newPageName : null,
      showInNav,
      navIcon,
      navTooltip,
      renderMethod,
    };
    
    // dispatch(publishTemplate(publishData))
    //   .then(response => {
    //     clearInterval(interval);
    //     setPublishProgress(100);
    //     setPublishComplete(true);
    //     setPublishedUrl(response.payload.url);
    //   })
    //   .catch(error => {
    //     clearInterval(interval);
    //     setPublishProgress(0);
    //     alert(`Error publishing template: ${error.message}`);
    //   });
  };

  // Handle code editor save
  const handleCodeEditorSave = () => {
    setCodeEditorOpen(false);
    // You might want to inject the code into the editor or store it separately
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle device change
  const handleDeviceChange = (device) => {
    setPreviewDevice(device);
    setDeviceMenuAnchor(null);
    
    // Update iframe size based on device
    if (previewIframeRef.current) {
      const iframe = previewIframeRef.current;
      
      switch (device) {
        case 'mobile':
          iframe.style.width = '320px';
          iframe.style.height = '568px';
          break;
        case 'tablet':
          iframe.style.width = '768px';
          iframe.style.height = '1024px';
          break;
        case 'desktop':
        default:
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          break;
      }
    }
  };

  // Handle variable selection
  const handleVariableSelect = (variable) => {
    if (!editor) return;
    
    const selected = editor.getSelected();
    if (selected) {
      selected.append(`{{${variable.name}}}`);
    }
    
    setVariableSelectorOpen(false);
  };

//   // Load template versions when miniAppName changes
//   useEffect(() => {
//     if (miniAppName) {
//       dispatch(getTemplateVersions(miniAppName));
//     }
//   }, [miniAppName, dispatch]);

  // Reset publish complete when drawer closes
  useEffect(() => {
    if (!publishDrawerOpen) {
      setPublishComplete(false);
      setPublishProgress(0);
    }
  }, [publishDrawerOpen]);

  // Update preview when previewMode changes
  useEffect(() => {
    if (previewMode) {
      updatePreview();
    }
  }, [previewMode, editor, customCode]);

  return (
    <RTLBox>
      <EditorContainer>
        {/* GrapesJS Editor */}
        <div id="gjs" ref={editorRef}></div>
        
        {/* Editor Toolbar */}
        <Box sx={{ 
          position: 'absolute', 
          top: 30, 
          right: 10, 
          zIndex: 2,
          display: 'flex',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 1,
          borderRadius: 1
        }}>
          <Tooltip title="ذخیره">
            <IconButton onClick={handleSave} color="primary">
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="انتشار">
            <IconButton onClick={() => setPublishDrawerOpen(true)} color="secondary">
              <PublishIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="کد جاوااسکریپت">
            <IconButton onClick={() => setCodeEditorOpen(true)} color="info">
              <CodeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="متغیرها">
            <IconButton onClick={() => setVariableSelectorOpen(true)} color="warning">
              <DataObjectIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="پیش‌نمایش">
            <IconButton 
              onClick={() => setPreviewMode(!previewMode)} 
              color={previewMode ? "success" : "default"}
            >
              <PreviewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="تنظیمات">
            <IconButton color="default">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Preview Mode */}
        {previewMode && (
          <PreviewContainer>
            <PreviewHeader>
              <Typography variant="h6">پیش‌نمایش</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="دستگاه‌ها">
                  <IconButton onClick={(e) => setDeviceMenuAnchor(e.currentTarget)}>
                    <DevicesIcon />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => setPreviewMode(false)}
                  startIcon={<CloseIcon />}
                >
                  بستن
                </Button>
              </Box>
              
              <Menu
                anchorEl={deviceMenuAnchor}
                open={Boolean(deviceMenuAnchor)}
                onClose={() => setDeviceMenuAnchor(null)}
              >
                <MenuItem 
                  onClick={() => handleDeviceChange('desktop')}
                  selected={previewDevice === 'desktop'}
                >
                  دسکتاپ
                </MenuItem>
                <MenuItem 
                  onClick={() => handleDeviceChange('tablet')}
                  selected={previewDevice === 'tablet'}
                >
                  تبلت
                </MenuItem>
                <MenuItem 
                  onClick={() => handleDeviceChange('mobile')}
                  selected={previewDevice === 'mobile'}
                >
                  موبایل
                </MenuItem>
              </Menu>
            </PreviewHeader>
            <PreviewFrame>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  overflow: 'auto',
                  p: 2
                }}
              >
                <iframe
                  ref={previewIframeRef}
                  style={{
                    border: '1px solid #ccc',
                    width: previewDevice === 'desktop' ? '100%' : 
                           previewDevice === 'tablet' ? '768px' : '320px',
                    height: previewDevice === 'desktop' ? '100%' : 
                            previewDevice === 'tablet' ? '1024px' : '568px',
                    transition: 'width 0.3s, height 0.3s',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                  title="Preview"
                />
              </Box>
            </PreviewFrame>
          </PreviewContainer>
        )}
        
        {/* Publish Drawer */}
        <Drawer
          anchor="right" // For RTL, drawer opens from right
          open={publishDrawerOpen}
          onClose={() => setPublishDrawerOpen(false)}
        >
          <DrawerContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">انتشار قالب</Typography>
              <IconButton onClick={() => setPublishDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {publishComplete ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  قالب با موفقیت منتشر شد!
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  href={publishedUrl} 
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  مشاهده صفحه
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setPublishDrawerOpen(false)}
                  sx={{ mt: 2, mr: 2 }}
                >
                  بستن
                </Button>
              </Box>
            ) : (
              <>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab label="اطلاعات پایه" />
                  <Tab label="مسیریابی" />
                  <Tab label="تنظیمات پیشرفته" />
                </Tabs>
                
                {tabValue === 0 && (
                  <Box>
                    <Autocomplete
                      freeSolo
                      options={templateVersions.map(v => v.name)}
                      value={miniAppName}
                      onChange={(event, newValue) => setMiniAppName(newValue)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="نام برنامک" 
                          margin="normal" 
                          fullWidth 
                          required
                        />
                      )}
                    />
                    
                    <VersionSelector 
                      value={miniAppVersion}
                      onChange={setMiniAppVersion}
                      versions={templateVersions.filter(v => v.name === miniAppName).map(v => v.version)}
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        روش رندر
                      </Typography>
                      <Tabs 
                        value={renderMethod} 
                        onChange={(e, val) => setRenderMethod(val)}
                        sx={{ mb: 2 }}
                      >
                        <Tab value="iframe" label="آی‌فریم" />
                        <Tab value="federation" label="فدراسیون ماژول" />
                      </Tabs>
                    </Box>
                  </Box>
                )}
                
                {tabValue === 1 && (
                  <Box>
                    <PlacementSelector 
                      value={placement}
                      onChange={setPlacement}
                      placements={availablePlacements}
                    />
                    
                    {placement?.id === 'new' && (
                      <TextField
                        label="نام صفحه جدید"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                      />
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        تنظیمات منو
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography sx={{ ml: 1 }}>نمایش در منو:</Typography>
                        <Button 
                          variant={showInNav ? "contained" : "outlined"} 
                          color={showInNav ? "primary" : "default"}
                          onClick={() => setShowInNav(true)}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          بله
                        </Button>
                        <Button 
                          variant={!showInNav ? "contained" : "outlined"} 
                          color={!showInNav ? "primary" : "default"}
                          onClick={() => setShowInNav(false)}
                          size="small"
                        >
                          خیر
                        </Button>
                      </Box>
                      
                      {showInNav && (
                        <>
                          <TextField
                            label="آیکون منو"
                            value={navIcon}
                            onChange={(e) => setNavIcon(e.target.value)}
                            fullWidth
                            margin="normal"
                            placeholder="نام آیکون (مثال: HomeIcon)"
                          />
                          <TextField
                            label="متن راهنما"
                            value={navTooltip}
                            onChange={(e) => setNavTooltip(e.target.value)}
                            fullWidth
                            margin="normal"
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                )}
                
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      متغیرهای قابل تزریق
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      {injectableVariables.map((variable, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <code>{`{{${variable.name}}}`}</code> - {variable.description}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      تنظیمات پیشرفته
                    </Typography>
                    {/* Add more advanced settings here */}
                  </Box>
                )}
                
                <Box sx={{ mt: 4 }}>
                  {publishProgress > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress variant="determinate" value={publishProgress} />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        در حال انتشار... {publishProgress}%
                      </Typography>
                    </Box>
                  )}
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={handlePublish}
                    disabled={publishProgress > 0 && publishProgress < 100}
                  >
                    انتشار
                  </Button>
                </Box>
              </>
            )}
          </DrawerContent>
        </Drawer>
        
        {/* Code Editor Modal */}
        <CodeEditorModal
          open={codeEditorOpen}
          onClose={() => setCodeEditorOpen(false)}
        >
          <CodeEditorPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">ویرایشگر کد جاوااسکریپت</Typography>
              <IconButton onClick={() => setCodeEditorOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ flexGrow: 1, mb: 2 }}>
              <SimpleCodeEditor
                value={customCode}
                onChange={setCustomCode}
                height="100%"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => setCodeEditorOpen(false)}>
                انصراف
              </Button>
              <Button variant="contained" color="primary" onClick={handleCodeEditorSave}>
                ذخیره
              </Button>
            </Box>
          </CodeEditorPaper>
        </CodeEditorModal>
        
        {/* Variable Selector Modal */}
        <Modal
          open={variableSelectorOpen}
          onClose={() => setVariableSelectorOpen(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Paper sx={{ width: 400, p: 3, maxHeight: '80vh', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">انتخاب متغیر</Typography>
              <IconButton onClick={() => setVariableSelectorOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <VariableSelector onSelect={handleVariableSelect} />
          </Paper>
        </Modal>
      </EditorContainer>
    </RTLBox>
  );
};

export default EnhancedGrapesJSEditor;
