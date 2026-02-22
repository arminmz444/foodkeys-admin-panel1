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
		} else if (status === 'DISABLE') {
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
				header: "اطلاعات کاربر",
				size: 250,
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/apps/users/${row.original.userId}`}
						className="no-underline"
						role="button"
					>
						<div className="flex items-center gap-10 px-4 py-6 rounded-lg hover:bg-grey-100 transition-colors">
							<div className="flex items-center justify-center w-36 h-36 rounded-full bg-blue-50 shrink-0">
								<FaInfoCircle className="text-blue-500" size={18} />
							</div>
							<div className="flex flex-col min-w-0">
								<span className="font-semibold text-sm text-grey-900 truncate">
									{row.original.userFullName || '—'}
								</span>
								<span className="text-xs text-grey-500 truncate" dir="ltr">
									{row.original.username || '—'}
								</span>
								<span className="text-[10px] text-grey-400">
									#{row.original.userId}
								</span>
							</div>
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
				size: 160,
				filterVariant: "select",
				filterSelectOptions: [
					{ label: "فعال", value: "ACTIVE" },
					{ label: "در انتظار تایید", value: "PENDING" },
					// { label: "غیرفعال", value: "INACTIVE" },
					{ label: "غیرفعال", value: "DISABLE" },
					{ label: "منقضی شده", value: "EXPIRED" },
				],
				Cell: ({ row }) => {
					switch (row.original?.subscriptionStatus) {
						case "ACTIVE":
							return <EntityStatusField name="فعال" colorClsx="bg-green text-white" />;
						case "PENDING":
							return <EntityStatusField name="در انتظار تایید" colorClsx="bg-orange-700 text-white" />;
						// case "INACTIVE":
							// return <EntityStatusField name="غیرفعال" colorClsx="bg-red-700 text-white" />;
						case "DISABLE":
							return <EntityStatusField name="غیرفعال" colorClsx="bg-gray-800 text-white" />;
						case "EXPIRED":
							return <EntityStatusField name="منقضی شده" colorClsx="bg-purple-700 text-white" />;
						default:
							return <EntityStatusField name="نامشخص" colorClsx="bg-gray-500 text-white" />;
					}
				}
			},
			{
				accessorFn: (row) => row.startDate ? new Date(row.startDate) : null,
				id: "startDate",
				size: 180,
				Cell: ({ row }) => <div dir="rtl">{row.original.startDateStr}</div>,
				header: "تاریخ شروع",
				enableEditing: false,
				filterVariant: "date",
				muiFilterDatePickerProps: {
					slotProps: {
						textField: { size: "small", variant: "outlined" },
					},
				},
			},
			{
				accessorFn: (row) => row.endDate ? new Date(row.endDate) : null,
				id: "endDate",
				size: 180,
				Cell: ({ row }) => <div dir="rtl">{row.original.endDateStr}</div>,
				header: "تاریخ پایان",
				enableEditing: false,
				filterVariant: "date",
				muiFilterDatePickerProps: {
					slotProps: {
						textField: { size: "small", variant: "outlined" },
					},
				},
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
					transformColumnFilters={(columnFilters) =>
						columnFilters.map((filter) => {
							const { id, value } = filter;
							if (value instanceof Date) {
								return `${id}:EQUALS:${value.toISOString()}`;
							}
							if (Array.isArray(value)) {
								if (value.length === 2 && value[0] instanceof Date) {
									return `${id}:BETWEEN:${value[0].toISOString()},${value[1]?.toISOString() || ''}`;
								}
								return `${id}:IN:${value.join(',')}`;
							}
							return `${id}:EQUALS:${value}`;
						})
					}
					serviceIdentifier="subscriptionList"
					renderTopToolbarCustomActions={() => (<div />)}
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