import { Dialog, DialogTitle, DialogContent, Box, Button, IconButton } from '@mui/material';
import ReactPlayer from 'react-player';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getServerFile } from '@/utils/string-utils';
import { isDocumentFile, isVideoFile, isImageFile, isPdfFile } from '../utils/fileUtils';

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

function FilePreview({ file, open, onClose }) {
  const getFileUrl = () => {
    if (!file) {
      return null;
    }

    return file.filePath ? getServerFile(file.filePath) : file.previewUrl;
  };

  const handleDownload = () => {
    const fileUrl = getFileUrl();

    if (!fileUrl) {
      return;
    }

    downloadGalleryFile(fileUrl, file.fileName);
  };

  const renderPreview = () => {
    if (!file) {
      return null;
    }

    const fileUrl = getFileUrl();

    if (isPdfFile(file.contentType, file)) {
      return (
        <Box className="w-full" sx={{ minHeight: '70vh' }}>
          <iframe
            src={`${fileUrl}#toolbar=1`}
            title={file.fileName}
            className="w-full border-0"
            style={{ minHeight: '70vh', width: '100%' }}
          />
        </Box>
      );
    }

    if (isVideoFile(file.contentType)) {
      return (
        <Box className="w-full" sx={{ aspectRatio: '16/9' }}>
          <ReactPlayer
            url={fileUrl}
            controls
            width="100%"
            height="100%"
            style={{ maxHeight: '70vh' }}
            config={{ file: { forceVideo: true } }}
          />
        </Box>
      );
    }

    if (isImageFile(file.contentType)) {
      return (
        <Box className="flex justify-center" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <img
            src={fileUrl}
            alt={file.metadata?.altText || file.fileName}
            className="max-w-full h-auto"
          />
        </Box>
      );
    }

    return (
      <Box className="p-32 flex flex-col items-center justify-center">
        <FuseSvgIcon className="text-gray-300" size={64}>
          heroicons-outline:document
        </FuseSvgIcon>
        <div className="mt-16 text-center">این نوع فایل قابل پیش‌نمایش نیست</div>
        {isDocumentFile(file.contentType) && (
          <Button
            className="mt-16"
            variant="contained"
            color="secondary"
            startIcon={<FuseSvgIcon>heroicons-outline:download</FuseSvgIcon>}
            onClick={handleDownload}
          >
            دانلود فایل
          </Button>
        )}
      </Box>
    );
  };

  const canDownload = Boolean(file) && (isPdfFile(file.contentType, file) || isDocumentFile(file.contentType));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center gap-12">
        <div className="flex items-center min-w-0">
          <FuseSvgIcon className="mr-8">
            {isImageFile(file?.contentType)
              ? 'heroicons-outline:photograph'
              : isVideoFile(file?.contentType)
                ? 'heroicons-outline:film'
                : 'heroicons-outline:document-text'}
          </FuseSvgIcon>
          <span className="truncate">{file?.fileName}</span>
        </div>
        <Box className="flex items-center gap-4 shrink-0">
          {canDownload && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:download</FuseSvgIcon>}
              onClick={handleDownload}
            >
              دانلود
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="flex-1 overflow-auto">{file && renderPreview()}</DialogContent>
    </Dialog>
  );
}

export default FilePreview;
