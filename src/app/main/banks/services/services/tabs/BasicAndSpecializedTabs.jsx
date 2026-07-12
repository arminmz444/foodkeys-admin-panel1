import FuseLoading from '@fuse/core/FuseLoading';
import {
	Alert,
	Autocomplete,
	Box,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import FormPreview from '../../../../../shared-components/form-builder/FormPreview';

function SpecializedInfoTab({
	schemaFields,
	formTitle,
	formDescription,
	serviceFormData,
	onFormDataChange,
	isLoadingSchema,
	isCreateMode,
	isDraft,
	watchSubCategoryId
}) {
	const needsSubcategory = (isCreateMode || isDraft) && !watchSubCategoryId;

	if (isLoadingSchema) {
		return (
			<Paper className="p-32 text-center" elevation={0} variant="outlined">
				<Typography variant="body1" className="mb-16">
					در حال بارگذاری فرم...
				</Typography>
				<FuseLoading />
			</Paper>
		);
	}

	if (needsSubcategory) {
		return (
			<Alert severity="info">
				برای نمایش اطلاعات تخصصی، ابتدا در تب «اطلاعات پایه» یک زیرشاخه انتخاب کنید.
			</Alert>
		);
	}

	if (!schemaFields?.length) {
		return (
			<Alert severity="warning">
				ساختاری برای این سرویس تعریف نشده است. در صورت نیاز، اسکیمای زیرشاخه را بررسی کنید.
			</Alert>
		);
	}

	return (
		<Box className="w-full">
			<Typography variant="h5" className="mb-8 font-medium">
				اطلاعات تخصصی سرویس
			</Typography>
			<Typography variant="body2" color="text.secondary" className="mb-24">
				فیلدهای پویا بر اساس ساختار زیرشاخه انتخاب‌شده
			</Typography>

			<Paper className="p-24 sm:p-32 w-full" elevation={0} variant="outlined">
				<FormPreview
					fields={schemaFields}
					formTitle={formTitle}
					formDescription={formDescription}
					initialData={serviceFormData}
					onDataChange={onFormDataChange}
					submitButtonLabel="ذخیره اطلاعات"
					hideSubmitButton
				/>
			</Paper>
		</Box>
	);
}

function BasicInfoTab({ isCreateMode, isDraft, subcategories, getSubcategoryLabel }) {
	const {
		control,
		register,
		watch,
		formState: { errors }
	} = useFormContext();
	const watchSubCategoryId = watch('subCategoryId');

	return (
		<Box className="w-full">
			<Typography variant="h5" className="mb-8 font-medium">
				اطلاعات پایه سرویس
			</Typography>
			<Typography variant="body2" color="text.secondary" className="mb-24">
				نام، توضیحات، زیرشاخه، کلمات کلیدی و برچسب‌های سرویس را در این بخش وارد کنید.
			</Typography>

			<Paper className="p-24 sm:p-32 w-full" elevation={0} variant="outlined">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-24">
					<TextField
						fullWidth
						label="نام سرویس"
						{...register('name', { required: 'نام سرویس الزامی است' })}
						error={!!errors.name}
						helperText={errors.name?.message}
						variant="outlined"
					/>
					<TextField fullWidth label="نام انگلیسی سرویس" {...register('nameEn')} variant="outlined" />

					{!isCreateMode && !isDraft ? (
						<TextField
							fullWidth
							label="زیر شاخه"
							value={getSubcategoryLabel(watchSubCategoryId)}
							disabled
							variant="outlined"
						/>
					) : (
						<FormControl fullWidth error={!!errors.subCategoryId} required>
							<InputLabel>زیر شاخه</InputLabel>
							<Select
								{...register('subCategoryId', {
									required: 'انتخاب زیر شاخه الزامی است'
								})}
								label="زیر شاخه"
								value={watchSubCategoryId || ''}
							>
								{subcategories.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</Select>
							{errors.subCategoryId && <FormHelperText>{errors.subCategoryId.message}</FormHelperText>}
						</FormControl>
					)}
				</div>

				<TextField
					fullWidth
					label="توضیحات"
					{...register('description')}
					variant="outlined"
					multiline
					rows={4}
					className="mb-24"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-24">
					<Controller
						name="keyWords"
						control={control}
						defaultValue={[]}
						render={({ field: { onChange, value } }) => (
							<Autocomplete
								multiple
								freeSolo
								options={[]}
								value={Array.isArray(value) ? value : []}
								onChange={(event, newValue) => {
									onChange(newValue);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										placeholder="کلمه کلیدی را وارد و Enter بزنید"
										label="کلمات کلیدی"
										variant="outlined"
										InputLabelProps={{
											shrink: true
										}}
									/>
								)}
							/>
						)}
					/>

					<Controller
						name="tags"
						control={control}
						defaultValue={[]}
						render={({ field: { onChange, value } }) => (
							<Autocomplete
								multiple
								freeSolo
								options={[]}
								value={Array.isArray(value) ? value : []}
								onChange={(event, newValue) => {
									onChange(newValue);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										placeholder="برچسب را وارد و Enter بزنید"
										label="برچسب‌ها"
										variant="outlined"
										InputLabelProps={{
											shrink: true
										}}
									/>
								)}
							/>
						)}
					/>
				</div>
			</Paper>
		</Box>
	);
}

export { BasicInfoTab, SpecializedInfoTab };
