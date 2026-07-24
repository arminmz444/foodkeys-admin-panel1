/**
 * Advanced-filter configuration for the Company entity.
 *
 * This config is shared by the food-industry and agriculture-industry company
 * tables. Each page imports it and may spread/override fields locally.
 *
 * Field config shape (see AdvancedFilters.jsx / buildFilterQuery.js):
 *   {
 *     field:            string  // key used on the left of the filter token
 *     fieldPath?:       string  // overrides `field` in the emitted token
 *     label:            string  // Persian label
 *     type:             'text'|'number'|'date'|'datetime'|'select'|'boolean'|'presence'
 *     operations?:      string[]      // allowed operation keys (defaults by type)
 *     defaultOperation?:string
 *     options?:         {value,label}[]   // for select fields
 *     param?:           string  // if set (and !== 'filter') sent as its own query param
 *     inputsByOperation?: { [op]: [{label,type,options,placeholder}, ...] }
 *   }
 */

export const companyStatusOptions = [
	{ value: '0', label: 'در انتظار تایید' },
	{ value: '1', label: 'تایید شده' },
	{ value: '2', label: 'رد شده' },
	{ value: '3', label: 'آرشیو شده' },
	{ value: '4', label: 'حذف شده' },
	{ value: '5', label: 'ویرایش شده' },
	{ value: '6', label: 'منتشر شده' },
	{ value: '7', label: 'بازبینی' },
	{ value: '8', label: 'ثبت اولیه' },
	{ value: '9', label: 'در انتظار پرداخت' },
	{ value: '10', label: 'اتمام اشتراک' },
];

const dateBetweenInputs = {
	BETWEEN: [
		{ label: 'از تاریخ', type: 'date' },
		{ label: 'تا تاریخ', type: 'date' },
	],
};

export const companyAdvancedFilterConfig = {
	title: 'فیلترهای پیشرفته شرکت‌ها',
	groups: [
		{
			title: 'اطلاعات پایه',
			fields: [
				{
					field: 'id',
					label: 'شناسه شرکت',
					type: 'number',
					operations: ['EQUALS', 'IN', 'NOT_IN', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN'],
					defaultOperation: 'EQUALS',
				},
				{ field: 'companyName', label: 'نام شرکت', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'companyNameEn', label: 'نام انگلیسی شرکت', type: 'text', defaultOperation: 'CONTAINS' },
				{
					field: 'companyType',
					label: 'نوع شرکت',
					type: 'text',
					operations: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'status',
					label: 'وضعیت',
					type: 'select',
					options: companyStatusOptions,
					operations: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'EQUALS',
				},
				{
					field: 'subCategory',
					label: 'زیرشاخه',
					type: 'text',
					operations: ['EQUALS', 'CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'hasPrivatePage',
					label: 'صفحه اختصاصی دارد',
					type: 'boolean',
					defaultOperation: 'EQUALS',
				},
			],
		},
		{
			title: 'مدیریت و ثبت‌کننده',
			fields: [
				{ field: 'ceo', label: 'مدیرعامل', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'ceoPhoneNumber', label: 'شماره تماس مدیرعامل', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'ceoEmail', label: 'ایمیل مدیرعامل', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'owner', label: 'مالک', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'answerName', label: 'نام پاسخگو', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'registrant', label: 'ثبت‌کننده', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'registrantUsername', label: 'نام کاربری ثبت‌کننده', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'registrantPhone', label: 'تلفن همراه ثبت‌کننده', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'registrantTel', label: 'تلفن ثابت ثبت‌کننده', type: 'text', defaultOperation: 'CONTAINS' },
			],
		},
		{
			title: 'محتوا و توضیحات',
			fields: [
				{ field: 'description', label: 'توضیحات', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'history', label: 'تاریخچه', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'advertisingSlogan', label: 'شعار تبلیغاتی', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'subjectOfActivity', label: 'موضوع فعالیت', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'keyWords', label: 'کلمات کلیدی', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'tags', label: 'برچسب‌ها', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'holding', label: 'هلدینگ', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'productTitles', label: 'عناوین محصولات', type: 'text', defaultOperation: 'CONTAINS' },
				{
					field: 'outSourcedProductTitles',
					label: 'عناوین محصولات برون‌سپاری',
					type: 'text',
					defaultOperation: 'CONTAINS',
				},
				{ field: 'rawMaterialsOrigin', label: 'منشأ مواد اولیه', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'employeesCount', label: 'تعداد کارکنان', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'buildingArea', label: 'مساحت ساختمان', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'landArea', label: 'مساحت زمین', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'adminComment', label: 'یادداشت مدیر', type: 'text', defaultOperation: 'CONTAINS' },
			],
		},
		{
			title: 'آمار و رتبه‌بندی',
			fields: [
				{ field: 'ranking', label: 'رتبه', type: 'number', defaultOperation: 'EQUALS' },
				{ field: 'rankingAll', label: 'رتبه کلی', type: 'number', defaultOperation: 'EQUALS' },
				{ field: 'visit', label: 'تعداد بازدید', type: 'number', defaultOperation: 'GREATER_THAN' },
				{
					field: 'likes',
					label: 'تعداد پسندها (لایک)',
					type: 'number',
					operations: [
						'EQUALS',
						'GREATER_THAN',
						'GREATER_THAN_OR_EQUAL',
						'LESS_THAN',
						'LESS_THAN_OR_EQUAL',
						'BETWEEN',
						'IS_EMPTY',
						'IS_NOT_EMPTY',
					],
					defaultOperation: 'GREATER_THAN',
				},
				{
					field: 'dislikes',
					label: 'تعداد نپسندها (دیس‌لایک)',
					type: 'number',
					operations: [
						'EQUALS',
						'GREATER_THAN',
						'GREATER_THAN_OR_EQUAL',
						'LESS_THAN',
						'LESS_THAN_OR_EQUAL',
						'BETWEEN',
						'IS_EMPTY',
						'IS_NOT_EMPTY',
					],
					defaultOperation: 'GREATER_THAN',
				},
			],
		},
		{
			title: 'تاریخ‌ها',
			fields: [
				{
					field: 'establishDate',
					label: 'تاریخ تأسیس',
					type: 'date',
					inputsByOperation: dateBetweenInputs,
					defaultOperation: 'BETWEEN',
				},
				{
					field: 'createdAt',
					label: 'تاریخ ایجاد',
					type: 'datetime',
					inputsByOperation: dateBetweenInputs,
					defaultOperation: 'BETWEEN',
				},
				{
					field: 'updatedAt',
					label: 'تاریخ بروزرسانی',
					type: 'datetime',
					inputsByOperation: dateBetweenInputs,
					defaultOperation: 'BETWEEN',
				},
			],
		},
		{
			title: 'موقعیت مکانی',
			fields: [
				{
					field: 'province',
					label: 'استان',
					type: 'text',
					operations: ['CONTAINS', 'EQUALS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'city',
					label: 'شهر',
					type: 'text',
					operations: ['CONTAINS', 'EQUALS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'location',
					label: 'موقعیت مکانی',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
			],
		},
		{
			// Presence filters for gallery / file sections. `fieldPath` encodes the
			// gallery file service type so the backend can join on GalleryFile.
			title: 'گالری و فایل‌ها (دارد / ندارد)',
			fields: [
				{ field: 'logo', label: 'لوگو', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
				{ field: 'backgroundImage', label: 'تصویر پس‌زمینه (ستون)', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
				{
					field: 'galleryCompanyLogo',
					fieldPath: 'galleryFiles.COMPANY_LOGO',
					label: 'فایل لوگو (گالری)',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
				{
					field: 'galleryBackgroundImage',
					fieldPath: 'galleryFiles.COMPANY_BACKGROUND_IMAGE',
					label: 'تصویر پس‌زمینه (گالری)',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
				{
					field: 'galleryCertificate',
					fieldPath: 'galleryFiles.COMPANY_CERTIFICATE',
					label: 'گواهی‌ها و مجوزها',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryDocument',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_DOCUMENT',
					label: 'اسناد',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryProduct',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_PRODUCT',
					label: 'گالری محصولات',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryContact',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_CONTACT',
					label: 'گالری مخاطبین',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryCatalog',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_CATALOG',
					label: 'گالری کاتالوگ',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'gallerySlider',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_SLIDER',
					label: 'گالری اسلایدر',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryVideo',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_VIDEO',
					label: 'گالری ویدیو',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryGif',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_GIF',
					label: 'تیزر متحرک (GIF)',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryOfficeEnvironment',
					fieldPath: 'galleryFiles.COMPANY_GALLERY_OFFICE_ENVIRONMENT',
					label: 'گالری فضای اداری',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
			],
		},
		{
			// Presence filters for related collections / newer tabs.
			title: 'بخش‌ها و روابط (دارد / ندارد)',
			fields: [
				{ field: 'subCompanies', label: 'شرکت‌های زیرمجموعه', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'rivalCompanies', label: 'شرکت‌های رقیب', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'relatedCompanies', label: 'شرکت‌های مرتبط', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'announcements', label: 'اطلاعیه‌ها', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'advertisements', label: 'تبلیغات', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'watermark', label: 'واترمارک', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'brands', label: 'برندها', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'products', label: 'محصولات', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'socialMedias', label: 'شبکه‌های اجتماعی', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'stakeholders', label: 'سهامداران', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'industries', label: 'صنایع', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'activities', label: 'فعالیت‌های کاری', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'contacts', label: 'مخاطبین', type: 'presence', defaultOperation: 'IS_EMPTY' },
				{ field: 'tels', label: 'تلفن‌ها', type: 'presence', defaultOperation: 'IS_EMPTY' },
			],
		},
	],
};

export default companyAdvancedFilterConfig;
