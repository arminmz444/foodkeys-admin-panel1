import { Controller, useFormContext } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

/**
 * Simple HTML editor component with preview
 */
function ContentTab() {
  const theme = useTheme();
  const methods = useFormContext();
  const { control, formState, watch, setValue } = methods;
  const { errors } = formState;
  const [viewMode, setViewMode] = useState('editor');
  const content = watch('content');
  const editorRef = useRef(null);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const insertHtml = (tag, attributes = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent;
    if (tag === 'a') {
      const url = prompt('لینک را وارد کنید:', 'https://');
      if (!url) return;
      newContent = content.substring(0, start) + `<a href="${url}">${selectedText || 'متن لینک'}</a>` + content.substring(end);
    } else if (tag === 'img') {
      const url = prompt('آدرس تصویر را وارد کنید:', 'https://');
      if (!url) return;
      const alt = prompt('متن جایگزین (alt):', '');
      newContent = content.substring(0, start) + `<img src="${url}" alt="${alt}" />` + content.substring(end);
    } else if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
      newContent = content.substring(0, start) + `<${tag}>${selectedText || 'عنوان'}</${tag}>` + content.substring(end);
    } else if (tag === 'ul' || tag === 'ol') {
      const items = selectedText ? selectedText.split('\n').map(item => `  <li>${item}</li>`).join('\n') : '  <li>آیتم</li>';
      newContent = content.substring(0, start) + `<${tag}>\n${items}\n</${tag}>` + content.substring(end);
    } else if (tag === 'blockquote') {
      newContent = content.substring(0, start) + `<blockquote>${selectedText || 'نقل قول'}</blockquote>` + content.substring(end);
    } else if (tag === 'code') {
      newContent = content.substring(0, start) + `<pre><code>${selectedText || 'کد'}</code></pre>` + content.substring(end);
    } else {
      newContent = content.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + content.substring(end);
    }
    
    setValue('content', newContent, { shouldDirty: true });
  };

  const toolbarButtons = [
    { icon: 'heroicons-outline:menu-alt-2', tag: 'p', label: 'پاراگراف' },
    { icon: 'heroicons-solid:hashtag', tag: 'h2', label: 'عنوان ۲' },
    { icon: 'heroicons-solid:hashtag', tag: 'h3', label: 'عنوان ۳' },
    { divider: true },
    { icon: 'heroicons-outline:bold', tag: 'strong', label: 'بولد', style: { fontWeight: 'bold' } },
    { icon: 'heroicons-outline:italic', tag: 'em', label: 'ایتالیک', style: { fontStyle: 'italic' } },
    { divider: true },
    { icon: 'heroicons-outline:link', tag: 'a', label: 'لینک' },
    { icon: 'heroicons-outline:photograph', tag: 'img', label: 'تصویر' },
    { divider: true },
    { icon: 'heroicons-outline:view-list', tag: 'ul', label: 'لیست' },
    { icon: 'heroicons-outline:menu', tag: 'ol', label: 'لیست شماره‌دار' },
    { icon: 'heroicons-outline:chat-alt-2', tag: 'blockquote', label: 'نقل قول' },
    { icon: 'heroicons-outline:code', tag: 'code', label: 'کد' }
  ];

  return (
    <motion.div 
      className="space-y-24"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={sectionVariants}>
        <Paper className="rounded-2xl overflow-hidden" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
          {/* Modern Header */}
          <Box 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-16 px-24 py-16"
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box className="flex items-center gap-12">
              <Box 
                className="w-44 h-44 rounded-xl flex items-center justify-center"
                sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})` }}
              >
                <FuseSvgIcon className="text-white" size={22}>heroicons-outline:document-text</FuseSvgIcon>
              </Box>
              <div>
                <Typography className="font-bold text-lg">محتوای پست</Typography>
                <Typography variant="caption" className="text-gray-500">ویرایشگر HTML با پیش‌نمایش زنده</Typography>
              </div>
            </Box>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '10px',
                  px: 2,
                  border: 'none',
                  backgroundColor: alpha(theme.palette.grey[500], 0.08),
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    '&:hover': { backgroundColor: theme.palette.secondary.dark }
                  }
                }
              }}
            >
              <ToggleButton value="editor">
                <FuseSvgIcon size={16}>heroicons-outline:code</FuseSvgIcon>
                <span className="mr-8 hidden sm:inline">ویرایشگر</span>
              </ToggleButton>
              <ToggleButton value="preview">
                <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                <span className="mr-8 hidden sm:inline">پیش‌نمایش</span>
              </ToggleButton>
              <ToggleButton value="split">
                <FuseSvgIcon size={16}>heroicons-outline:view-boards</FuseSvgIcon>
                <span className="mr-8 hidden sm:inline">دو بخشی</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <div className="p-24">
            {/* Modern Toolbar */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <Box
                className="flex flex-wrap items-center gap-4 p-12 mb-20 rounded-xl"
                sx={{ 
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                }}
              >
                {toolbarButtons.map((btn, index) =>
                  btn.divider ? (
                    <Box
                      key={index}
                      className="w-px h-24 mx-8"
                      sx={{ backgroundColor: alpha(theme.palette.divider, 0.5) }}
                    />
                  ) : (
                    <Tooltip key={index} title={btn.label} placement="top" arrow>
                      <Button
                        size="small"
                        onClick={() => insertHtml(btn.tag)}
                        sx={{ 
                          minWidth: 40, 
                          height: 40,
                          p: 0.5,
                          borderRadius: '10px',
                          color: 'text.secondary',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }
                        }}
                        style={btn.style}
                      >
                        <FuseSvgIcon size={18}>{btn.icon}</FuseSvgIcon>
                      </Button>
                    </Tooltip>
                  )
                )}
              </Box>
            )}

            {/* Content Area */}
            <div className={`grid gap-20 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Editor */}
              {(viewMode === 'editor' || viewMode === 'split') && (
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputRef={editorRef}
                      multiline
                      rows={viewMode === 'split' ? 20 : 25}
                      fullWidth
                      error={!!errors.content}
                      helperText={errors?.content?.message}
                      placeholder="محتوای HTML پست را وارد کنید..."
                      InputProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          direction: 'ltr',
                          textAlign: 'left',
                          borderRadius: '16px',
                          backgroundColor: alpha(theme.palette.grey[500], 0.02)
                        }
                      }}
                    />
                  )}
                />
              )}

              {/* Preview */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <Paper
                  className="p-24 overflow-auto rounded-2xl"
                  sx={{
                    minHeight: viewMode === 'split' ? 480 : 600,
                    maxHeight: viewMode === 'split' ? 480 : 600,
                    backgroundColor: 'background.default',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    '& h1': { fontSize: '2rem', fontWeight: 'bold', mb: 2 },
                    '& h2': { fontSize: '1.5rem', fontWeight: 'bold', mb: 2, mt: 3 },
                    '& h3': { fontSize: '1.25rem', fontWeight: 'bold', mb: 2, mt: 2 },
                    '& h4': { fontSize: '1.1rem', fontWeight: 'bold', mb: 1, mt: 2 },
                    '& p': { mb: 2, lineHeight: 1.8 },
                    '& ul, & ol': { pl: 4, mb: 2 },
                    '& li': { mb: 1 },
                    '& blockquote': {
                      borderLeft: 4,
                      borderColor: 'secondary.main',
                      pl: 2,
                      py: 1,
                      my: 2,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                      borderRadius: '0 8px 8px 0',
                      fontStyle: 'italic'
                    },
                    '& pre': {
                      backgroundColor: 'grey.900',
                      color: 'grey.100',
                      p: 2,
                      borderRadius: 2,
                      overflow: 'auto',
                      my: 2
                    },
                    '& code': { fontFamily: 'monospace' },
                    '& a': { color: 'secondary.main', textDecoration: 'underline' },
                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 2 },
                    '& strong': { fontWeight: 'bold' },
                    '& em': { fontStyle: 'italic' }
                  }}
                >
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <Box className="flex flex-col items-center justify-center h-full py-32">
                      <Box 
                        className="w-64 h-64 rounded-full flex items-center justify-center mb-16"
                        sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.1) }}
                      >
                        <FuseSvgIcon className="text-gray-400" size={32}>heroicons-outline:document</FuseSvgIcon>
                      </Box>
                      <Typography className="text-gray-400">محتوایی برای پیش‌نمایش وجود ندارد</Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </div>

            {/* Character Count */}
            <Box className="flex items-center justify-between mt-16 pt-16" sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Box className="flex items-center gap-8">
                <FuseSvgIcon size={16} className="text-gray-400">heroicons-outline:information-circle</FuseSvgIcon>
                <Typography variant="caption" color="text.secondary">
                  محتوا باید HTML معتبر باشد
                </Typography>
              </Box>
              <Chip 
                label={`${content?.length || 0} کاراکتر`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: 'secondary.main',
                  fontWeight: 500,
                  borderRadius: '8px'
                }}
              />
            </Box>
          </div>
        </Paper>
      </motion.div>
    </motion.div>
  );
}

export default ContentTab;
