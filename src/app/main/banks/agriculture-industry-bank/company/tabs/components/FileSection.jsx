import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Box, 
  Alert, 
  CircularProgress,
  Chip,
  Tooltip 
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getServerFile } from '@/utils/string-utils';
import { 
  getDefaultMetadata, 
  getFileServiceTypeDisplayName, 
  isImageFile, 
  isVideoFile 
} from '../utils/fileUtils';
import FileCard from './FileCard';
import useFileServiceTypeValidation from "@/app/main/shared-hooks/useFileServiceTypeValidation.js";

function FileSection({ 
  title, 
  fieldName, 
  fileServiceType, 
  maxFiles = 10,
  allowedFileTypes = "image/*,video/*,application/pdf",
  description,
  acceptMessage,
  companyId
}) {
  const { watch, setValue, getValues } = useFormContext();
  const files = watch(fieldName) || [];
  
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadError, setUploadError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    config: validationConfig,
    isConfigAvailable,
    validateFiles,
  } = useFileServiceTypeValidation(fileServiceType);

  const effectiveMaxFiles = isConfigAvailable && validationConfig.maxFiles
    ? validationConfig.maxFiles
    : maxFiles;

  const effectiveAllowedTypes = isConfigAvailable && validationConfig.allowedMimeTypes && validationConfig.allowedMimeTypes.length > 0
    ? validationConfig.allowedMimeTypes.join(',')
    : allowedFileTypes;

  // Prepare slides for Lightbox
  const slides = files.map((file) => {
    if (isImageFile(file.contentType)) {
      return {
        src: file.filePath ? getServerFile(file.filePath) : file.previewUrl,
        alt: file.metadata?.altText || file.fileName,
      };
    } else if (isVideoFile(file.contentType)) {
      return {
        type: 'video',
        width: 1280,
        height: 720,
        poster: file.thumbnailUrl,
        sources: [
          {
            src: file.filePath ? getServerFile(file.filePath) : file.previewUrl,
            type: file.contentType,
          },
        ],
      };
    }
    return null;
  }).filter(Boolean);

  // Handle file upload
  const handleAddFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    setValidationErrors([]);

    // Validate files using the hook if config is available
    if (isConfigAvailable) {
      const result = validateFiles(selectedFiles, files.length);
      if (!result.valid) {
        setValidationErrors(result.errors);
        setUploadError(null);
        return;
      }
    } else {
      // Fallback to basic max files check
      if (files.length + selectedFiles.length > effectiveMaxFiles) {
        setUploadError(`حداکثر تعداد فایل مجاز ${effectiveMaxFiles} است.`);
        return;
      }
    }

    setIsLoading(true);
    setUploadError(null);
    
    // Create temporary preview objects
    const tempFiles = selectedFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        fileName: file.name,
        filePath: null,
        contentType: file.type,
        fileSize: file.size,
        uploadPending: true,
        previewUrl,
        metadata: getDefaultMetadata(fileServiceType, file.type),
        fileServiceType
      };
    });
    
    // Add temporary files to the form
    setValue(fieldName, [...files, ...tempFiles]);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add files to formData
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      
      // Add fileServiceType and companyId
      formData.append('fileServiceType', fileServiceType);
      formData.append('companyId', companyId);
      
      // Send request to upload files
      const response = await axios.post(`/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.status === 'SUCCESS' && response.data.data) {
        // Get uploaded files from response
        const uploadedFiles = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        
        // Update the form with the server response
        const currentFiles = getValues(fieldName);
        const updatedFiles = currentFiles.map(file => {
          if (file.uploadPending) {
            // Find the matching uploaded file by name
            const uploadedFile = uploadedFiles.find(
              uploaded => uploaded.fileName.includes(file.fileName.split('.')[0])
            );
            
            if (uploadedFile) {
              let metadata = file.metadata;
              if (uploadedFile.metadata) {
                try {
                  metadata = typeof uploadedFile.metadata === 'string'
                    ? JSON.parse(uploadedFile.metadata)
                    : uploadedFile.metadata;
                } catch (e) {
                  console.error('Error parsing metadata:', e);
                }
              }
              
              return {
                ...file,
                id: uploadedFile.id,
                filePath: uploadedFile.filePath,
                uploadPending: false,
                metadata: metadata
              };
            }
          }
          return file;
        });
        
        setValue(fieldName, updatedFiles);
      } else {
        throw new Error('Invalid server response format');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('خطا در آپلود فایل‌ها. لطفاً مجدداً تلاش کنید.');
      
      // Mark files with error
      const currentFiles = getValues(fieldName);
      const updatedFiles = currentFiles.map(file => {
        if (file.uploadPending) {
          return {
            ...file,
            uploadPending: false,
            uploadError: true
          };
        }
        return file;
      });
      
      setValue(fieldName, updatedFiles);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = async (fileToRemove) => {
    const newFiles = files.filter(file => file.id !== fileToRemove.id);
    setValue(fieldName, newFiles);
    
    if (fileToRemove.id && !fileToRemove.uploadPending && !fileToRemove.uploadError) {
      try {
        await axios.delete(`/${companyId}/gallery/${fileToRemove.id}`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    if (fileToRemove.previewUrl && fileToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
  };

  // Handle metadata change
  const handleMetadataChange = (file, newMetadata) => {
    const updatedFiles = files.map(f => 
      f.id === file.id ? { ...f, metadata: newMetadata } : f
    );
    setValue(fieldName, updatedFiles);
    
    if (file.id && !file.uploadPending && !file.uploadError) {
      try {
        axios.patch(`/company/${companyId}/gallery/${file.id}/metadata`, {
          metadata: newMetadata
        }).catch(error => {
          console.error('Error updating file metadata:', error);
        });
      } catch (error) {
        console.error('Error updating file metadata:', error);
      }
    }
  };

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  function formatFileSizeDisplay(bytes) {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${bytes} B`;
  }

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 mb-6"
    >
      <Box className="flex justify-between items-center mb-4">
        <Box className="flex items-center gap-2 flex-wrap">
          <Typography variant="h6" className="font-bold">
            {title || getFileServiceTypeDisplayName(fileServiceType)}
          </Typography>
          
          {isConfigAvailable && (
            <Box className="flex items-center gap-1 flex-wrap">
              {validationConfig.maxFileSize && (
                <Tooltip title="حداکثر حجم هر فایل">
                  <Chip
                    size="small"
                    variant="outlined"
                    color="info"
                    label={`حداکثر ${formatFileSizeDisplay(validationConfig.maxFileSize)}`}
                    icon={<FuseSvgIcon size={14}>heroicons-outline:information-circle</FuseSvgIcon>}
                  />
                </Tooltip>
              )}
              {validationConfig.allowedExtensions && validationConfig.allowedExtensions.length > 0 && (
                <Tooltip title="فرمت‌های مجاز">
                  <Chip
                    size="small"
                    variant="outlined"
                    color="info"
                    label={validationConfig.allowedExtensions.join(', ')}
                    icon={<FuseSvgIcon size={14}>heroicons-outline:document</FuseSvgIcon>}
                  />
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="secondary"
          disabled={isLoading || files.length >= effectiveMaxFiles}
          startIcon={<FuseSvgIcon>heroicons-outline:upload</FuseSvgIcon>}
          component="label"
        >
          آپلود فایل
          <input
            type="file"
            multiple
            hidden
            accept={effectiveAllowedTypes}
            onChange={handleAddFiles}
            disabled={isLoading || files.length >= effectiveMaxFiles}
            onClick={(e) => {
              e.target.value = null;
            }}
          />
        </Button>
      </Box>

      {description && (
        <Typography variant="body2" className="mb-4 text-gray-600">
          {description}
        </Typography>
      )}
      
      {uploadError && (
        <Alert severity="error" className="mb-4" onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}
      
      {validationErrors.length > 0 && (
        <Alert severity="warning" className="mb-4" onClose={() => setValidationErrors([])}>
          <Typography variant="body2" className="font-bold mb-1">
            خطای اعتبارسنجی فایل‌ها:
          </Typography>
          <ul className="list-disc list-inside m-0 p-0">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <Typography variant="body2" component="span">{err}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}
      
      {acceptMessage && (
        <Alert severity="info" className="mb-4">
          {acceptMessage}
        </Alert>
      )}

      {isLoading && (
        <Box className="flex items-center mb-4">
          <CircularProgress size={24} className="mr-2" />
          <Typography>در حال آپلود فایل‌ها...</Typography>
        </Box>
      )}
      
      {files.length === 0 ? (
        <Box className="p-8 text-center border-2 border-dashed rounded-md">
          <FuseSvgIcon className="text-gray-300 mb-2" size={48}>
            {fileServiceType.includes('IMAGE') || fileServiceType.includes('LOGO') 
              ? 'heroicons-outline:photograph'
              : fileServiceType.includes('DOCUMENT') || fileServiceType.includes('CERTIFICATE')
                ? 'heroicons-outline:document-text'
                : fileServiceType.includes('VIDEO')
                  ? 'heroicons-outline:film'
                  : 'heroicons-outline:upload'
            }
          </FuseSvgIcon>
          <Typography className="text-gray-500">
            هیچ فایلی آپلود نشده است. برای آپلود کلیک کنید
          </Typography>
          <Button
            variant="text"
            className="mt-2"
            component="label"
            startIcon={<FuseSvgIcon>heroicons-outline:upload</FuseSvgIcon>}
          >
            انتخاب فایل
            <input
              type="file"
              multiple
              hidden
              accept={effectiveAllowedTypes}
              onChange={handleAddFiles}
              onClick={(e) => {
                e.target.value = null;
              }}
            />
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {files.map((file, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={file.id || index}>
              <FileCard
                file={file}
                index={index}
                onRemove={handleRemoveFile}
                onMetadataChange={handleMetadataChange}
                onPreview={() => {
                  if (isImageFile(file.contentType) || isVideoFile(file.contentType)) {
                    const slideIndex = slides.findIndex(slide => 
                      (slide.src === getServerFile(file.filePath) || slide.src === file.previewUrl) ||
                      (slide.sources && (slide.sources[0].src === getServerFile(file.filePath) || slide.sources[0].src === file.previewUrl))
                    );
                    if (slideIndex !== -1) {
                      setLightboxIndex(slideIndex);
                    }
                  }
                }}
                showMetadata={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* File count indicator */}
      {files.length > 0 && (
        <Box className="mt-4 flex justify-between items-center">
          <Typography variant="body2" className="text-gray-600">
            {files.length} از {effectiveMaxFiles} فایل مجاز
          </Typography>
        </Box>
      )}

      {/* Lightbox for images and videos */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Video]}
      />
    </Paper>
  );
}

export default FileSection;
