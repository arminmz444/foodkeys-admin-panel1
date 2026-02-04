import { Chip, Tooltip } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

/**
 * DraftIndicator - A reusable component to display draft status
 * Shows a warning badge when isDraft or hasDraft is true
 */
function DraftIndicator({ isDraft, hasDraft, size = 'small', className = '' }) {
  if (!isDraft && !hasDraft) {
    return null;
  }

  const label = isDraft ? 'پیش‌نویس' : 'تغییرات در انتظار تایید';

  return (
    <Tooltip title={label}>
      <Chip
        icon={<WarningIcon />}
        label={label}
        color="warning"
        size={size}
        className={className}
        sx={{
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'inherit'
          }
        }}
      />
    </Tooltip>
  );
}

export default DraftIndicator;

