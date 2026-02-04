import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, CircularProgress, Alert, Box } from '@mui/material';
import { Publish as PublishIcon, Delete as DeleteIcon } from '@mui/icons-material';

/**
 * DraftManagementActions - Admin-only component for managing drafts
 * Provides publish and discard actions for drafts
 */
function DraftManagementActions({
  companyId,
  serviceId,
  hasDraft,
  onPublishDraft,
  onDiscardDraft,
  isPublishing = false,
  isDiscarding = false,
  className = ''
}) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  if (!hasDraft) {
    return null;
  }

  const entityId = companyId || serviceId;

  const handlePublishClick = () => {
    setPublishDialogOpen(true);
  };

  const handleDiscardClick = () => {
    setDiscardDialogOpen(true);
  };

  const handlePublishConfirm = async () => {
    try {
      await onPublishDraft(entityId);
      setPublishDialogOpen(false);
    } catch (error) {
      console.error('Error publishing draft:', error);
    }
  };

  const handleDiscardConfirm = async () => {
    try {
      await onDiscardDraft(entityId);
      setDiscardDialogOpen(false);
    } catch (error) {
      console.error('Error discarding draft:', error);
    }
  };

  return (
    <>
      <Box className={`flex gap-8 ${className}`}>
        <Button
          variant="contained"
          color="success"
          startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : <PublishIcon />}
          onClick={handlePublishClick}
          disabled={isPublishing || isDiscarding}
          size="small"
        >
          انتشار پیش‌نویس
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={isDiscarding ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          onClick={handleDiscardClick}
          disabled={isPublishing || isDiscarding}
          size="small"
        >
          حذف پیش‌نویس
        </Button>
      </Box>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => !isPublishing && setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تایید انتشار پیش‌نویس</DialogTitle>
        <DialogContent>
          <Alert severity="info" className="mb-16">
            با انتشار این پیش‌نویس، تغییرات اعمال شده به نسخه اصلی اضافه خواهد شد و یک نسخه جدید ایجاد می‌شود.
          </Alert>
          <DialogContentText>
            آیا از انتشار این پیش‌نویس اطمینان دارید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPublishDialogOpen(false)}
            disabled={isPublishing}
            color="inherit"
          >
            انصراف
          </Button>
          <Button
            onClick={handlePublishConfirm}
            variant="contained"
            color="success"
            disabled={isPublishing}
            startIcon={isPublishing && <CircularProgress size={16} />}
          >
            {isPublishing ? 'در حال انتشار...' : 'تایید و انتشار'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => !isDiscarding && setDiscardDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تایید حذف پیش‌نویس</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mb-16">
            با حذف این پیش‌نویس، تمام تغییرات اعمال شده از بین خواهد رفت و قابل بازگشت نیست.
          </Alert>
          <DialogContentText>
            آیا از حذف این پیش‌نویس اطمینان دارید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDiscardDialogOpen(false)}
            disabled={isDiscarding}
            color="inherit"
          >
            انصراف
          </Button>
          <Button
            onClick={handleDiscardConfirm}
            variant="contained"
            color="error"
            disabled={isDiscarding}
            startIcon={isDiscarding && <CircularProgress size={16} />}
          >
            {isDiscarding ? 'در حال حذف...' : 'تایید و حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DraftManagementActions;

