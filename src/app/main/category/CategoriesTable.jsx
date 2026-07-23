// /* eslint-disable react/no-unstable-nested-components */
// import { Paper } from '@mui/material';
// import GenericCrudTable from 'app/shared-components/data-table/GenericCrudTable.jsx';
// import EntityStatusField from 'app/shared-components/data-table/EntityStatusField.jsx';
// import FuseScrollbars from '@fuse/core/FuseScrollbars/index.js';
// import {
// 	useCreateCategoryMutation,
// 	useDeleteCategoryMutation,
// 	// useDeleteECommerceOrdersMutation,
// 	useGetCategoriesQuery,
// 	useUpdateCategoryMutation
// } from './CategoriesApi.js';
// import { setCategories } from './categorySlice.js';
//
// function CategoriesTable() {
// 	// const [removeOrders] = useDeleteECommerceOrdersMutation();
// 	// const columns = useMemo(
// 	// 	() => [
// 	// 		{
// 	// 			accessorKey: 'id',
// 	// 			header: 'Id',
// 	// 			size: 64
// 	// 		},
// 	// 		{
// 	// 			accessorKey: 'reference',
// 	// 			header: 'Reference',
// 	// 			size: 64,
// 	// 			Cell: ({ row }) => (
// 	// 				<Typography
// 	// 					component={Link}
// 	// 					to={`/apps/e-commerce/orders/${row.original.id}`}
// 	// 					className="underline"
// 	// 					color="secondary"
// 	// 					role="button"
// 	// 				>
// 	// 					{row.original.reference}
// 	// 				</Typography>
// 	// 			)
// 	// 		},
// 	// 		{
// 	// 			id: 'customer',
// 	// 			accessorFn: (row) => `${row.customer.firstName} ${row.customer.lastName}`,
// 	// 			header: 'Customer'
// 	// 		},
// 	// 		{
// 	// 			id: 'total',
// 	// 			accessorFn: (row) => `$${row.total}`,
// 	// 			header: 'Total',
// 	// 			size: 64
// 	// 		},
// 	// 		{ id: 'payment', accessorFn: (row) => row.payment.method, header: 'Payment', size: 128 },
// 	// 		{
// 	// 			id: 'status',
// 	// 			accessorFn: (row) => <OrdersStatus name={row.status[0].name} />,
// 	// 			accessorKey: 'status',
// 	// 			header: 'Status'
// 	// 		},
// 	// 		{
// 	// 			accessorKey: 'date',
// 	// 			header: 'Date'
// 	// 		}
// 	// 	],
// 	// 	[]
// 	// );
//
// 	const categoryStatusSelectOptionsMapper = {
// 		1: 'فعال',
// 		2: 'غیرفعال'
// 	};
// 	const categoryStatusSelectOptions = [...Object.values(categoryStatusSelectOptionsMapper)];
// 	const columns = [
// 		{
// 			accessorKey: 'id',
// 			header: 'شناسه',
// 			size: 32
// 		},
// 		{
// 			header: 'نام دسته بندی',
// 			accessorKey: 'name'
// 		},
// 		{
// 			header: 'نام انگلیسی',
// 			accessorKey: 'nameEn'
// 		},
// 		{
// 			header: 'وضعیت',
// 			accessorKey: 'categoryStatus',
// 			editVariant: 'select',
// 			editSelectOptions: categoryStatusSelectOptions,
// 			accessorFn: (row) =>
// 				row?.categoryStatus == 1 ? (
// 					<EntityStatusField
// 						name="فعال"
// 						colorClsx="bg-green text-white"
// 					/>
// 				) : (
// 					<EntityStatusField
// 						name="غیرفعال"
// 						colorClsx="bg-red-700 text-white"
// 					/>
// 				)
// 		},
// 		{
// 			header: 'ترتیب صفحه',
// 			accessorKey: 'pageOrder'
// 		},
// 		{
// 			header: 'تعداد زیرمجموعه‌ها',
// 			accessorKey: 'subCategoryCount'
// 		},
// 		{
// 			header: 'تعداد شرکت‌ها',
// 			accessorKey: 'companyCount'
// 		},
// 		{
// 			header: 'تعداد صنایع',
// 			accessorKey: 'industryCount'
// 		},
// 		{
// 			header: 'تعداد بازدید',
// 			accessorKey: 'visitCount'
// 		},
// 		{
// 			header: 'تاریخ ایجاد',
// 			accessorKey: 'createdAtStr',
// 			Cell: ({ value }) => value || '—' // Handle null values
// 		},
// 		{
// 			header: 'آخرین بروزرسانی',
// 			accessorKey: 'updatedAtStr',
// 			Cell: ({ value }) => value || '—'
// 		}
// 	];
//
// 	return (
// 		<div className="w-full flex flex-col">
// 			<FuseScrollbars className="grow overflow-x-auto">
// 				<Paper
// 					className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-screen p-24"
// 					elevation={0}
// 				>
// 					<GenericCrudTable
// 						columns={columns}
// 						useListQueryHook={useGetCategoriesQuery}
// 						useCreateMutationHook={useCreateCategoryMutation}
// 						useUpdateMutationHook={useUpdateCategoryMutation}
// 						useDeleteMutationHook={useDeleteCategoryMutation}
// 						saveToStore
// 						storeDataAction={setCategories}
// 						enableRowAction={false}
// 					/>
// 					{/* <DataTable */}
// 					{/*	initialState={{ */}
// 					{/*		density: 'spacious', */}
// 					{/*		showColumnFilters: false, */}
// 					{/*		showGlobalFilter: true, */}
// 					{/*		columnPinning: { */}
// 					{/*			left: ['mrt-row-expand', 'mrt-row-select'], */}
// 					{/*			right: ['mrt-row-actions'] */}
// 					{/*		}, */}
// 					{/*		pagination: { */}
// 					{/*			pageIndex: 0, */}
// 					{/*			pageSize: 10 */}
// 					{/*		} */}
// 					{/*	}} */}
// 					{/*	data={orders} */}
// 					{/*	columns={columns} */}
// 					{/*	renderRowActionMenuItems={({ closeMenu, row, table }) => [ */}
// 					{/*		<MenuItem */}
// 					{/*			key={0} */}
// 					{/*			onClick={() => { */}
// 					{/*				removeOrders([row.original.id]); */}
// 					{/*				closeMenu(); */}
// 					{/*				table.resetRowSelection(); */}
// 					{/*			}} */}
// 					{/*		> */}
// 					{/*			<ListItemIcon> */}
// 					{/*				<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon> */}
// 					{/*			</ListItemIcon> */}
// 					{/*			حذف */}
// 					{/*		</MenuItem> */}
// 					{/*	]} */}
// 					{/*	renderTopToolbarCustomActions={({ table }) => { */}
// 					{/*		const { rowSelection } = table.getState(); */}
//
// 					{/*		if (Object.keys(rowSelection).length === 0) { */}
// 					{/*			return null; */}
// 					{/*		} */}
//
// 					{/*		return ( */}
// 					{/*			<Button */}
// 					{/*				variant="contained" */}
// 					{/*				size="small" */}
// 					{/*				onClick={() => { */}
// 					{/*					const selectedRows = table.getSelectedRowModel().rows; */}
// 					{/*					removeOrders(selectedRows.map((row) => row.original.id)); */}
// 					{/*					table.resetRowSelection(); */}
// 					{/*				}} */}
// 					{/*				className="flex shrink min-w-40 ltr:mr-8 rtl:ml-8" */}
// 					{/*				color="secondary" */}
// 					{/*			> */}
// 					{/*				<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon> */}
// 					{/*				<span className="hidden sm:flex mx-8">Delete selected items</span> */}
// 					{/*			</Button> */}
// 					{/*		); */}
// 					{/*	}} */}
// 					{/* /> */}
// 				</Paper>
// 			</FuseScrollbars>
// 		</div>
// 	);
// }
//
// export default CategoriesTable;
// CategoryTable.jsx (Example usage)
import React, { useState } from 'react';
import { z } from 'zod';
import EntityStatusField from 'app/shared-components/data-table/EntityStatusField.jsx';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { CustomUniformsSelect } from 'app/shared-components/dynamic-field-generator/custom-fields/CustomFormFields';
import {
	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation
} from './CategoriesApi';
import GenericCrudTable from '../../shared-components/data-table/GenericCrudTable';

const DEPENDANT_ENTITY_TYPE_OPTIONS = [
	{ label: 'شرکت', value: 'COMPANY' },
	{ label: 'خدمت', value: 'SERVICE' }
];

const DEPENDANT_ENTITY_TYPE_LABEL_MAP = {
	COMPANY: 'شرکت',
	SERVICE: 'خدمت'
};

function CategoryTable() {
	const [createCategory] = useCreateCategoryMutation();
	const [updateCategory] = useUpdateCategoryMutation();
	const [loading, setLoading] = useState(false);
	const categoryStatusSelectOptionsMapper = {
		1: 'فعال',
		2: 'غیرفعال'
	};
	const categoryStatusSelectOptions = [...Object.values(categoryStatusSelectOptionsMapper)];
	const columns = React.useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'شناسه',
				size: 32,
				enableEditing: false
			},
			{
				header: 'نام دسته بندی',
				accessorKey: 'name'
			},
			{
				header: 'نام انگلیسی',
				accessorKey: 'nameEn'
			},
			{
				header: 'نوع موجودیت',
				accessorKey: 'dependantEntityType',
				editVariant: 'select',
				editSelectOptions: DEPENDANT_ENTITY_TYPE_OPTIONS.map((option) => option.label),
				muiEditTextFieldProps: {
					select: true
				},
				Cell: ({ row }) => {
					const value = row.original?.dependantEntityType;
					return DEPENDANT_ENTITY_TYPE_LABEL_MAP[value] || value || '—';
				},
				size: 140
			},
			{
				header: 'وضعیت',
				accessorKey: 'categoryStatus',
				editVariant: 'select',
				editSelectOptions: categoryStatusSelectOptions,
				muiEditTextFieldProps: {
					select: true
				},
				accessorFn: (row) =>
					row?.categoryStatus == 1 ? (
						<EntityStatusField
							name="فعال"
							colorClsx="bg-green text-white"
						/>
					) : (
						<EntityStatusField
							name="غیرفعال"
							colorClsx="bg-red-700 text-white"
						/>
					)
			},
			{
				header: 'ترتیب صفحه',
				accessorKey: 'pageOrder'
			},
			{
				header: 'تعداد زیرمجموعه‌ها',
				accessorKey: 'subCategoryCount',
				enableEditing: false
			},
			{
				header: 'تعداد شرکت‌ها',
				accessorKey: 'companyCount',
				enableEditing: false
			},
			{
				header: 'تعداد صنایع',
				accessorKey: 'industryCount',
				enableEditing: false
			},
			{
				header: 'تعداد بازدید',
				accessorKey: 'visitCount',
				enableEditing: false
			},
			{
				header: 'تاریخ ایجاد',
				accessorKey: 'createdAtStr',
				Cell: ({ row }) => <div dir="rtl">{row.original.createdAtStr || '—'}</div>,
				enableEditing: false
			},
			{
				header: 'آخرین بروزرسانی',
				accessorKey: 'updatedAtStr',
				Cell: ({ row }) => <div dir="rtl">{row.original.updatedAtStr || '—'}</div>,
				enableEditing: false
			}
		],
		[]
	);

	const rowActions = [
		{
			icon: <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>,
			label: 'زیرمجموعه‌ها',
			onClick: async (row, table, refetchList) => {
				alert(`Show sub-items for: ${row.original.name}`);
				refetchList();
			}
		}
		// 	{
		// 		icon: <PersonOffOutlined />,
		// 		label: 'غیرفعال کردن',
		// 		onClick: async (row, table, refetchList) => {
		// 			// call your disable API
		// 			alert(`Disable: ${row.original.name}`);
		// 			// e.g. await useDisableCategoryMutation(row.original.id);
		// 			refetchList();
		// 		}
		// 	}
	];

	const categoryStatusOptions = [
		{
			label: 'فعال',
			value: '1'
		},
		{
			label: 'غیرفعال',
			value: '2'
		}
	];
	const handleCreate = async (vals) => {
		// setLoading(true);
		const data = _.clone(vals);
		// await createCategory(vals).unwrap();
		data.categoryStatus = vals.categoryStatus === 'فعال' ? 1 : 2;
		data.dependantEntityType =
			typeof vals.dependantEntityType === 'object'
				? vals.dependantEntityType?.value
				: vals.dependantEntityType;
		await createCategory(data);
		// T0D0: HANDLE FIELD VALIDATION
		// const response = await createCategory(data);
		// return response && !response.error;
		return true;
		// setLoading(false);
		// alert(`Create: ${JSON.stringify(data)}`);
	};

	const handleUpdate = async (vals) => {
		const data = _.clone(vals);
		data.categoryStatus = vals.categoryStatus === 'فعال' ? 1 : 2;
		data.dependantEntityType =
			typeof vals.dependantEntityType === 'object'
				? vals.dependantEntityType?.value
				: vals.dependantEntityType;
		await updateCategory(data);
		return true;
	};
	const getEditDefaultValues = (rowData) => {
		return {
			...rowData,
			categoryStatus: rowData?.categoryStatus === 1 ? 'فعال' : 'غیرفعال',
			dependantEntityType: rowData?.dependantEntityType || ''
		};
	};
	const categorySchema = z.object({
		name: z
			.string({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
			.min(1, { message: 'این فیلد الزامی است' })
			.uniforms({
				displayName: 'نام',
				label: 'نام دسته‌بندی',
				placeholder: 'نام دسته‌بندی را وارد کنید'
			}),
		nameEn: z
			.string({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
			.min(1, { message: 'این فیلد الزامی است' })
			.uniforms({
				displayName: 'نام انگلیسی',
				label: 'نام انگلیسی دسته‌بندی',
				placeholder: 'نام انگلیسی دسته‌بندی را وارد کنید'
			}),
		dependantEntityType: z
			.enum(['COMPANY', 'SERVICE'], {
				required_error: 'این فیلد الزامی است',
				invalid_type_error: 'فرمت داده ورودی اشتباه است',
				message: 'مقدار انتخاب شده معتبر نیست'
			})
			.uniforms({
				displayName: 'نوع موجودیت',
				label: 'نوع موجودیت',
				placeholder: 'نوع موجودیت را انتخاب کنید',
				// component: CustomUniformsSelect,
				// options: DEPENDANT_ENTITY_TYPE_OPTIONS
			}),
		categoryStatus: z
			.enum(['فعال', 'غیرفعال'], {
				required_error: 'این فیلد الزامی است',
				invalid_type_error: 'فرمت داده ورودی اشتباه است',
				message: 'مقدار انتخاب شده معتبر نیست'
			})
			.uniforms({
				displayName: 'وضعیت دسته‌بندی',
				label: 'وضعیت دسته‌بندی',
				placeholder: 'وضعیت دسته‌بندی را انتخاب کنید'
			}),
		pageOrder: z
			.number({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
			.min(1, { message: 'حداقل مقدار برای این فیلد ۱ است' })
			.uniforms({
				displayName: 'ترتیب صفحه',
				label: 'ترتیب صفحه دسته‌بندی',
				placeholder: 'اولویت نمایش دسته‌بندی در سایت اصلی را انتخاب کنید'
			})
	});

	const formFieldsInputTypes = {
		name: {
			label: 'نام',
			inputType: 'TextField',
			renderCustomInput: false,
			classes: 'mt-10',
			styles: null,
			props: {
				fullWidth: true
			}
		},
		nameEn: {
			label: 'نام انگلیسی',
			inputType: 'TextField',
			renderCustomInput: false,
			classes: 'mt-10',
			styles: null,
			props: {
				fullWidth: true
			}
		},
		dependantEntityType: {
			label: 'نوع موجودیت',
			inputType: 'Select',
			renderCustomInput: false,
			classes: 'mt-10',
			styles: null,
			options: DEPENDANT_ENTITY_TYPE_OPTIONS,
			props: {
				fullWidth: true
			}
		},
		categoryStatus: {
			label: 'وضعیت',
			inputType: 'Select',
			renderCustomInput: false,
			classes: 'mt-10',
			styles: null,
			options: [
				{ label: 'فعال', value: 'فعال' },
				{ label: 'غیرفعال', value: 'غیرفعال' }
			],
			props: {
				fullWidth: true
			}
		},
		pageOrder: {
			label: 'ترتیب صفحه',
			inputType: 'TextField',
			renderCustomInput: false,
			classes: 'mt-10',
			styles: null,
			props: {
				fullWidth: true,
				type: 'number'
			}
		}
	};


	const createItemProps = {
		// zodSchema: z.object({
		// 	name: z
		// 		.string({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
		// 		.min(1, { message: 'این فیلد الزامی است' })
		// 		.uniforms({
		// 			displayName: 'نام',
		// 			label: 'نام دسته‌بندی',
		// 			placeholder: 'نام دسته‌بندی را وارد کنید'
		// 		}),
		// 	nameEn: z
		// 		.string({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
		// 		.min(1, { message: 'این فیلد الزامی است' })
		// 		.uniforms({
		// 			displayName: 'نام انگلیسی',
		// 			label: 'نام انگلیسی دسته‌بندی',
		// 			placeholder: 'نام انگلیسی دسته‌بندی را وارد کنید'
		// 		}),
		// 	categoryStatus: z
		// 		.enum(['فعال', 'غیرفعال'], {
		// 			required_error: 'این فیلد الزامی است',
		// 			invalid_type_error: 'فرمت داده ورودی اشتباه است',
		// 			message: 'مقدار انتخاب شده معتبر نیست'
		// 		})
		// 		.uniforms({
		// 			displayName: 'وضعیت دسته‌بندی',
		// 			label: 'وضعیت دسته‌بندی',
		// 			placeholder: 'وضعیت دسته‌بندی را انتخاب کنید'
		// 		}),
		// 	pageOrder: z
		// 		.number({ invalid_type_error: 'فرمت داده ورودی اشتباه است', required_error: 'این فیلد الزامی است' })
		// 		.min(1, { message: 'حداقل مقدار برای این فیلد ۱ است' })
		// 		.uniforms({
		// 			displayName: 'ترتیب صفحه',
		// 			label: 'ترتیب صفحه دسته‌بندی',
		// 			placeholder: 'اولویت نمایش دسته‌بندی در سایت اصلی را انتخاب کنید'
		// 		})
		// 	// name: z
		// 	// 	.string( { errorMap: () => ( { message: 'Name must be between 3 to 20 characters' } ) } )
		// 	// 	.min( 3 )
		// 	// 	.max( 20 )
		// }),
		zodSchema: categorySchema,
		jsonSchema: {
			title: 'دسته‌بندی',
			type: 'object',
			properties: {
				name: {
					type: 'string',
					title: 'نام دسته‌بندی',
					message: { required: 'فیلد مساحت ساختمان الزامی است' }
				},
				nameEn: {
					type: 'string',
					title: 'نام انگلیسی دسته‌بندی'
				},
				dependantEntityType: {
					type: 'string',
					title: 'نوع موجودیت',
					description: 'نوع موجودیت وابسته به این دسته‌بندی را انتخاب کنید',
					enum: ['COMPANY', 'SERVICE'],
					uniforms: {
						options: DEPENDANT_ENTITY_TYPE_OPTIONS
					}
				},
				categoryStatus: {
					type: 'string',
					title: 'وضعیت دسته‌بندی',
					description: 'وضعیت دسته‌بندی را انتخاب کنید',
					uniforms: {
						options: [
							{ label: 'فعال', value: '1' },
							{ label: 'غیرفعال', value: '2' }
						]
					}
				},
				pageOrder: {
					type: 'number',
					title: 'ترتیب صفحه',
					min: 1
				},
				profession: {
					type: 'string',
					options: [
						{
							label: 'Developer',
							value: 'developer'
						},
						{
							label: 'Tester',
							value: 'tester'
						},
						{
							label: 'Product owner',
							value: 'product-owner'
						},
						{
							label: 'Project manager',
							value: 'project-manager'
						},
						{
							label: 'Businessman',
							value: 'businessman'
						}
					]
				}
				// products: {
				// 	type: 'array',
				// 	title: 'محصولات و خدمات',
				// 	items: {
				// 		type: 'object',
				// 		properties: {
				// 			name: {
				// 				type: 'string',
				// 				title: 'نام محصول'
				// 			},
				// 			description: {
				// 				type: 'string',
				// 				title: 'توضیحات محصول'
				// 			},
				// 			// otherTypeName: {
				// 			// 	type: 'string',
				// 			// 	title: 'Other Type Name',
				// 			// 	description: 'If categoryType is something custom, store it here'
				// 			// },
				// 			categoryType: {
				// 				type: 'string',
				// 				title: 'دسته‌بندی محصول'
				// 			},
				// 			showProduct: {
				// 				type: 'boolean',
				// 				title: 'نمایش در صفحه اختصاصی؟'
				// 			},
				// 			pictures: {
				// 				type: 'array',
				// 				title: 'تصاویر',
				// 				items: {
				// 					type: 'object',
				// 					properties: {
				// 						url: {
				// 							type: 'string',
				// 							uniforms: { component: ImageField },
				// 							title: 'آدرس عکس آپلود شده'
				// 						},
				// 						description: { type: 'string', title: 'توضیحات عکس' }
				// 					}
				// 				}
				// 			}
				// 		}
				// 	}
				// }
			},
			required: ['name', 'nameEn', 'dependantEntityType', 'categoryStatus', 'pageOrder']
		},
		formHeaderTitle: 'ثبت دسته‌بندی جدید',
		defaultValues: {
			name: '',
			nameEn: '',
			dependantEntityType: 'COMPANY',
			categoryStatus: '0',
			pageOrder: 0
		},
		formEngine: 'UNIFORMS',
		formValidationStruct: 'ZOD_SCHEMA',
		formGenerationType: 'MANUAL',
		hideSubmitField: false,
		// formFieldsInputTypes: {
		// 	name: {
		// 		label: 'نام',
		// 		inputType: 'TextField',
		// 		renderCustomInput: false,
		// 		classes: 'mt-10',
		// 		styles: null,
		// 		props: {
		// 			fullWidth: true
		// 		}
		// 	},
		// 	nameEn: {
		// 		label: 'نام انگلیسی',
		// 		inputType: 'TextField',
		// 		renderCustomInput: false,
		// 		classes: 'mt-10',
		// 		styles: null,
		// 		props: {
		// 			fullWidth: true
		// 		}
		// 	},
		// 	categoryStatus: {
		// 		label: 'وضعیت',
		// 		inputType: 'Select',
		// 		renderCustomInput: false,
		// 		classes: 'mt-10',
		// 		styles: null,
		// 		options: [
		// 			{
		// 				label: 'Developer',
		// 				value: 'developer'
		// 			},
		// 			{
		// 				label: 'Tester',
		// 				value: 'tester'
		// 			},
		// 			{
		// 				label: 'Product owner',
		// 				value: 'product-owner'
		// 			},
		// 			{
		// 				label: 'Project manager',
		// 				value: 'project-manager'
		// 			},
		// 			{
		// 				label: 'Businessman',
		// 				value: 'businessman'
		// 			}
		// 		],
		// 		props: {
		// 			fullWidth: true
		// 		}
		// 	},
		// 	// description: {
		// 	// 	label: "توضیحات",
		// 	// 	inputType: "TextField",
		// 	// 	renderCustomInput: false,
		// 	// 	classes: "mt-10",
		// 	// 	styles: null,
		// 	// 	props: {
		// 	// 		fullWidth: true,
		// 	// 	}
		// 	// },
		// 	pageOrder: {
		// 		label: 'ترتیب صفحه',
		// 		inputType: 'TextField',
		// 		renderCustomInput: false,
		// 		classes: 'mt-10',
		// 		styles: null,
		// 		props: {
		// 			fullWidth: true
		// 		}
		// 	}
		// },
		formFieldsInputTypes,
		onCreate: async (vals) => handleCreate(vals),
		buttonLabel: 'افزودن دسته‌بندی جدید',
		dialogTitle: 'ایجاد دسته‌بندی جدید'
	};
	const editItemProps = {
		zodSchema: categorySchema,
		formHeaderTitle: 'ویرایش دسته‌بندی',
		formEngine: 'UNIFORMS',
		formValidationStruct: 'ZOD_SCHEMA',
		formGenerationType: 'MANUAL',
		hideSubmitField: false,
		formFieldsInputTypes,
		onUpdate: handleUpdate,
		getDefaultValues: getEditDefaultValues,
		dialogTitle: 'ویرایش دسته‌بندی'
	};

	return (
		<GenericCrudTable
			columns={columns}
			useListQueryHook={useGetCategoriesQuery} // listing
			useCreateMutationHook={useCreateCategoryMutation} // create
			useUpdateMutationHook={useUpdateCategoryMutation} // update
			useDeleteMutationHook={useDeleteCategoryMutation} // delete
			rowActions={rowActions}
			createItemProps={createItemProps}
			editItemProps={editItemProps}
			renderTopToolbarCustomActionsClasses="flex justify-start px-8 py-16"
			isSubmitting={loading}
			enableBuiltInEditing={false}
			renderTopToolbarCustomActions={() => (
				// <Button
				// 	color="primary"
				// 	className="p-16"
				// 	variant="contained"
				// 	onClick={() => {
				// 		table.setCreatingRow(true); // simplest way to open the create row modal with no default values
				// 		// or you can pass in a row object to set default values with the `createRow` helper function
				// 		// table.setCreatingRow(
				// 		//   createRow(table, {
				// 		//     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
				// 		//   }),
				// 		// );
				// 	}}
				// >
				// 	Create New User
				// </Button>
				<div />
			)}
		/>
	);
}

export default CategoryTable;
