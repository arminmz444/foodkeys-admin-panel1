// import FuseScrollbars from "@fuse/core/FuseScrollbars/index.js";
// import { Paper } from "@mui/material";
// import Typography from "@mui/material/Typography";
// import EntityStatusField from "app/shared-components/data-table/EntityStatusField.jsx";
// import GenericCrudTable from "app/shared-components/data-table/GenericCrudTable.jsx";
// import { useMemo } from "react";
// import { Link } from "react-router-dom";
// import Button from "@mui/material/Button";
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import CustomUniformsAsyncSelect from 'app/shared-components/dynamic-field-generator/CustomUniformsAsyncSelect';
// import { z } from 'zod';
// import { FaInfoCircle } from 'react-icons/fa';
// import { IoIosArrowRoundBack } from 'react-icons/io';
// import {
// 	useCreateSubscriptionMutation,
// 	useDeleteSubscriptionMutation,
// 	useGetSubscriptionsQuery,
// 	useUpdateSubscriptionMutation
// } from './SubscriptionsApi';
//
// const mockBundles = [
// 	{
// 		label: "پلن یک ماهه",
// 		value: 1
// 	},
// 	{
// 		label: "پلن دو ماهه",
// 		value: 2
// 	},
// 	{
// 		label: "پلن سه ماهه",
// 		value: 3
// 	}
// ];
// const loadBundles = async () => {
// 	// const result = await axios.get("/bundle/subcategory/"); // TODO: Use bundle options endpoint (create if not exists)
// 	// const data = result?.data?.data || [];
// 	const data = mockBundles;
// 	const res = data.map((d) => {
// 		return { label: d.name, value: d.id };
// 	});
// 	console.log(res);
// 	return res;
// };
//
// function SubscriptionTable() {
// 	const handleCreate = async (vals) => {
// 		// setLoading(true);
// 		const data = _.clone(vals);
// 		// await createCategory(vals).unwrap();
// 		data.categoryStatus = vals.categoryStatus === "فعال" ? 1 : 2;
// 		await createCategory(data);
// 		// T0D0: HANDLE FIELD VALIDATION
// 		// const response = await createCategory(data);
// 		// return response && !response.error;
// 		return true;
// 		// setLoading(false);
// 		// alert(`Create: ${JSON.stringify(data)}`);
// 	};
// 	const createItemProps = {
// 		zodSchema: z.object({
// 			bundleId: z
// 				.number({
// 					required_error: "این فیلد الزامی است",
// 					invalid_type_error: "فرمت داده ورودی اشتباه است",
// 					message: 'مقدار انتخاب شده معتبر نیست'
// 				})
// 				.uniforms({
// 					displayName: "پلن",
// 					label: "پلن",
// 					placeholder: "پلن را انتخاب کنید",
// 					loadOptions: loadBundles,
// 					component: CustomUniformsAsyncSelect
// 				}),
// 			nameEn: z
// 				.string({
// 					invalid_type_error: "فرمت داده ورودی اشتباه است",
// 					required_error: 'این فیلد الزامی است'
// 				})
// 				.min(1, { message: 'این فیلد الزامی است' })
// 				.uniforms({
// 					displayName: "نام انگلیسی",
// 					label: "نام انگلیسی دسته‌بندی",
// 					placeholder: 'نام انگلیسی دسته‌بندی را وارد کنید'
// 				}),
// 			categoryStatus: z
// 				.enum(["فعال", "غیرفعال"], {
// 					required_error: "این فیلد الزامی است",
// 					invalid_type_error: "فرمت داده ورودی اشتباه است",
// 					message: 'مقدار انتخاب شده معتبر نیست'
// 				})
// 				.uniforms({
// 					displayName: "وضعیت دسته‌بندی",
// 					label: "وضعیت دسته‌بندی",
// 					placeholder: 'وضعیت دسته‌بندی را انتخاب کنید'
// 				}),
// 			pageOrder: z
// 				.number({
// 					invalid_type_error: "فرمت داده ورودی اشتباه است",
// 					required_error: 'این فیلد الزامی است'
// 				})
// 				.min(1, { message: 'حداقل مقدار برای این فیلد ۱ است' })
// 				.uniforms({
// 					displayName: "ترتیب صفحه",
// 					label: "ترتیب صفحه دسته‌بندی",
// 					placeholder: 'اولویت نمایش دسته‌بندی در سایت اصلی را انتخاب کنید'
// 				})
// 			// name: z
// 			// 	.string( { errorMap: () => ( { message: 'Name must be between 3 to 20 characters' } ) } )
// 			// 	.min( 3 )
// 			// 	.max( 20 )
// 		}),
// 		jsonSchema: {
// 			title: "دسته‌بندی",
// 			type: "object",
// 			properties: {
// 				name: {
// 					type: "string",
// 					title: "نام دسته‌بندی",
// 					message: { required: 'فیلد مساحت ساختمان الزامی است' }
// 				},
// 				nameEn: {
// 					type: "string",
// 					title: 'نام انگلیسی دسته‌بندی'
// 				},
// 				categoryStatus: {
// 					type: "string",
// 					title: "وضعیت دسته‌بندی",
// 					description: "وضعیت دسته‌بندی را انتخاب کنید",
// 					uniforms: {
// 						options: [
// 							{ label: 'فعال', value: '1' },
// 							{ label: 'غیرفعال', value: '2' }
// 						]
// 					}
// 				},
// 				pageOrder: {
// 					type: "number",
// 					title: "ترتیب صفحه",
// 					min: 1
// 				},
// 				profession: {
// 					type: "string",
// 					options: [
// 						{
// 							label: "Developer",
// 							value: 'developer'
// 						},
// 						{
// 							label: "Tester",
// 							value: 'tester'
// 						},
// 						{
// 							label: "Product owner",
// 							value: 'product-owner'
// 						},
// 						{
// 							label: "Project manager",
// 							value: 'project-manager'
// 						},
// 						{
// 							label: "Businessman",
// 							value: 'businessman'
// 						}
// 					]
// 				}
// 				// products: {
// 				// 	type: 'array',
// 				// 	title: 'محصولات و خدمات',
// 				// 	items: {
// 				// 		type: 'object',
// 				// 		properties: {
// 				// 			name: {
// 				// 				type: 'string',
// 				// 				title: 'نام محصول'
// 				// 			},
// 				// 			description: {
// 				// 				type: 'string',
// 				// 				title: 'توضیحات محصول'
// 				// 			},
// 				// 			// otherTypeName: {
// 				// 			// 	type: 'string',
// 				// 			// 	title: 'Other Type Name',
// 				// 			// 	description: 'If categoryType is something custom, store it here'
// 				// 			// },
// 				// 			categoryType: {
// 				// 				type: 'string',
// 				// 				title: 'دسته‌بندی محصول'
// 				// 			},
// 				// 			showProduct: {
// 				// 				type: 'boolean',
// 				// 				title: 'نمایش در صفحه اختصاصی؟'
// 				// 			},
// 				// 			pictures: {
// 				// 				type: 'array',
// 				// 				title: 'تصاویر',
// 				// 				items: {
// 				// 					type: 'object',
// 				// 					properties: {
// 				// 						url: {
// 				// 							type: 'string',
// 				// 							uniforms: { component: ImageField },
// 				// 							title: 'آدرس عکس آپلود شده'
// 				// 						},
// 				// 						description: { type: 'string', title: 'توضیحات عکس' }
// 				// 					}
// 				// 				}
// 				// 			}
// 				// 		}
// 				// 	}
// 				// }
// 			},
// 			required: ['name', 'nameEn', 'categoryStatus', 'pageOrder']
// 		},
// 		formHeaderTitle: "ثبت دسته‌بندی جدید",
// 		defaultValues: { name: '', nameEn: '', categoryStatus: '0', pageOrder: 0 },
// 		formEngine: "UNIFORMS",
// 		formValidationStruct: "ZOD_SCHEMA",
// 		formGenerationType: "MANUAL",
// 		hideSubmitField: false,
// 		formFieldsInputTypes: {
// 			name: {
// 				label: "نام",
// 				inputType: "TextField",
// 				renderCustomInput: false,
// 				classes: "mt-10",
// 				styles: null,
// 				props: {
// 					fullWidth: true
// 				}
// 			},
// 			nameEn: {
// 				label: "نام انگلیسی",
// 				inputType: "TextField",
// 				renderCustomInput: false,
// 				classes: "mt-10",
// 				styles: null,
// 				props: {
// 					fullWidth: true
// 				}
// 			},
// 			categoryStatus: {
// 				label: "وضعیت",
// 				inputType: "Select",
// 				renderCustomInput: false,
// 				classes: "mt-10",
// 				styles: null,
// 				options: [
// 					{
// 						label: "Developer",
// 						value: 'developer'
// 					},
// 					{
// 						label: "Tester",
// 						value: 'tester'
// 					},
// 					{
// 						label: "Product owner",
// 						value: 'product-owner'
// 					},
// 					{
// 						label: "Project manager",
// 						value: 'project-manager'
// 					},
// 					{
// 						label: "Businessman",
// 						value: 'businessman'
// 					}
// 				],
// 				props: {
// 					fullWidth: true
// 				}
// 			},
// 			// description: {
// 			// 	label: "توضیحات",
// 			// 	inputType: "TextField",
// 			// 	renderCustomInput: false,
// 			// 	classes: "mt-10",
// 			// 	styles: null,
// 			// 	props: {
// 			// 		fullWidth: true,
// 			// 	}
// 			// },
// 			pageOrder: {
// 				label: "ترتیب صفحه",
// 				inputType: "TextField",
// 				renderCustomInput: false,
// 				classes: "mt-10",
// 				styles: null,
// 				props: {
// 					fullWidth: true
// 				}
// 			}
// 		},
// 		onCreate: async (vals) => handleCreate(vals),
// 		buttonLabel: "ثبت اشتراک جدید",
// 		dialogTitle: 'ثبت اشتراک جدید'
// 	};
// 	const rowActions = [
// 		{
// 			icon: <FuseSvgIcon size={20}>heroicons-outline:x-circle</FuseSvgIcon>,
// 			label: "غیرفعال سازی",
// 			onClick: async (row, table, refetchList) => {
// 				alert(`Show sub-items for: ${row.original.name}`);
// 				refetchList();
// 			}
// 		},
// 		{
// 			icon: <FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>,
// 			label: "تمدید زمان",
// 			onClick: async (row, table, refetchList) => {
// 				alert(`Show sub-items for: ${row.original.name}`);
// 				refetchList();
// 			}
// 		}
// 		// 	{
// 		// 		icon: <PersonOffOutlined />,
// 		// 		label: 'غیرفعال کردن',
// 		// 		onClick: async (row, table, refetchList) => {
// 		// 			// call your disable API
// 		// 			alert(`Disable: ${row.original.name}`);
// 		// 			// e.g. await useDisableCategoryMutation(row.original.id);
// 		// 			refetchList();
// 		// 		}
// 		// 	}
// 	];
// 	//   {
// 	//     "id": 1,
// 	//     "userId": 9,
// 	//     "bundleId": 2,
// 	//     "bundleTitle": "اشتراک پلن پایه 500,000 تومان ماهیانه",
// 	//     "bundleFeatures": [
// 	//         "شامل یک سایت استاندارد ویژه.",
// 	//         " دسترسی به تمام ویژگی‌ها.",
// 	//         " پشتیبانی ۲۴ ساعته."
// 	//     ],
// 	//     "subCategoryId": 1,
// 	//     "subCategoryName": "بانک اطلاعات تولیدکنندگان محصولات غذایی",
// 	//     "subCategoryNameEn": "producers",
// 	//     "subscriptionStatus": "ACTIVE",
// 	//     "paidAmount": 18000,
// 	//     "discount": {
// 	//         "name": "BLACK FRIDAY",
// 	//         "percentage": 10,
// 	//         "timeLimit": null,
// 	//         "timeLimitType": null,
// 	//         "startDateTime": null,
// 	//         "expireDateTime": "2024-11-30T10:30:45.123",
// 	//         "startDateTimeFa": null,
// 	//         "expireDateTimeFa": null,
// 	//         "createdAtFa": null,
// 	//         "updatedAtFa": null,
// 	//         "bundles": null,
// 	//         "subcategories": null,
// 	//         "users": null
// 	//     },
// 	//     "startDate": "2024-11-29T13:08:49.018333",
// 	//     "endDate": "2025-11-29T13:08:49.018333",
// 	//     "startDateStr": "۹ آذر ۱۴۰۳",
// 	//     "endDateStr": "۸ آذر ۱۴۰۴"
// 	// }
// 	const columns = useMemo(
// 		() => [
// 			//   {
// 			//     accessorFn: (row) => row.featuredImageId,
// 			//     id: "featuredImageId",
// 			//     header: "لوگو شرکت",
// 			//     enableColumnFilter: false,
// 			//     enableColumnDragging: false,
// 			//     size: 150,
// 			//     enableSorting: false,
// 			//     Cell: ({ row }) => (
// 			//       <div className="flex items-center justify-center">
// 			//         {row.original?.logo ? (
// 			//           <img
// 			//             className="h-92 w-92 block rounded-full shadow-10 border"
// 			//             src={getServerFile(row.original.logo)}
// 			//             alt={row.original.companyName}
// 			//           />
// 			//         ) : (
// 			//           <img
// 			//             className="w-full max-h-40 max-w-40 block rounded"
// 			//             src="assets/images/apps/ecommerce/product-image-placeholder.png"
// 			//             alt={row.original.name}
// 			//           />
// 			//         )}
// 			//       </div>
// 			//     ),
// 			//   },
// 			{
// 				// accessorKey: "id",
// 				accessorFn: (row) => "FK_SUB_" + row?.id,
// 				header: "شناسه اشتراک",
// 				size: 160
// 			},
// 			{
// 				accessorKey: "userId",
// 				header: "شناسه کاربر",
// 				size: 200,
// 				Cell: ({ row }) => (
// 					<Typography
// 						component={Link}
// 						to={`/banks/food-industry/company/${row.original.id}`}
// 						className="underline"
// 						color="primary"
// 						role="button"
// 					>
// 						<div className="flex items-center justify-between space-x-2">
// 							<FaInfoCircle
// 								className="text-blue-500 me-11"
// 								size={20}
// 							/>
//
// 							<span>{row.original.userId}</span>
// 						</div>
// 					</Typography>
// 				)
// 			},
// 			//   {
// 			//     accessorKey: "bundleId",
// 			//     header: "شناسه پلن",
// 			//     size: 200,
// 			//     Cell: ({ row }) => (
// 			//       <Typography
// 			//         component={Link}
// 			//         to={`/banks/food-industry/company/${row.original.id}`}
// 			//         className="underline"
// 			//         color="primary"
// 			//         role="button"
// 			//       >
// 			//         <div className="flex items-center justify-between space-x-2">
// 			//           <FaInfoCircle className="text-blue-500 me-11" size={20} />
//
// 			//           <span>{row.original.bundleId}</span>
// 			//         </div>
// 			//       </Typography>
// 			//     ),
// 			//   },
// 			{
// 				accessorKey: "bundleTitle",
// 				header: "پلن خریداری شده",
// 				size: 300
// 			},
// 			{
// 				accessorKey: "subCategoryName",
// 				header: "زیرشاخه پلن",
// 				size: 400,
// 				Cell: ({ row }) => (
// 					<div>
// 						<p>{row.original.subCategoryName}</p>
// 						<Button
// 							className="font-400 group self-end text-sm"
// 							variant="contained"
// 							color="primary"
// 							to="/apps/settings/subscription/food/1"
// 							// to={`/apps/academy/courses/${course.id}/${course.slug}`}
// 							component={Link}
// 						>
// 							<IoIosArrowRoundBack
// 								size={30}
// 								className="group-hover:-translate-x-3 transition-all"
// 							/>
// 							{`${row.original.subCategoryNameEn} رفتن به صفحه ` + ` `}
// 						</Button>
// 					</div>
// 				),
// 				accessorFn: (row) => `${row.subCategoryName} - ${row.subCategoryNameEn}`
// 			},
// 			{
// 				accessorKey: "bundlePrice",
// 				header: "هزینه پلن",
// 				size: 150
// 			},
// 			{
// 				accessorKey: "discount",
// 				header: "کد تخفیف",
// 				size: 150,
// 				Cell: ({ row }) =>
// 					row.original.discount ? (
// 						<div>
// 							<p>{`تخفیف ${row.original.discount.percentage} درصدی`}</p>
// 							<p>{`${row.original.discount.name}`}</p>
// 						</div>
// 					) : (
// 						<span>اعمال نشده</span>
// 					)
// 			},
// 			{
// 				accessorKey: "paidAmount",
// 				header: "هزینه پرداختی",
// 				size: 150
// 			},
// 			{
// 				header: "وضعیت",
// 				accessorKey: "subscriptionStatus",
// 				editVariant: "select",
// 				size: 130,
// 				// editSelectOptions: categoryStatusSelectOptions,
// 				// eslint-disable-next-line react/no-unstable-nested-components
// 				accessorFn: (row) =>
// 					(row?.subscriptionStatus === "ACTIVE" && (
// 						<EntityStatusField
// 							name="فعال"
// 							colorClsx="bg-green text-white"
// 						/>
// 					)) ||
// 					(row?.subscriptionStatus === "PENDING" && (
// 						<EntityStatusField
// 							name="در انتظار تایید"
// 							colorClsx="bg-orange-700 text-white"
// 						/>
// 					)) || (
// 						<EntityStatusField
// 							name="غیرفعال"
// 							colorClsx="bg-red-700 text-white"
// 						/>
// 					)
// 			},
// 			{
// 				accessorKey: "startDateStr",
// 				size: 150,
// 				Cell: ({ row }) => <div dir="rtl">{row.original.startDateStr}</div>,
// 				header: "تاریخ شروع",
// 				enableEditing: false
// 			},
// 			{
// 				accessorKey: "endDateStr",
// 				size: 150,
// 				Cell: ({ row }) => <div dir="rtl">{row.original.endDateStr}</div>,
// 				header: "تاریخ پایان",
// 				enableEditing: false
// 			}
// 		],
// 		[]
// 	);
// 	return (
// 		<div className="w-full max-w-screen flex flex-col">
// 			<FuseScrollbars className="grow overflow-x-auto">
// 				<Paper
// 					className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-screen"
// 					elevation={0}
// 				>
// 					<GenericCrudTable
// 						columns={columns}
// 						useListQueryHook={useGetSubscriptionsQuery}
// 						useCreateMutationHook={useCreateSubscriptionMutation}
// 						useUpdateMutationHook={useUpdateSubscriptionMutation}
// 						useDeleteMutationHook={useDeleteSubscriptionMutation}
// 						rowActions={rowActions}
// 						createItemProps={createItemProps}
// 						renderTopToolbarCustomActionsClasses="flex justify-start px-8 py-16"
// 						// isSubmitting={loading}
// 						saveToStore={false}
// 						enableRowAction
// 						enableBuiltInEditing={false}
// 						serviceIdentifier="subscriptionList"
// 						renderTopToolbarCustomActions={() => (
// 							<></>
// 							//   <Button
// 							//     color="primary"
// 							//     className="p-16"
// 							//     variant="contained"
// 							//     // onClick={() => {
// 							//     // 	table.setCreatingRow(true); // simplest way to open the create row modal with no default values
// 							//     // 	// or you can pass in a row object to set default values with the `createRow` helper function
// 							//     // 	// table.setCreatingRow(
// 							//     // 	//   createRow(table, {
// 							//     // 	//     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
// 							//     // 	//   }),
// 							//     // 	// );
// 							//     // }}
// 							//   >
// 							//     Create New User
// 							//   </Button>
// 						)}
// 					/>
// 				</Paper>
// 			</FuseScrollbars>
// 		</div>
// 	);
// }
//
// export default SubscriptionTable;


import FuseScrollbars from "@fuse/core/FuseScrollbars/index.js";
import { Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button as MuiButton } from "@mui/material";
import Typography from "@mui/material/Typography";
import EntityStatusField from "app/shared-components/data-table/EntityStatusField.jsx";
import GenericCrudTable from "app/shared-components/data-table/GenericCrudTable.jsx";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CustomUniformsAsyncSelect from 'app/shared-components/dynamic-field-generator/CustomUniformsAsyncSelect';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { z } from 'zod';
import { FaInfoCircle, FaCheck, FaTimes, FaClock, FaUserSlash } from 'react-icons/fa';
import { IoIosArrowRoundBack } from 'react-icons/io';
import {
	useCreateSubscriptionMutation,
	useDeleteSubscriptionMutation,
	useGetSubscriptionsQuery,
	useUpdateSubscriptionMutation,
	useAcceptOrDenySubscriptionMutation,
	useDisableSubscriptionMutation,
	useExtendSubscriptionMutation, useEnableSubscriptionMutation
} from './SubscriptionsApi';
import {useAppDispatch} from "app/store/hooks.js";

const mockBundles = [
	{
		label: "پلن یک ماهه",
		value: 1
	},
	{
		label: "پلن دو ماهه",
		value: 2
	},
	{
		label: "پلن سه ماهه",
		value: 3
	}
];

const loadBundles = async () => {
	const data = mockBundles;
	return data.map((d) => ({
		label: d.label,
		value: d.value
	}));
};

function SubscriptionTable() {
	const [createSubscription] = useCreateSubscriptionMutation();
	const [enableSubscription] = useEnableSubscriptionMutation();
	const [disableSubscription] = useDisableSubscriptionMutation();
	const [extendSubscription] = useExtendSubscriptionMutation();
	const dispatch = useAppDispatch();
	// Dialog states
	const [extendDialog, setExtendDialog] = useState({ open: false, subscription: null, months: 1 });
	const [statusDialog, setStatusDialog] = useState({ open: false, subscription: null, status: null });

	const handleCreate = async (vals) => {
		try {
			const data = {
				bundleId: vals.bundleId,
				discountId: vals.discountId || null
			};
			await createSubscription(data).unwrap();
			return true;
		} catch (error) {
			console.error('Error creating subscription:', error);
			return false;
		}
	};

	const handleAcceptSubscription = async (subscriptionId) => {
		try {
			await enableSubscription(subscriptionId).unwrap();
			dispatch(showMessage({ message: 'اشتراک با موفقیت تایید شد' }));
		} catch (error) {
			console.error('Error accepting subscription:', error);
			dispatch(showMessage({ message: 'خطا در تایید اشتراک' }));
		}
	};

	const handleDenySubscription = async (subscriptionId) => {
		try {
			await disableSubscription(subscriptionId).unwrap();
			dispatch(showMessage({ message: 'اشتراک با موفقیت رد شد' }));
		} catch (error) {
			console.error('Error denying subscription:', error);
			dispatch(showMessage({ message: 'خطا در رد اشتراک' }));
		}
	};

	const handleDisableSubscription = async (subscriptionId) => {
		try {
			await disableSubscription(subscriptionId).unwrap();
			dispatch(showMessage({ message: 'اشتراک با موفقیت غیرفعال شد' }));
		} catch (error) {
			console.error('Error disabling subscription:', error);
			dispatch(showMessage({ message: 'خطا در غیرفعال کردن اشتراک' }));
		}
	};

	const handleExtendSubscription = async () => {
		try {
			await extendSubscription({
				id: extendDialog.subscription.id,
				monthsToExtend: extendDialog.months,
				reason: 'تمدید توسط ادمین'
			}).unwrap();
			setExtendDialog({ open: false, subscription: null, months: 1 });
			dispatch(showMessage({ message: 'اشتراک با موفقیت تمدید شد' }));
		} catch (error) {
			console.error('Error extending subscription:', error);
			dispatch(showMessage({ message: 'خطا در تمدید اشتراک' }));
		}
	};

	const createItemProps = {
		zodSchema: z.object({
			bundleId: z
				.number({
					required_error: "این فیلد الزامی است",
					invalid_type_error: "فرمت داده ورودی اشتباه است",
				})
				.uniforms({
					displayName: "پلن",
					label: "پلن",
					placeholder: "پلن را انتخاب کنید",
					loadOptions: loadBundles,
					component: CustomUniformsAsyncSelect
				}),
			discountId: z
				.string()
				.optional()
				.uniforms({
					displayName: "کد تخفیف",
					label: "کد تخفیف (اختیاری)",
					placeholder: "کد تخفیف را وارد کنید"
				})
		}),
		jsonSchema: {
			title: "اشتراک",
			type: "object",
			properties: {
				bundleId: {
					type: "number",
					title: "پلن",
				},
				discountId: {
					type: "string",
					title: "کد تخفیف"
				}
			},
			required: ['bundleId']
		},
		formHeaderTitle: "ثبت اشتراک جدید",
		defaultValues: { bundleId: null, discountId: '' },
		formEngine: "UNIFORMS",
		formValidationStruct: "ZOD_SCHEMA",
		formGenerationType: "MANUAL",
		hideSubmitField: false,
		formFieldsInputTypes: {
			bundleId: {
				label: "پلن",
				inputType: "Select",
				renderCustomInput: false,
				classes: "mt-10",
				props: { fullWidth: true }
			},
			discountId: {
				label: "کد تخفیف",
				inputType: "TextField",
				renderCustomInput: false,
				classes: "mt-10",
				props: { fullWidth: true }
			}
		},
		onCreate: handleCreate,
		buttonLabel: "ثبت اشتراک جدید",
		dialogTitle: 'ثبت اشتراک جدید'
	};

	// const rowActions = [
	// 	{
	// 		icon: <FaCheck size={16} color="green" />,
	// 		label: "تایید اشتراک",
	// 		onClick: async (row, table, refetchList) => {
	// 			if (row.original.subscriptionStatus === 'PENDING') {
	// 				await handleAcceptSubscription(row.original.id);
	// 				refetchList();
	// 			} else {
	// 				dispatch(showMessage({ message: 'فقط اشتراک‌های در انتظار قابل تایید هستند' }));
	// 			}
	// 		},
	// 		show: (row) => row.original.subscriptionStatus === 'PENDING'
	// 	},
	// 	{
	// 		icon: <FaTimes size={16} color="red" />,
	// 		label: "رد اشتراک",
	// 		onClick: async (row, table, refetchList) => {
	// 			if (row.original.subscriptionStatus === 'PENDING') {
	// 				await handleDenySubscription(row.original.id);
	// 				refetchList();
	// 			} else {
	// 				dispatch(showMessage({ message: 'فقط اشتراک‌های در انتظار قابل رد هستند' }));
	// 			}
	// 		},
	// 		show: (row) => row.original.subscriptionStatus === 'PENDING'
	// 	},
	// 	{
	// 		icon: <FaClock size={16} color="blue" />,
	// 		label: "تمدید زمان",
	// 		onClick: async (row, table, refetchList) => {
	// 			if (row.original.subscriptionStatus === 'ACTIVE') {
	// 				setExtendDialog({ open: true, subscription: row.original, months: 1 });
	// 			} else {
	// 				dispatch(showMessage({ message: 'فقط اشتراک‌های فعال قابل تمدید هستند' }));
	// 			}
	// 		},
	// 		show: (row) => row.original.subscriptionStatus === 'ACTIVE'
	// 	},
	// 	{
	// 		icon: <FaUserSlash size={16} color="orange" />,
	// 		label: "غیرفعال سازی",
	// 		onClick: async (row, table, refetchList) => {
	// 			if (row.original.subscriptionStatus === 'ACTIVE') {
	// 				if (confirm('آیا از غیرفعال کردن این اشتراک اطمینان دارید؟')) {
	// 					await handleDisableSubscription(row.original.id);
	// 					refetchList();
	// 				}
	// 			} else {
	// 				dispatch(showMessage({ message: 'فقط اشتراک‌های فعال قابل غیرفعال کردن هستند' }));
	// 			}
	// 		},
	// 		show: (row) => row.original.subscriptionStatus === 'ACTIVE'
	// 	}
	// ];
	const rowActions = ({ row, table, refetchList }) => {
		const status = row?.original?.subscriptionStatus;
		const id = row?.original?.id;

		const actions = [];

		// 1) Accept/Deny — only when PENDING
		if (status === 'PENDING') {
			actions.push({
				icon: <FaCheck size={16} color="green" />,
				label: 'تایید اشتراک',
				onClick: async () => {
					await handleAcceptSubscription(id);
					refetchList();
				},
			});
			actions.push({
				icon: <FaTimes size={16} color="red" />,
				label: 'رد اشتراک',
				onClick: async () => {
					await handleDenySubscription(id);
					refetchList();
				},
			});
		}

		// 2) Extend — only when ACTIVE or EXPIRED
		if (status === 'ACTIVE' || status === 'EXPIRED') {
			actions.push({
				icon: <FaClock size={16} />,
				label: 'تمدید زمان',
				onClick: () =>
					setExtendDialog({ open: true, subscription: row.original, months: 1 }),
			});
		}

		// 3) Toggle active/inactive — split into two actions with static labels
		if (status === 'ACTIVE') {
			actions.push({
				icon: <FaUserSlash size={16} color="orange" />,
				label: 'غیرفعال سازی',
				onClick: async () => {
					if (confirm('آیا از غیرفعال کردن این اشتراک اطمینان دارید؟')) {
						await handleDisableSubscription(id);
						refetchList();
					}
				},
			});
		} else if (status === 'INACTIVE' || status === 'DISABLE') {
			actions.push({
				icon: <FaUserSlash size={16} color="orange" />,
				label: 'فعال سازی',
				onClick: async () => {
					if (confirm('آیا از فعال کردن این اشتراک اطمینان دارید؟')) {
						await handleAcceptSubscription(id);
						refetchList();
					}
				},
			});
		}

		return actions;
	};


	const columns = useMemo(
		() => [
			{
				accessorFn: (row) => "FK_SUB_" + row?.id,
				accessorKey: "id",
				header: "شناسه اشتراک",
				size: 160
			},
			{
				accessorKey: "userInfo",
				header: "شناسه کاربر",
				size: 200,
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/users/${row.original.userId}`}
						className="underline"
						color="primary"
						role="button"
					>
						<div className="flex items-center justify-between space-x-2">
							<FaInfoCircle
								className="text-blue-500 me-11"
								size={20}
							/>
							<span>{row.original.userId}</span>
						</div>
					</Typography>
				)
			},
			{
				accessorKey: "bundleTitle",
				header: "پلن خریداری شده",
				size: 300
			},
			{
				accessorKey: "subCategoryName",
				header: "زیرشاخه پلن",
				size: 400,
				Cell: ({ row }) => (
					<div>
						<p>{row.original.subCategoryName}</p>
						{/*<Button*/}
						{/*	className="font-400 group self-end text-sm"*/}
						{/*	variant="contained"*/}
						{/*	color="primary"*/}
						{/*	to={`/apps/settings/subscription/food/${row.original.subCategoryId}`}*/}
						{/*	component={Link}*/}
						{/*>*/}
						{/*	<IoIosArrowRoundBack*/}
						{/*		size={30}*/}
						{/*		className="group-hover:-translate-x-3 transition-all"*/}
						{/*	/>*/}
						{/*	{`رفتن به صفحه ${row.original.subCategoryNameEn}`}*/}
						{/*</Button>*/}
					</div>
				),
				accessorFn: (row) => `${row.subCategoryName} - ${row.subCategoryNameEn}`
			},
			{
				accessorKey: "bundlePrice",
				header: "هزینه پلن",
				size: 150,
				Cell: ({ row }) => (
					<span>{row.original.bundlePrice?.toLocaleString()} تومان</span>
				)
			},
			{
				accessorKey: "discount",
				header: "کد تخفیف",
				size: 150,
				Cell: ({ row }) =>
					row.original.discount ? (
						<div>
							<p>{`تخفیف ${row.original.discount.percentage} درصدی`}</p>
							<p>{`${row.original.discount.name}`}</p>
						</div>
					) : (
						<span>اعمال نشده</span>
					)
			},
			{
				accessorKey: "paidAmount",
				header: "هزینه پرداختی",
				size: 150,
				Cell: ({ row }) => (
					<span>{row.original.paidAmount?.toLocaleString()} تومان</span>
				)
			},
			{
				header: "وضعیت",
				accessorKey: "subscriptionStatus",
				size: 130,
				accessorFn: (row) => {
					switch (row?.subscriptionStatus) {
						case "ACTIVE":
							return <EntityStatusField name="فعال" colorClsx="bg-green text-white" />;
						case "PENDING":
							return <EntityStatusField name="در انتظار تایید" colorClsx="bg-orange-700 text-white" />;
						case "INACTIVE":
							return <EntityStatusField name="غیرفعال" colorClsx="bg-red-700 text-white" />;
						case "DISABLE":
							return <EntityStatusField name="غیرفعال" colorClsx="bg-gray-800 text-white" />;
						default:
							return <EntityStatusField name="نامشخص" colorClsx="bg-gray-500 text-white" />;
					}
				}
			},
			{
				accessorKey: "startDateStr",
				size: 150,
				Cell: ({ row }) => <div dir="rtl">{row.original.startDateStr}</div>,
				header: "تاریخ شروع",
				enableEditing: false
			},
			{
				accessorKey: "endDateStr",
				size: 150,
				Cell: ({ row }) => <div dir="rtl">{row.original.endDateStr}</div>,
				header: "تاریخ پایان",
				enableEditing: false
			}
		],
		[]
	);

	return (
		<div className="w-full flex flex-col h-full">
			<Paper
				className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full"
				elevation={0}
			>
				<GenericCrudTable
					columns={columns}
					useListQueryHook={useGetSubscriptionsQuery}
					useCreateMutationHook={useCreateSubscriptionMutation}
					useUpdateMutationHook={useUpdateSubscriptionMutation}
					useDeleteMutationHook={useDeleteSubscriptionMutation}
					rowActions={rowActions}
					createItemProps={null}
					renderTopToolbarCustomActionsClasses="flex justify-start px-8 py-16"
					saveToStore={false}
					enableRowAction
					enableBuiltInEditing={false}
					serviceIdentifier="subscriptionList"
					renderTopToolbarCustomActions={() => (<></>)}
				/>
			</Paper>

			{/* Extend Subscription Dialog */}
			<Dialog
				open={extendDialog.open}
				onClose={() => setExtendDialog({ open: false, subscription: null, months: 1 })}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						minWidth: '600px',
						minHeight: '300px'
					}
				}}
			>
				<DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
					تمدید اشتراک
				</DialogTitle>
				<DialogContent sx={{ padding: '24px' }}>
					{extendDialog.subscription && (
						<div className="mb-4">
							<Typography variant="body1" className="mb-2">
								<strong>اشتراک:</strong> {extendDialog.subscription.bundleTitle}
							</Typography>
							<Typography variant="body1" className="mb-2">
								<strong>کاربر:</strong> {extendDialog.subscription.userId}
							</Typography>
							<Typography variant="body1" className="mb-4">
								<strong>تاریخ پایان فعلی:</strong> {extendDialog.subscription.endDateStr}
							</Typography>
						</div>
					)}
					<TextField
						autoFocus
						margin="dense"
						label="تعداد ماه برای تمدید"
						type="number"
						fullWidth
						variant="outlined"
						value={extendDialog.months}
						onChange={(e) => setExtendDialog(prev => ({ ...prev, months: parseInt(e.target.value) || 1 }))}
						inputProps={{ min: 1, max: 12 }}
						sx={{ marginTop: '16px' }}
					/>
				</DialogContent>
				<DialogActions sx={{ padding: '16px 24px' }}>
					<MuiButton
						onClick={() => setExtendDialog({ open: false, subscription: null, months: 1 })}
						variant="outlined"
						size="large"
					>
						انصراف
					</MuiButton>
					<MuiButton
						onClick={handleExtendSubscription}
						variant="contained"
						size="large"
						sx={{ marginLeft: '8px' }}
					>
						تمدید
					</MuiButton>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default SubscriptionTable;