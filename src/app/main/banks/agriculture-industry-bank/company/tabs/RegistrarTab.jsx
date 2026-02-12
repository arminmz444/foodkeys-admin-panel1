import {
	Typography,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	FormHelperText,
	FormControlLabel,
	Checkbox,
	Box,
	Paper,
	IconButton,
	TextField,
	Divider
} from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import CustomSelect from "app/shared-components/custom-select/CustomSelect.jsx";
import UserSelectOption from "app/shared-components/custom-select-options/UserSelectOption";
import FileUpload from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRef, useState } from "react";
import AdditionalInfoField from "src/app/shared-components/AdditionalInfoField/AdditionalInfoField";

function RegistrarTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	
	// Watch for changes to hasPrivatePage and miniAppIframeSource
	const hasPrivatePage = useWatch({
		control,
		name: 'hasPrivatePage',
		defaultValue: false
	});
	
	const miniAppIframeSource = useWatch({
		control,
		name: 'miniAppIframeSource',
		defaultValue: ''
	});
	
	// For file upload handling
	const fileInputRef = useRef(null);
	const [uploadedFile, setUploadedFile] = useState(null);
	
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setUploadedFile(file);
			// Here you would typically upload the file and set the miniAppIframeSource
			// methods.setValue('miniAppIframeSource', uploadedFileUrl);
		}
	};
	
	const handleUploadClick = () => {
		fileInputRef.current.click();
	};
	
	const handleRemoveFile = () => {
		setUploadedFile(null);
		methods.setValue('miniAppIframeSource', '');
	};

	return (
		<div>
			<Typography
				variant="h5"
				color="WindowText"
				className="font-bold"
			>
				ثبت کننده اطلاعات{' '}
			</Typography>

			<Controller
				name="registrantId"
				control={control}
				render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
					<CustomSelect
						components={{
							CustomOption: UserSelectOption,
						}}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						className="mt-16 mb-16 sm:mx-4 font-400"
						setFieldValue={onChange}
						setFieldTouched={onBlur}
						url="/user/options"
						additionalParams={{ pageSize: 8 }}
						noOptionsMessage="کاربری پیدا نشد"
						loadingMessage="در حال بارگذاری کاربران..."
					/>
				)}
			/>

			<Typography
				variant="subtitle1"
				color="textPrimary"
				className="mt-16 mb-8 sm:mx-4"
			>
				امتیازدهی
			</Typography>

			<div className="flex flex-col sm:flex-row">
				<Controller
					name="ranking"
					control={control}
					render={({ field }) => (
						<FormControl
							fullWidth
							className="mt-8 mb-16 w-full sm:w-1/2 sm:pr-2"
							error={!!errors.ranking}
						>
							<InputLabel id="ranking-label">امتیاز</InputLabel>
							<Select
								{...field}
								labelId="ranking-label"
								id="ranking"
								label="امتیاز"
								variant="outlined"
							>
								<MenuItem value={0}>0</MenuItem>
								<MenuItem value={1}>1</MenuItem>
								<MenuItem value={2}>2</MenuItem>
								<MenuItem value={3}>3</MenuItem>
								<MenuItem value={4}>4</MenuItem>
								<MenuItem value={5}>5</MenuItem>
							</Select>
							<FormHelperText>{errors?.ranking?.message || "رتبه‌بندی بین ۰ تا ۵"}</FormHelperText>
						</FormControl>
					)}
				/>

				<Controller
					name="rankingAll"
					control={control}
					render={({ field }) => (
						<FormControl
							fullWidth
							className="mt-8 ms-8 mb-16 w-full sm:w-1/2 sm:pl-2"
							error={!!errors.rankingAll}
						>
							<InputLabel id="rankingAll-label">امتیاز کلی</InputLabel>
							<Select
								{...field}
								labelId="rankingAll-label"
								id="rankingAll"
								label="امتیاز کلی"
								variant="outlined"
							>
								{[...Array(101)].map((_, index) => (
									<MenuItem key={index} value={index}>{index}</MenuItem>
								))}
							</Select>
							<FormHelperText>{errors?.rankingAll?.message || "امتیاز کلی بین ۰ تا ۱۰۰"}</FormHelperText>
						</FormControl>
					)}
				/>
			</div>
			
			{/* واترمارک (Watermark) Section */}
			{/*<Typography*/}
			{/*	variant="subtitle1"*/}
			{/*	color="textPrimary"*/}
			{/*	className="mt-24 mb-8 sm:mx-4"*/}
			{/*>*/}
			{/*	واترمارک*/}
			{/*</Typography>*/}
			
			{/*<Controller*/}
			{/*	name="watermark"*/}
			{/*	control={control}*/}
			{/*	defaultValue=""*/}
			{/*	render={({ field }) => (*/}
			{/*		<TextField*/}
			{/*			{...field}*/}
			{/*			className="mt-8 mb-16 sm:mx-4"*/}
			{/*			label="متن واترمارک"*/}
			{/*			placeholder="متن واترمارک را وارد کنید"*/}
			{/*			id="watermark"*/}
			{/*			variant="outlined"*/}
			{/*			fullWidth*/}
			{/*			error={!!errors.watermark}*/}
			{/*			helperText={errors?.watermark?.message || "متن واترمارکی که بر روی تصاویر نمایش داده می‌شود"}*/}
			{/*		/>*/}
			{/*	)}*/}
			{/*/>*/}
			
			{/* صفحه اختصاصی (Private Page) Section */}
			<Typography
				variant="subtitle1"
				color="textPrimary"
				className="mt-24 mb-8 sm:mx-4"
			>
				صفحه اختصاصی
			</Typography>
			
			<Controller
				name="hasPrivatePage"
				control={control}
				render={({ field: { onChange, value, ref } }) => (
					<FormControlLabel
						className="mt-8 mb-16 sm:mx-4"
						control={
							<Checkbox
								checked={value}
								onChange={onChange}
								inputRef={ref}
								color="primary"
							/>
						}
						label="فعال کردن صفحه اختصاصی"
					/>
				)}
			/>
			
			{hasPrivatePage && (
				miniAppIframeSource ? (
					<Box className="mt-16 mb-24 sm:mx-4">
						<Box className="flex justify-between items-center mb-8">
							<Typography variant="body1" color="textSecondary">
								پیش‌نمایش صفحه اختصاصی
							</Typography>
							<IconButton 
								size="small" 
								color="error" 
								onClick={handleRemoveFile}
								title="حذف فایل و پیش‌نمایش"
							>
								<DeleteIcon />
							</IconButton>
						</Box>
						<Box 
							component="iframe" 
							src={miniAppIframeSource}
							sx={{
								width: '100%',
								height: '400px',
								border: '1px solid rgba(0, 0, 0, 0.12)',
								borderRadius: '4px',
								backgroundColor: '#f5f5f5'
							}}
							title="پیش‌نمایش صفحه اختصاصی"
						/>
					</Box>
				) : (
					<Paper 
						elevation={0}
						className="mt-16 mb-24 sm:mx-4 p-24"
						sx={{ 
							border: '2px dashed rgba(0, 0, 0, 0.12)',
							backgroundColor: 'rgba(0, 0, 0, 0.01)',
							borderRadius: '8px',
							textAlign: 'center'
						}}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".zip,.rar,.7zip"
							style={{ display: 'none' }}
							onChange={handleFileChange}
						/>
						
						<Box 
							sx={{ 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center',
								gap: 2
							}}
						>
							<FileUpload sx={{ fontSize: 48, color: 'primary.main' }} />
							
							<Typography variant="h6" color="primary">
								آپلود فایل مینی‌اپ
							</Typography>
							
							<Typography variant="body2" color="textSecondary" sx={{ maxWidth: '80%', margin: '0 auto' }}>
								لطفاً فایل فشرده مینی‌اپ خود را با فرمت ZIP یا RAR آپلود کنید.
								فایل باید شامل فایل‌های HTML، CSS و JavaScript باشد.
							</Typography>
							
							{uploadedFile && (
								<Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, width: '100%', maxWidth: '300px' }}>
									<Typography variant="body2" noWrap>
										{uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
									</Typography>
								</Box>
							)}
							
							<Box sx={{ mt: 2 }}>
								<FormControl 
									variant="outlined"
									onClick={handleUploadClick}
									sx={{ 
										cursor: 'pointer',
										'&:hover': { bgcolor: 'action.hover' },
										p: 1.5,
										borderRadius: 1
									}}
								>
									<Typography 
										variant="button" 
										color="primary"
										sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
									>
										<FileUpload fontSize="small" />
										انتخاب فایل
									</Typography>
								</FormControl>
							</Box>
							
							<FormHelperText sx={{ mt: 1, textAlign: 'center' }}>
								حداکثر اندازه فایل: 10 مگابایت
							</FormHelperText>
						</Box>
						
						<Controller
							name="miniAppIframeSource"
							control={control}
							render={({ field }) => (
								<input type="hidden" {...field} />
							)}
						/>
					</Paper>
				)
			)}
			
			{/* Divider */}
			<Divider className="my-32" />
			
			{/* Additional Info Section */}
			<AdditionalInfoField name="additionalInfo" />
		</div>
	);
}

export default RegistrarTab;