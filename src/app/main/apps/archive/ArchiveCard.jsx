import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Tooltip, 
  Chip, 
  CardHeader, 
  Avatar,
  CardActionArea,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  MoreVert as MoreIcon, 
  Folder as FolderIcon,
  FolderZip as ArchiveIcon,
  Domain as CompanyIcon,
  Inventory as ProductIcon,
  Person as UserIcon,
  Description as FileIcon,
  CompareArrows as CompareArrowsIcon,
  LooksOne as OneIcon,
  LooksTwo as TwoIcon,
  Visibility as ViewIcon,
  RestoreFromTrash as RestoreIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns/locale';

function ArchiveCard({ 
  archive, 
  selected,
  compareMode, 
  compareFirst,
  compareSecond,
  onSelect, 
  onMenuClick,
  onView,
  onRollback,
  onDelete
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  // Get entity icon based on entity type
  const getEntityIcon = () => {
    const entityType = archive.entityType || archive.metadata?.entityType || '';
    switch (entityType.toLowerCase()) {
      case 'company':
        return <CompanyIcon />;
      case 'product':
        return <ProductIcon />;
      case 'user':
        return <UserIcon />;
      default:
        return <FileIcon />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPpp', { locale: faIR });
    } catch (e) {
      return dateString || '-';
    }
  };

  function formatDateJalali(dateString) {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy/MM/dd - HH:mm');
    } catch {
      return dateString;
    }
  }
  
  // Handle menu open
  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };
  
  // Handle menu close
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle view action
  const handleView = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onView) onView(archive.id);
  };
  
  // Handle rollback action
  const handleRollback = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onRollback) onRollback(archive.id);
  };
  
  // Handle delete action
  const handleDelete = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onDelete) onDelete(archive.id);
  };
  
  const renderCompareIndicator = () => {
    if (compareFirst) {
      return (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          badgeContent={
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
              <OneIcon sx={{ fontSize: 16 }} />
            </Avatar>
          }
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <CompareArrowsIcon />
          </Avatar>
        </Badge>
      );
    }
    
    if (compareSecond) {
      return (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          badgeContent={
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
              <TwoIcon sx={{ fontSize: 16 }} />
            </Avatar>
          }
        >
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <CompareArrowsIcon />
          </Avatar>
        </Badge>
      );
    }
    
    return (
      <Avatar>
        {getEntityIcon()}
      </Avatar>
    );
  };
  
  return (
    <Card 
      variant="outlined" 
      className={selected ? 'border-2 border-primary' : ''}
      sx={{ position: 'relative' }}
    >
      <CardHeader
        avatar={renderCompareIndicator()}
        action={
          <Tooltip title="بیشتر">
            <IconButton onClick={(e) => onMenuClick ? onMenuClick(e) : handleOpenMenu(e)}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        }
        sx={{
          '& .MuiCardHeader-content': { overflow: 'hidden' },
          '& .MuiCardHeader-action': { alignSelf: 'center', marginTop: 0 }
        }}
        title={
          <Tooltip title={archive.name || ''}>
            <Typography noWrap variant="subtitle1" className="font-medium">
              {archive.name || 'بدون نام'}
            </Typography>
          </Tooltip>
        }
        subheader={formatDateJalali(archive.createdAt)}
      />
      <CardActionArea onClick={compareMode ? onSelect : onView}>
        <CardContent>
          <Box className="flex flex-col gap-2">
            <Box className="flex justify-between items-center">
              <Typography variant="body2" color="textSecondary">
                نوع موجودیت:
              </Typography>
              <Chip 
                label={archive.entityType || archive.metadata?.entityType || '-'} 
                size="small" 
                color="default" 
                variant="outlined" 
              />
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2" color="textSecondary">
                نوع آرشیو:
              </Typography>
              <Chip 
                label={archive.archiveType || archive.metadata?.archiveType || '-'} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            <Box className="flex justify-between items-center mt-2">
              <Typography variant="body2" color="textSecondary">
                ایجاد کننده:
              </Typography>
              <Typography variant="body2">
                {archive.createdBy || '-'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      
      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="مشاهده" />
        </MenuItem>
        <MenuItem onClick={handleRollback}>
          <ListItemIcon>
            <RestoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="بازگشت به این آرشیو" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="حذف" />
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default ArchiveCard;