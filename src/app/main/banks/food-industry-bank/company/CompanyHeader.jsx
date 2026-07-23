import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getServerFile } from 'src/utils/string-utils';
import { useState, useEffect } from 'react';
import { Alert, CircularProgress, FormControl, InputLabel, MenuItem, Select, Snackbar } from '@mui/material';
import { useAppSelector } from 'app/store/hooks';
import {selectIsUserAdmin, selectUser} from 'src/app/auth/user/store/userSlice';
import {
	useCreateCompanyMutation,
	useUpdateCompanyMutation,
} from '../FoodIndustryBankApi.js';

/**
 * The company header.
 */
function CompanyHeader() {
	const routeParams = useParams();
	const { categoryId, companyId } = routeParams;
	const isNewCompany = companyId === 'new';

	const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  
	const methods = useFormContext();
	const { formState, watch, getValues, control } = methods;
	const { isValid, dirtyFields } = formState;
	const theme = useTheme();
	const navigate = useNavigate();
	const name = watch('companyName')
	const logo = watch('logo') // Changed from watching 'companyGallery' to 'logo'
  const status = watch('status');

	// Get current user data and check for ADMIN_ACCESS
	// const user = useAppSelector(selectUser);
	// const hasAdminAccess = user?.data?.accesses?.includes('ADMIN_ACCESS') ||
	// 	user?.accesses?.includes('ADMIN_ACCESS') ||
	// 	user?.userAccesses?.some(access => access.name === 'ADMIN_ACCESS');
	const hasAdminAccess = useAppSelector(selectIsUserAdmin);

	// Set default status based on user permissions
	useEffect(() => {
		if (!hasAdminAccess && isNewCompany) {
			// For new companies, set status to PENDING if user doesn't have admin access
			methods.setValue('status', 0, { shouldDirty: false });
		}
	}, [hasAdminAccess, isNewCompany, methods]);

	const [notification, setNotification] = useState({
		open: false,
		message: '',
		severity: 'success'
	  });

	  const handleSaveCompany = async () => {
		try {
		  const formData = getValues();
		  
		  // If user doesn't have ADMIN_ACCESS, set status to PENDING (0)
		  if (!hasAdminAccess) {
			formData.status = 0; // PENDING
		  }
		  
		  const response = await updateCompany(formData).unwrap();
		  
		  setNotification({
			open: true,
			message: 'اطلاعات شرکت با موفقیت ذخیره شد',
			severity: 'success'
		  });
		  
		  navigate(`/banks/${categoryId}/company/list`);
		} catch (error) {
		  console.error('Error saving company:', error);
		  setNotification({
			open: true,
			message: 'خطا در ذخیره اطلاعات شرکت',
			severity: 'error'
		  });
		}
	  };
	
	  // Handle creating a new company
	  const handleCreateCompany = async () => {
		try {
		  const formData = getValues();
		  
		  // If user doesn't have ADMIN_ACCESS, set status to PENDING (0)
		  if (!hasAdminAccess) {
			formData.status = 0; // PENDING
		  }
		  
		  const response = await createCompany(formData).unwrap();
		  
		  setNotification({
			open: true,
			message: 'شرکت جدید با موفقیت ایجاد شد',
			severity: 'success'
		  });
		  
		  if (response && response.data && response.data.id) {
			navigate(`/banks/food-industry/company/${response.data.id}`);
		  }
		} catch (error) {
		  console.error('Error creating company:', error);
		  setNotification({
			open: true,
			message: 'خطا در ایجاد شرکت جدید',
			severity: 'error'
		  });
		}
	  };
	
	  // Handle removing a company (e.g., navigate away without saving)
	  const handleRemoveCompany = () => {
		navigate(`/banks/${categoryId}/company/list`);
	  };
	  
	  // Close notification
	  const handleCloseNotification = () => {
		setNotification({ ...notification, open: false });
	  };

	  const isLoading = isCreating || isUpdating;

    const companyStatusOptions = [
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


	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-24 sm:py-32 px-24 md:px-32">
			<div className="flex flex-col items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
				>
					<Typography
						className="flex items-center sm:mb-12"
						component={Link}
						role="button"
						to={`/banks/${categoryId}/company/list`}
						color="inherit"
					>
						<FuseSvgIcon size={20}>
							{theme.direction === 'ltr'
								? 'heroicons-outline:arrow-sm-left'
								: 'heroicons-outline:arrow-sm-right'}
						</FuseSvgIcon>
						<span className="flex mx-4 font-medium">شرکت‌های ثبت شده</span>
					</Typography>
				</motion.div>

				<div className="flex items-center max-w-full">
					<motion.div
						className="hidden sm:flex"
						initial={{ scale: 0 }}
						animate={{ scale: 1, transition: { delay: 0.3 } }}
					>
						{logo ? (
							<img
								className="w-32 sm:w-48 rounded"
								src={getServerFile(logo)}
								alt={name || 'Company Logo'}
							/>
						) : (
							<img
								className="w-32 sm:w-48 rounded"
								src="assets/images/apps/ecommerce/product-image-placeholder.png"
								alt={name || 'Company Logo'}
							/>
						)}
					</motion.div>
					<motion.div
						className="flex flex-col min-w-0 mx-8 sm:mx-16"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-16 sm:text-20 truncate font-semibold">
							{name || 'ثبت شرکت جدید'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							جزئیات شرکت
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
        className="flex flex-1 w-full items-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
      >
        {!isNewCompany && hasAdminAccess && (
          <FormControl variant="outlined" className="min-w-160 mr-8" size="small">
            <InputLabel id="company-status-label">وضعیت</InputLabel>
            <Select
              labelId="company-status-label"
              label="وضعیت"
              {...methods.register('status')}
              value={status || 0}
              onChange={(e) => methods.setValue('status', e.target.value, { shouldDirty: true })}
            >
              {companyStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <div 
                      style={{ 
                        backgroundColor: getStatusColor(option.value),
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        marginRight: '8px',
						marginLeft: '8px'
                      }} 
                    />
                    {option.label}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {!isNewCompany ? (
          <>
            <Button
              className="whitespace-nowrap mx-4"
              variant="contained"
              color="error"
              onClick={handleRemoveCompany}
              startIcon={<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>}
            >
              حذف
            </Button>
            <Button
              className="whitespace-nowrap mx-4"
              variant="contained"
              color="secondary"
              onClick={handleSaveCompany}
              startIcon={isLoading ? <CircularProgress size={16} /> : null}
            >
              {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </>
        ) : (
          <Button
            className="whitespace-nowrap mx-4"
            variant="contained"
            color="secondary"
            onClick={handleCreateCompany}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading ? 'در حال ثبت...' : 'ثبت'}
          </Button>
        )}
      </motion.div>
	  <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
		</div>
	);
}

export default CompanyHeader;