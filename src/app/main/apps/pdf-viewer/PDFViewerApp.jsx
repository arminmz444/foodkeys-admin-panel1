import { Box, Button, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function PDFViewerApp({
  fileUrl = 'https://react-pdf-viewer.dev/assets/pdf-open-parameters.pdf',
}) {
  const handleDownload = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        border: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '70vh',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          پیش‌نمایش PDF
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:download</FuseSvgIcon>}
          onClick={handleDownload}
        >
          دانلود
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <iframe
          src={`${fileUrl}#toolbar=1`}
          title="PDF preview"
          style={{ border: 0, width: '100%', height: '100%', minHeight: '65vh' }}
        />
      </Box>
    </Box>
  );
}

export default PDFViewerApp;
