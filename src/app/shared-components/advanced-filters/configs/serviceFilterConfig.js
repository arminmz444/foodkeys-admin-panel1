/**
 * Advanced-filter configuration for the Service entity.
 *
 * The Service list page currently sends simple named query params. To keep the
 * advanced filters aligned with the company tables, every field below is emitted
 * into the shared `filter` array (field:OP:value) unless it declares its own
 * `param`. `isEmpty` / `isNotEmpty` operations are added across the board, and
 * gallery/file sections are exposed as presence filters.
 */

export const serviceStatusOptions = [
	{ value: '0', label: 'در انتظار تایید' },
	{ value: '1', label: 'تایید شده' },
	{ value: '2', label: 'رد شده' },
	{ value: '3', label: 'آرشیو شده' },
	{ value: '4', label: 'حذف شده' },
	{ value: '5', label: 'ویرایش شده' },
	{ value: '6', label: 'منتشر شده' },
	{ value: '7', label: 'بازبینی' },
	{ value: '8', label: 'ثبت اولیه' },
];

export const serviceAdvancedFilterConfig = {
	title: 'فیلترهای پیشرفته خدمات',
	groups: [
		{
			title: 'اطلاعات پایه',
			fields: [
				{
					field: 'id',
					label: 'شناسه سرویس',
					type: 'number',
					operations: ['EQUALS', 'IN', 'NOT_IN', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN'],
					defaultOperation: 'EQUALS',
				},
				{
					field: 'name',
					label: 'نام سرویس',
					type: 'text',
					operations: ['CONTAINS', 'EQUALS', 'NOT_EQUALS', 'STARTS_WITH', 'ENDS_WITH', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'nameEn',
					label: 'نام انگلیسی سرویس',
					type: 'text',
					operations: ['CONTAINS', 'EQUALS', 'STARTS_WITH', 'ENDS_WITH', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'description',
					label: 'توضیحات',
					type: 'text',
					operations: ['CONTAINS', 'EQUALS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'status',
					label: 'وضعیت',
					type: 'select',
					options: serviceStatusOptions,
					operations: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'EQUALS',
				},
				{
					field: 'subcategory',
					label: 'زیرشاخه',
					type: 'text',
					operations: ['EQUALS', 'CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
					defaultOperation: 'CONTAINS',
				},
				{
					field: 'serviceSchema',
					label: 'قالب سرویس (Schema)',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
				{ field: 'hasPrivatePage', label: 'صفحه اختصاصی دارد', type: 'boolean', defaultOperation: 'EQUALS' },
			],
		},
		{
			title: 'محتوا و متادیتا',
			fields: [
				{ field: 'keyWords', label: 'کلمات کلیدی', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'tags', label: 'برچسب‌ها', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'adminComment', label: 'یادداشت مدیر', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'miniAppIframeSource', label: 'منبع مینی‌اپ', type: 'text', defaultOperation: 'CONTAINS' },
				{ field: 'data', label: 'داده‌ها (data)', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
				{ field: 'additionalData', label: 'داده‌های تکمیلی', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
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
					field: 'createdAt',
					label: 'تاریخ ایجاد',
					type: 'datetime',
					inputsByOperation: {
						BETWEEN: [
							{ label: 'از تاریخ', type: 'date' },
							{ label: 'تا تاریخ', type: 'date' },
						],
					},
					defaultOperation: 'BETWEEN',
				},
				{
					field: 'updatedAt',
					label: 'تاریخ بروزرسانی',
					type: 'datetime',
					inputsByOperation: {
						BETWEEN: [
							{ label: 'از تاریخ', type: 'date' },
							{ label: 'تا تاریخ', type: 'date' },
						],
					},
					defaultOperation: 'BETWEEN',
				},
			],
		},
		{
			title: 'گالری و فایل‌ها (دارد / ندارد)',
			fields: [
				{ field: 'logo', label: 'لوگو (ستون)', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
				{ field: 'background', label: 'تصویر پس‌زمینه (ستون)', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
				{
					field: 'galleryServiceLogo',
					fieldPath: 'galleryFiles.SERVICE_LOGO',
					label: 'فایل لوگو (گالری)',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
				{
					field: 'galleryServiceBackground',
					fieldPath: 'galleryFiles.SERVICE_BACKGROUND_IMAGE',
					label: 'تصویر پس‌زمینه (گالری)',
					type: 'presence',
					defaultOperation: 'IS_NOT_EMPTY',
				},
				{
					field: 'galleryServiceSlider',
					fieldPath: 'galleryFiles.SERVICE_GALLERY_SLIDER',
					label: 'گالری اسلایدر',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
				{
					field: 'galleryServiceVideo',
					fieldPath: 'galleryFiles.SERVICE_GALLERY_VIDEO',
					label: 'گالری ویدیو',
					type: 'presence',
					defaultOperation: 'IS_EMPTY',
				},
			],
		},
		{
			title: 'موقعیت مکانی',
			fields: [
				{ field: 'location', label: 'موقعیت مکانی', type: 'presence', defaultOperation: 'IS_NOT_EMPTY' },
			],
		},
	],
};

export default serviceAdvancedFilterConfig;
