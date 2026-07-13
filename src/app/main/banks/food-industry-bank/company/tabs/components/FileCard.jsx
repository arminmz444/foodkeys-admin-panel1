import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton, 
  CircularProgress, 
  Tooltip,
  Box
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import { getServerFile } from '@/utils/string-utils';
import { isImageFile, isVideoFile, isDocumentFile, isPdfFile } from '../utils/fileUtils';
import FilePreview from './FilePreview';
import EditMetadataForm from './edit-metadata-form/EditMetadataForm';

async function downloadGalleryFile(url, fileName) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function FileCard({ 
  file, 
  onRemove, 
  onMetadataChange, 
  onPreview, 
  showMetadata = false,
  index 
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(file);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (file.uploadPending || file.uploadError) return;
    downloadGalleryFile(getFileUrl(), file.fileName);
  };

  const handlePreview = () => {
    if (file.uploadPending || file.uploadError) return;
    setIsPreviewOpen(true);
    if (onPreview) onPreview(file);
  };

  const handleMetadataChange = (newMetadata) => {
    onMetadataChange(file, newMetadata);
  };

  const getFileUrl = () => {
    return file.filePath ? getServerFile(file.filePath) : file.previewUrl;
  };

  const renderThumbnail = () => {
    if (file.uploadPending) {
      return (
        <Box className="flex items-center justify-center h-40 bg-gray-100">
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (file.uploadError) {
      return (
        <Box className="flex flex-col items-center justify-center h-40 bg-red-50">
          <FuseSvgIcon className="text-red-500 mb-2">heroicons-outline:exclamation-circle</FuseSvgIcon>
          <Typography variant="caption" color="error">خطا در آپلود</Typography>
        </Box>
      );
    }

    if (isImageFile(file.contentType)) {
      return (
        <CardMedia
          component="img"
          height="160"
          image={getFileUrl()}
          alt={file.metadata?.altText || file.fileName}
          className="object-cover h-40"
        />
      );
    } else if (isVideoFile(file.contentType)) {
      return (
        <Box className="relative h-40 bg-gray-800 flex items-center justify-center">
          <FuseSvgIcon className="text-white" size={40}>heroicons-outline:play</FuseSvgIcon>
          <Box 
            component="div" 
            className="absolute inset-0 bg-cover bg-center opacity-70"
            sx={{
              backgroundImage: `url(${file.thumbnailUrl || '/assets/images/placeholders/video-placeholder.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Box>
      );
    } else if (isDocumentFile(file.contentType)) {
      return (
        <Box className="h-40 bg-blue-50 flex flex-col items-center justify-center p-4">
          <FuseSvgIcon className="text-blue-500 mb-2" size={32}>
            {isPdfFile(file.contentType, file)
              ? 'heroicons-outline:document-text' 
              : 'heroicons-outline:document'}
          </FuseSvgIcon>
          <Typography variant="caption" className="text-center text-blue-700 px-2 truncate w-full">
            {file.fileName}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box className="h-40 bg-gray-100 flex flex-col items-center justify-center">
          <FuseSvgIcon className="text-gray-500 mb-2" size={32}>heroicons-outline:document</FuseSvgIcon>
          <Typography variant="caption" className="text-center text-gray-600 px-2 truncate w-full">
            {file.fileName}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="relative h-full" sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Thumbnail Section */}
        <Box className="relative cursor-pointer" onClick={handlePreview}>
          {renderThumbnail()}
          
          {/* Action Buttons */}
          <Box className="absolute top-2 right-2 flex">
            {(isPdfFile(file.contentType, file) || isDocumentFile(file.contentType)) && (
              <Tooltip title="دانلود فایل">
                <IconButton
                  size="small"
                  onClick={handleDownload}
                  className="bg-white bg-opacity-80 hover:bg-opacity-100 ml-1"
                >
                  <FuseSvgIcon size={18}>heroicons-outline:download</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="ویرایش اطلاعات">
              <IconButton 
                size="small"
                onClick={handleEdit}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 ml-1"
              >
                <FuseSvgIcon size={18}>heroicons-outline:pencil-alt</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف فایل">
              <IconButton 
                size="small" 
                onClick={handleRemove}
                className="bg-white bg-opacity-80 hover:bg-opacity-100"
              >
                <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Metadata Display */}
        {showMetadata && (
          <CardContent className="flex-1 p-3">
            <Typography 
              variant="subtitle2"
              className="font-bold truncate"
              title={file.metadata?.title || file.fileName}
            >
              {file.metadata?.title || file.fileName}
            </Typography>
            {file.metadata?.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                className="line-clamp-2 text-xs mt-1"
                title={file.metadata.description}
              >
                {file.metadata.description}
              </Typography>
            )}
          </CardContent>
        )}
      </Card>

      {/* Preview Dialog */}
      <FilePreview
        file={file}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Edit Metadata Dialog */}
      <EditMetadataForm
        file={file}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleMetadataChange}
      />
    </motion.div>
  );
}

export default FileCard;