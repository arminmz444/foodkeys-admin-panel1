import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Button,
	MenuItem,
	Paper,
	Box,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	Snackbar,
	Tabs,
	Tab
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate } from 'react-router-dom';
import {
	useGetServiceByIdQuery,
	useUpdateServiceMutation,
	useCreateServiceMutation,
	useDeleteServiceMutation
} from '../ServicesBankApi';
import { convertSchemaToFields, formatFormDataForApi } from '../../../../../utils/schemaConverter';
import axios from 'axios';
import { useAppSelector } from 'app/store/hooks';
import { selectIsUserAdmin } from 'src/app/auth/user/store/userSlice';
import ManagementDescTab from './tabs/ManagementDescTab';
import ArchivesTab from './tabs/ArchivesTab';
import RelatedServicesTab from './tabs/RelatedServicesTab';
import RegistrarTab from './tabs/RegistrarTab';
import ServiceGalleryTab from './tabs/ServiceGalleryTab';
import { BasicInfoTab, SpecializedInfoTab } from './tabs/BasicAndSpecializedTabs';
import AnnouncementsTab from 'src/app/shared-components/announcements/AnnouncementsTab';
import AdvertisementsTab from 'src/app/shared-components/advertisements/AdvertisementsTab';

function processFileCategory(galleryFiles, fileArray, fileServiceType) {
	if (!fileArray || !Array.isArray(fileArray)) return;
	fileArray.forEach((file) => {
		if (!file?.filePath) return;
		galleryFiles.push({
			id: file.id,
			fileName: file.fileName,
			filePath: file.filePath,
			fileExtension: file.fileExtension,
			fileSize: file.fileSize,
			contentType: file.contentType,
			metadata: typeof file.metadata === 'string' ? file.metadata : JSON.stringify(file.metadata || {}),
			fileServiceType
		});
	});
}

function prepareServiceGalleryFiles(data) {
	const galleryFiles = [];
	processFileCategory(galleryFiles, data.serviceLogoFiles, 'SERVICE_LOGO');
	processFileCategory(galleryFiles, data.serviceBackgroundImages, 'SERVICE_BACKGROUND_IMAGE');
	processFileCategory(galleryFiles, data.serviceGallerySlider, 'SERVICE_GALLERY_SLIDER');
	processFileCategory(galleryFiles, data.serviceGalleryVideo, 'SERVICE_GALLERY_VIDEO');
	return galleryFiles;
}

const defaultFormValues = {
	id: null,
	name: '',
	nameEn: '',
	ranking: 0,
	rankingAll: 0,
	likes: 0,
	dislikes: 0,
	description: '',
	subCategoryId: '',
	elasticFields: '',
	keyWords: [],
	tags: [],
	status: 0,
	adminComment: '',
	registrantId: null,
	hasPrivatePage: false,
	miniAppIframeSource: '',
	additionalData: {},
	logo: '',
	backgroundImage: '',
	serviceLogoFiles: [],
	serviceBackgroundImages: [],
	serviceGallerySlider: [],
	serviceGalleryVideo: []
};

function toStringList(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}
	if (typeof value === 'string' && value.trim()) {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
}

function ServiceDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isCreateMode = !id || id === 'new';
	const isDraft = Boolean(id && id.toString().startsWith('draft-'));
	const isSavedService = !isCreateMode && !isDraft;

	const [tabValue, setTabValue] = useState(0);
	const [localService, setLocalService] = useState(null);
	const [serviceFormData, setServiceFormData] = useState({});
	const [schemaFields, setSchemaFields] = useState([]);
	const [formTitle, setFormTitle] = useState('');
	const [formDescription, setFormDescription] = useState('');
	const [jsonSchema, setJsonSchema] = useState(null);
	const [error, setError] = useState(null);
	const [subcategories, setSubcategories] = useState([]);
	const [selectedSubcategory, setSelectedSubcategory] = useState('');
	const [isLoadingSchema, setIsLoadingSchema] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

	const { data: serviceFromApi, isLoading: apiLoading } = useGetServiceByIdQuery(id, {
		skip: isCreateMode || isDraft
	});

	const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
	const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
	const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

	const methods = useForm({
		defaultValues: defaultFormValues
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset
	} = methods;

	const hasAdminAccess = useAppSelector(selectIsUserAdmin);
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
			0: '#ffc107',
			1: '#4caf50',
			2: '#f44336',
			3: '#482880',
			4: '#aa2e25',
			5: '#3f50b5',
			6: '#8561c5',
			7: '#ffeb3b',
			8: '#d7e360'
		};
		return colorMap[statusValue] || '#000000';
	};

	const showNotification = (message, severity = 'success') => {
		setNotification({
			open: true,
			message,
			severity
		});
	};

	const handleCloseNotification = () => {
		setNotification({ ...notification, open: false });
	};

	const watchSubCategoryId = watch('subCategoryId');

	const handleFormDataChange = (data) => {
		setServiceFormData(data);
	};

	const handleTabChange = (event, value) => {
		setTabValue(value);
	};

	useEffect(() => {
		const fetchSubCategories = async () => {
			try {
				const response = await axios.get('/subcategory/options?categoryId=4&pageSize=100');
				if (response.data.status === 'SUCCESS') {
					setSubcategories(response.data.data);
				}
			} catch (err) {
				console.error('Error fetching subcategories:', err);
				setError('خطا در دریافت زیرشاخه‌ها');
			}
		};

		fetchSubCategories();
	}, []);

	const fetchSubCategorySchema = async (subCategoryId) => {
		if (!subCategoryId) return;

		setIsLoadingSchema(true);
		try {
			const response = await axios.get(`/subcategory/${subCategoryId}/schema`);
			if (response.data.status === 'SUCCESS' && response.data.data) {
				const schema = response.data.data;
				setJsonSchema(schema.schemaDefinition);

				if (schema.schemaDefinition && schema.schemaDefinition.properties) {
					const fieldsArray = convertSchemaToFields(schema.schemaDefinition);
					setSchemaFields(fieldsArray);
					setFormTitle(schema.formTitle || 'فرم سرویس');
					setFormDescription(schema.formDescription || '');
				}
			}
		} catch (err) {
			console.error('Error fetching schema:', err);
			setError('خطا در دریافت ساختار فرم');
		} finally {
			setIsLoadingSchema(false);
		}
	};

	useEffect(() => {
		if ((isCreateMode || isDraft) && watchSubCategoryId && watchSubCategoryId !== selectedSubcategory) {
			setSelectedSubcategory(watchSubCategoryId);
			setServiceFormData({});
			fetchSubCategorySchema(watchSubCategoryId);
		}
	}, [watchSubCategoryId, isCreateMode, isDraft, selectedSubcategory]);

	useEffect(() => {
		if (isDraft) {
			const drafts = JSON.parse(localStorage.getItem('draftServices')) || [];
			const found = drafts.find((draft) => draft.id === id);
			if (found) {
				setLocalService(found);
				reset({
					...defaultFormValues,
					id: found.id,
					name: found.name || '',
					nameEn: found.nameEn || '',
					ranking: found.ranking || 0,
					rankingAll: found.rankingAll || 0,
					likes: found.likes ?? 0,
					dislikes: found.dislikes ?? 0,
					description: found.description || '',
					subCategoryId: found.subCategoryId || '',
					elasticFields: found.elasticFields ? found.elasticFields.join(',') : '',
					keyWords: toStringList(found.keyWords),
					tags: toStringList(found.tags),
					status: found.status || 0,
					adminComment: found.adminComment || '',
					registrantId: found.registrantId || null,
					hasPrivatePage: found.hasPrivatePage || false,
					miniAppIframeSource: found.miniAppIframeSource || '',
					additionalData: found.additionalData || {},
					logo: found.logo || '',
					backgroundImage: found.backgroundImage || '',
					serviceLogoFiles: found.serviceLogoFiles || [],
					serviceBackgroundImages: found.serviceBackgroundImages || [],
					serviceGallerySlider: found.serviceGallerySlider || [],
					serviceGalleryVideo: found.serviceGalleryVideo || []
				});

				setServiceFormData(found.serviceData || {});

				if (found.subCategoryId) {
					setSelectedSubcategory(found.subCategoryId);
					fetchSubCategorySchema(found.subCategoryId);
				}
			}
		} else if (isCreateMode) {
			reset(defaultFormValues);
			setServiceFormData({});
		} else if (serviceFromApi) {
			const registrant = serviceFromApi.registrant || serviceFromApi.registrantUser || serviceFromApi.user;
			const registrantId =
				serviceFromApi.registrantId ||
				serviceFromApi.userId ||
				(registrant
					? {
							value: registrant.id,
							label:
								`${registrant.firstName || ''} ${registrant.lastName || ''}`.trim() ||
								registrant.username ||
								String(registrant.id)
						}
					: null);

			reset({
				...defaultFormValues,
				id: serviceFromApi.id,
				name: serviceFromApi.name || '',
				nameEn: serviceFromApi.nameEn || '',
				ranking: serviceFromApi.ranking || 0,
				rankingAll: serviceFromApi.rankingAll || 0,
				likes: serviceFromApi.likes ?? 0,
				dislikes: serviceFromApi.dislikes ?? 0,
				description: serviceFromApi.description || '',
				subCategoryId: serviceFromApi.subCategoryId || '',
				elasticFields: serviceFromApi.elasticFields ? serviceFromApi.elasticFields.join(',') : '',
				keyWords: toStringList(serviceFromApi.keyWords),
				tags: toStringList(serviceFromApi.tags),
				status: serviceFromApi.status || 0,
				adminComment: serviceFromApi.adminComment || '',
				registrantId,
				hasPrivatePage: serviceFromApi.hasPrivatePage || false,
				miniAppIframeSource: serviceFromApi.miniAppIframeSource || '',
				additionalData: serviceFromApi.additionalData || {},
				logo: serviceFromApi.logo || '',
				backgroundImage: serviceFromApi.backgroundImage || '',
				serviceLogoFiles: [],
				serviceBackgroundImages: [],
				serviceGallerySlider: [],
				serviceGalleryVideo: []
			});

			setServiceFormData(serviceFromApi.data || {});

			if (serviceFromApi.serviceSchemaDTO) {
				try {
					const schema = serviceFromApi.serviceSchemaDTO.schemaDefinition;
					setJsonSchema(schema);

					if (schema && schema.properties) {
						const fieldsArray = convertSchemaToFields(schema);
						setSchemaFields(fieldsArray);
						setFormTitle(serviceFromApi.serviceSchemaDTO.formTitle || 'فرم سرویس');
						setFormDescription(serviceFromApi.serviceSchemaDTO.formDescription || '');
					}
				} catch (err) {
					console.error('Error processing schema:', err);
					setError('خطا در پردازش اسکیمای فرم');
				}
			}
		}
	}, [isDraft, isCreateMode, id, serviceFromApi, reset]);

	const buildServicePayload = (data) => {
		const formattedSchemaData = jsonSchema
			? formatFormDataForApi(serviceFormData, jsonSchema)
			: serviceFormData;

		const elasticFieldsArray = data.elasticFields
			? data.elasticFields
					.split(',')
					.map((field) => field.trim())
					.filter((field) => field)
			: [];

		const userId = data.registrantId?.value || data.registrantId || data.userId || null;
		const logo = data.serviceLogoFiles?.[0]?.filePath || data.logo || '';
		const backgroundImage =
			data.serviceBackgroundImages?.[0]?.filePath || data.backgroundImage || '';

		return {
			name: data.name,
			nameEn: data.nameEn,
			ranking: parseInt(data.ranking, 10) || 0,
			rankingAll: parseInt(data.rankingAll, 10) || 0,
			likes: Math.max(0, parseInt(data.likes, 10) || 0),
			dislikes: Math.max(0, parseInt(data.dislikes, 10) || 0),
			description: data.description,
			subCategoryId: parseInt(data.subCategoryId, 10) || 0,
			elasticFields: elasticFieldsArray,
			keyWords: toStringList(data.keyWords),
			tags: toStringList(data.tags),
			data: formattedSchemaData,
			adminComment: data.adminComment || '',
			userId,
			hasPrivatePage: data.hasPrivatePage || false,
			miniAppIframeSource: data.miniAppIframeSource || '',
			additionalData: data.additionalData || serviceFromApi?.additionalData || {},
			logo,
			backgroundImage,
			galleryFiles: prepareServiceGalleryFiles(data),
			status: parseInt(data.status, 10) || 0
		};
	};

	const onSubmit = async (data) => {
		try {
			const payload = buildServicePayload(data);

			if (isDraft) {
				const created = await createService(payload).unwrap();
				showNotification('سرویس با موفقیت ایجاد شد!');

				const drafts = JSON.parse(localStorage.getItem('draftServices')) || [];
				const updatedDrafts = drafts.filter((draft) => draft.id !== id);
				localStorage.setItem('draftServices', JSON.stringify(updatedDrafts));

				const createdId = created?.data?.id || created?.id;
				if (createdId) {
					navigate(`/banks/service/${createdId}/details`);
				} else {
					navigate('/banks/service');
				}
			} else if (isCreateMode) {
				const created = await createService(payload).unwrap();
				showNotification('سرویس با موفقیت ایجاد شد!');

				const createdId = created?.data?.id || created?.id;
				if (createdId) {
					navigate(`/banks/service/${createdId}/details`);
				} else {
					navigate('/banks/service');
				}
			} else {
				const updatedService = {
					...payload,
					id: serviceFromApi.id
				};

				await updateService({ id: serviceFromApi.id, service: updatedService }).unwrap();
				showNotification('سرویس با موفقیت بروزرسانی شد');
			}
		} catch (err) {
			console.error('Operation failed:', err);
			setError(isCreateMode || isDraft ? 'خطا در ایجاد سرویس' : 'خطا در به‌روزرسانی سرویس');
			showNotification(isCreateMode || isDraft ? 'خطا در ایجاد سرویس' : 'خطا در به‌روزرسانی سرویس', 'error');
		}
	};

	const handleDelete = async () => {
		try {
			if (isDraft) {
				const drafts = JSON.parse(localStorage.getItem('draftServices')) || [];
				const updatedDrafts = drafts.filter((draft) => draft.id !== id);
				localStorage.setItem('draftServices', JSON.stringify(updatedDrafts));
				showNotification('پیش‌نویس سرویس با موفقیت حذف شد!');
			} else if (!isCreateMode) {
				await deleteService(id).unwrap();
				showNotification('سرویس با موفقیت حذف شد!');
			}
			navigate('/banks/service');
		} catch (err) {
			console.error('Delete failed:', err);
			setError('خطا در حذف سرویس');
			showNotification('خطا در حذف سرویس', 'error');
		}
	};

	const getSubcategoryLabel = (subcategoryId) => {
		const subcategory = subcategories.find((item) => item.value.toString() === subcategoryId?.toString());
		return subcategory ? subcategory.label : subcategoryId;
	};

	if ((!isCreateMode && !isDraft && apiLoading) || (isDraft && !localService && !isCreateMode)) {
		return <FuseLoading />;
	}

	const getPageTitle = () => {
		if (isCreateMode) return 'ایجاد سرویس جدید';
		if (isDraft) return 'تبدیل پیش‌نویس به سرویس';
		return 'ویرایش سرویس';
	};

	const getSubmitLabel = () => {
		if (isUpdating || isCreating) return 'در حال ارسال...';
		if (isCreateMode) return 'ایجاد سرویس';
		if (isDraft) return 'تبدیل به سرویس';
		return 'ذخیره تغییرات';
	};

	return (
		<FormProvider {...methods}>
			<div className="w-full px-16 sm:px-24 md:px-32 py-16 sm:py-24">
				<Box className="flex flex-row items-center mb-24 flex-wrap gap-12">
					<Typography variant="h4" className="flex-grow font-medium">
						{getPageTitle()}
					</Typography>

					{hasAdminAccess && !isCreateMode && (
						<FormControl variant="outlined" className="min-w-160" size="small">
							<InputLabel id="service-status-label">وضعیت</InputLabel>
							<Select
								labelId="service-status-label"
								label="وضعیت"
								{...register('status')}
								value={watch('status') || 0}
								onChange={(e) => setValue('status', e.target.value, { shouldDirty: true })}
							>
								{serviceStatusOptions.map((option) => (
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

					{!isCreateMode && (
						<Button
							variant="outlined"
							color="error"
							onClick={() => setDeleteDialogOpen(true)}
							disabled={isDeleting}
						>
							حذف
						</Button>
					)}
					<Button variant="outlined" onClick={() => navigate('/banks/service')}>
						انصراف
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSubmit(onSubmit)}
						disabled={isUpdating || isCreating || isLoadingSchema}
					>
						{getSubmitLabel()}
					</Button>
				</Box>

				<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
					<DialogTitle>تایید حذف</DialogTitle>
					<DialogContent>
						<Typography>آیا از حذف این {isDraft ? 'پیش‌نویس سرویس' : 'سرویس'} اطمینان دارید؟</Typography>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setDeleteDialogOpen(false)}>انصراف</Button>
						<Button
							onClick={() => {
								setDeleteDialogOpen(false);
								handleDelete();
							}}
							color="error"
							variant="contained"
						>
							حذف
						</Button>
					</DialogActions>
				</Dialog>

				{error && (
					<Alert severity="error" className="mb-24" onClose={() => setError(null)}>
						{error}
					</Alert>
				)}

				<Paper elevation={0} className="mb-24 overflow-hidden w-full" variant="outlined">
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						indicatorColor="secondary"
						textColor="secondary"
						variant="scrollable"
						scrollButtons="auto"
						classes={{ root: 'w-full h-64 border-b-1' }}
					>
						<Tab className="h-64" label="اطلاعات پایه" />
						<Tab className="h-64" label="اطلاعات تخصصی" />
						<Tab className="h-64" label="گالری" />
						<Tab className="h-64" label="توضیحات مدیریت" />
						<Tab className="h-64" label="اطلاعات بیشتر" />
						<Tab className="h-64" label="آرشیوها" disabled={!isSavedService} />
						<Tab className="h-64" label="سرویس‌های مرتبط" disabled={!isSavedService} />
						<Tab className="h-64" label="سرویس‌های رقیب" disabled={!isSavedService} />
						<Tab className="h-64" label="سرویس‌های زیرمجموعه" disabled={!isSavedService} />
						<Tab className="h-64" label="اعلان‌ها" />
						<Tab className="h-64" label="تبلیغات" />
					</Tabs>

					<div className="p-24 sm:p-32 md:p-40 w-full">
						{tabValue === 0 && (
							<BasicInfoTab
								isCreateMode={isCreateMode}
								isDraft={isDraft}
								subcategories={subcategories}
								getSubcategoryLabel={getSubcategoryLabel}
							/>
						)}

						{tabValue === 1 && (
							<SpecializedInfoTab
								schemaFields={schemaFields}
								formTitle={formTitle}
								formDescription={formDescription}
								serviceFormData={serviceFormData}
								onFormDataChange={handleFormDataChange}
								isLoadingSchema={isLoadingSchema}
								isCreateMode={isCreateMode}
								isDraft={isDraft}
								watchSubCategoryId={watchSubCategoryId}
							/>
						)}

						{tabValue === 2 && <ServiceGalleryTab />}
						{tabValue === 3 && <ManagementDescTab isDraft={isDraft || isCreateMode} />}
						{tabValue === 4 && <RegistrarTab />}
						{tabValue === 5 &&
							(isSavedService ? (
								<ArchivesTab />
							) : (
								<Alert severity="info">آرشیوها پس از ذخیره سرویس در دسترس خواهند بود.</Alert>
							))}
						{tabValue === 6 && <RelatedServicesTab isDraft={isDraft || isCreateMode} relationType="related" />}
						{tabValue === 7 && <RelatedServicesTab isDraft={isDraft || isCreateMode} relationType="rival" />}
						{tabValue === 8 && <RelatedServicesTab isDraft={isDraft || isCreateMode} relationType="sub-company" />}
						{tabValue === 9 && <AnnouncementsTab name="additionalData.announcements" />}
						{tabValue === 10 && <AdvertisementsTab name="additionalData.advertisements" />}
					</div>
				</Paper>

				<Box className="flex justify-end gap-12 mb-16">
					<Button variant="outlined" onClick={() => navigate('/banks/service')}>
						انصراف
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSubmit(onSubmit)}
						disabled={isUpdating || isCreating || isLoadingSchema}
					>
						{getSubmitLabel()}
					</Button>
				</Box>

				<Snackbar
					open={notification.open}
					autoHideDuration={6000}
					onClose={handleCloseNotification}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				>
					<Alert onClose={handleCloseNotification} severity={notification.severity}>
						{notification.message}
					</Alert>
				</Snackbar>
			</div>
		</FormProvider>
	);
}

export default ServiceDetails;
