import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Card from "@mui/material/Card";
import { AvatarGroup } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { formatDistanceToNow } from "date-fns-jalali";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import IconButton from "@mui/material/IconButton";
import { getServerFile } from "src/utils/string-utils";

function ServiceItem({ service, onRemoveDraft }) {
  // Get user information from service data
  const user = service.user || service.registrantUser;
  const userDisplayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'کاربر ناشناس';
  const userInitials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.trim() : '؟';

  // Service status options
  const serviceStatusOptions = [
    { value: 0, label: 'در انتظار تایید' },
    { value: 1, label: 'تایید شده' },
    { value: 2, label: 'رد شده' },
    { value: 3, label: 'آرشیو شده' },
    { value: 4, label: 'حذف شده' },
    { value: 5, label: 'ویرایش شده' },
    { value: 6, label: 'منتشر شده' },
    { value: 7, label: 'بازبینی' },
    { value: 8, label: 'ثبت اولیه' }
  ];

  const getStatusColor = (statusValue) => {
    const colorMap = {
      0: '#ffc107', // PENDING
      1: '#4caf50', // VERIFIED
      2: '#f44336', // DENIED
      3: '#482880', // ARCHIVED
      4: '#aa2e25', // DELETED
      5: '#3f50b5', // UPDATED
      6: '#8561c5', // PUBLISHED
      7: '#ffeb3b', // REVISION
      8: '#d7e360'  // SUBMIT
    };
    return colorMap[statusValue] || '#000000';
  };

  const getStatusLabel = (statusValue) => {
    const status = serviceStatusOptions.find(option => option.value === statusValue);
    return status ? status.label : 'نامشخص';
  };

  return (
    <Card
      component={NavLinkAdapter}
      to={`${service.id}/details`}
      role="button"
      className="relative flex flex-col items-start w-full h-full p-24 shadow rounded-lg hover:shadow-xl transition-shadow duration-150 ease-in-out"
    >
      {service.isDraft && (
        <>
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
            پیش‌نویس
          </div>
          <IconButton
            className="absolute top-0 left-0 text-red-600"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onRemoveDraft) onRemoveDraft(service.id);
            }}
          >
            <FuseSvgIcon>heroicons-solid:x</FuseSvgIcon>
          </IconButton>
        </>
      )}
      <div className="flex flex-col flex-auto justify-start items-start w-full">
        <Box
          sx={{ backgroundColor: "secondary.light", color: "secondary.dark" }}
          className="flex items-center justify-center p-16 rounded-full"
        >
          <FuseSvgIcon>{service.icon || "heroicons-outline:cog"}</FuseSvgIcon>
        </Box>
        <Typography className="mt-20 text-lg font-bold leading-5">
          {service.name || "سرویس بدون نام"}
        </Typography>
        
        {/* Prominent Subcategory Badge */}
        <div className="mt-12">
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "16px",
              padding: "4px 12px",
              display: "inline-block"
            }}
          >
            <Typography variant="caption" className="font-semibold">
              {service.subCategoryName || "بدون زیر شاخه"}
            </Typography>
          </Box>
        </div>
        
        <Divider className="w-48 mt-24 h-2" />
        <Typography className="mt-8 line-clamp-2 text-secondary">
          {service.description || "بدون توضیحات"}
        </Typography>
      </div>
      <div className="flex flex-col flex-auto justify-end w-full">
        {/* User Information Display */}
        {user && (
          <div className="flex items-center mt-24 space-x-3 space-x-reverse">
            <Avatar 
              src={user.avatar && getServerFile(user.avatar)} 
              alt={userDisplayName}
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: user.avatar ? 'transparent' : 'grey.500',
                color: user.avatar ? 'inherit' : 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid',
                borderColor: 'grey.200',
                '&:hover': {
                  backgroundColor: user.avatar ? 'transparent' : 'grey.600',
                }
              }}
            >
              {!user.avatar && userInitials}
            </Avatar>
            <div className="flex flex-col">
              <Typography variant="body2" className="font-semibold text-gray-800">
                {userDisplayName}
              </Typography>
              {user.username && (
                <Typography variant="caption" className="text-gray-500">
                  @{user.username}
                </Typography>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center mt-24 text-md font-md">
          <Typography color="text.secondary">آخرین ثبت:</Typography>
          <Typography className="mx-4 truncate">
            {(service.updatedAt &&
              formatDistanceToNow(new Date(service.updatedAt), { addSuffix: true })) || service.updatedAtStr ||
              "نامشخص"}
          </Typography>
        </div>
        
        {/* Service Status Display */}
        {service.status !== undefined && (
          <div className="flex items-center mt-12">
            <div 
              style={{ 
                backgroundColor: getStatusColor(service.status),
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                marginLeft: '8px'
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {getStatusLabel(service.status)}
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ServiceItem;
