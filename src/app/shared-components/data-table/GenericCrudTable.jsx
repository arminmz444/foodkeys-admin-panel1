import {
	MaterialReactTable,
	MRT_ActionMenuItem,
	MRT_EditActionButtons,
	useMaterialReactTable,
} from "material-react-table";
import _ from "lodash";
import {useMemo, useEffect, useState, useCallback, isValidElement, cloneElement} from "react";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { MRT_Localization_FA } from "material-react-table/locales/fa";
import Divider from "@mui/material/Divider";

import { useDispatch } from "react-redux";
import DataTableBottomToolbar from "app/shared-components/data-table/DataTableBottomToolbar.jsx";

import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Typography from "@mui/material/Typography";
import DynamicFormGenerator from "app/shared-components/dynamic-field-generator/DynamicFormGenerator.jsx";
import Box from "@mui/system/Box";
import {
	closeDialog,
	openDialog,
} from "@fuse/core/FuseDialog/fuseDialogSlice.js";
import DialogContentText from "@mui/material/DialogContentText";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import DataTableTopToolbar from "./DataTableTopToolbar";

const tableIcons = {
	ArrowDownwardIcon: (props) => (
		<FuseSvgIcon size={20} {...props}>
			heroicons-outline:arrow-down
		</FuseSvgIcon>
	),
	ClearAllIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:menu-alt-3</FuseSvgIcon>
	),
	DensityLargeIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:menu-alt-4</FuseSvgIcon>
	),
	DensityMediumIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:menu</FuseSvgIcon>
	),
	DensitySmallIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:view-list</FuseSvgIcon>
	),
	DragHandleIcon: () => (
		<FuseSvgIcon className="rotate-45 text-white" size={16}>
			heroicons-outline:arrows-expand
		</FuseSvgIcon>
	),
	FilterListIcon: (props) => (
		<FuseSvgIcon size={16} {...props}>
			heroicons-outline:filter
		</FuseSvgIcon>
	),
	FilterListOffIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:filter</FuseSvgIcon>
	),
	FullscreenExitIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:arrows-expand</FuseSvgIcon>
	),
	FullscreenIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:arrows-expand</FuseSvgIcon>
	),
	SearchIcon: (props) => (
		<FuseSvgIcon color="action" size={20} {...props}>
			heroicons-outline:search
		</FuseSvgIcon>
	),
	SearchOffIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:search</FuseSvgIcon>
	),
	ViewColumnIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:view-boards</FuseSvgIcon>
	),
	MoreVertIcon: () => (
		<FuseSvgIcon className="text-white" size={20}>
			heroicons-outline:dots-vertical
		</FuseSvgIcon>
	),
	MoreHorizIcon: () => (
		<FuseSvgIcon size={20} className="text-white">
			heroicons-outline:dots-horizontal
		</FuseSvgIcon>
	),
	SortIcon: (props) => (
		<FuseSvgIcon size={20} {...props}>
			heroicons-outline:sort-ascending
		</FuseSvgIcon>
	),
	PushPinIcon: (props) => (
		<FuseSvgIcon size={20} {...props}>
			heroicons-outline:thumb-tack
		</FuseSvgIcon>
	),
	VisibilityOffIcon: () => (
		<FuseSvgIcon size={20}>heroicons-outline:eye-off</FuseSvgIcon>
	),
};

const defaultTransformColumnFilters = (columnFilters) => {
	return columnFilters.map(filter => {
		const { id, value } = filter;
		if (Array.isArray(value)) {
			if (value.length === 2 && typeof value[0] === 'number') {
				return `${id}:BETWEEN:${value[0]},${value[1]}`;
			} else {
				return `${id}:IN:${value.join(',')}`;
			}
		} else if (typeof value === 'boolean') {
			return `${id}:EQUALS:${value}`;
		} else if (value && value.includes('%')) {
			return `${id}:LIKE:${value}`;
		}
		return `${id}:EQUALS:${value}`;
	});
};

function GenericCrudTable(props) {
	const [paginationState, setPaginationState] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const {
		columns,
		data,
		useListQueryHook,
		useCreateMutationHook,
		useUpdateMutationHook,
		useDeleteMutationHook,
		useDisableMutationHook,
		useSubCategoriesQueryHook,
		rowActions = [],
		renderTopToolbarCustomActions: RenderTopToolbarCustomActions,
		renderTopToolbarCustomActionsClasses,
		createItemProps = null,
		tableTitle = null,
		OperationsSection = null,
		saveToStore,
		storeDataAction,
		isSubmitting = false,
		enableRowActions = true,
		enableRowSelection = false,
		editItemProps = null,
		enableBuiltInEditing = true,
		transformColumnFilters,
		globalFilterColumns,
		// serviceIdentifier = "",
		// requiredQueryParams,
		// requiredPathVariables,
		...rest
	} = props;

	const dispatch = useDispatch();

	const [columnFilters, setColumnFilters] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState([]);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingRow, setEditingRow] = useState(null);
	const [showGlobalFilter, setShowGlobalFilter] = useState(true);
	const [searchValue, setSearchValue] = useState("");

	// Transform column filters using custom transformer or default
	const transformedFilters = useMemo(() => {
		const transformer = transformColumnFilters || defaultTransformColumnFilters;
		return transformer(columnFilters);
	}, [columnFilters, transformColumnFilters]);
	// const handleGlobalFilterChange = useCallback(
	// 	(val) => setGlobalFilter(val),
	// 	[]
	// 	// setGlobalFilter(val),
	// 	// _.debounce((val) => setGlobalFilter(val), 500),
	// 	// []
	// );
	const debouncedGlobalFilter = useMemo(
		() =>
			_.debounce((val) => {
				setGlobalFilter(val);
			}, 500),
		[]
	);

	const handleGlobalFilterChange = useCallback(
		(e) => {
			debouncedGlobalFilter(e);
		},
		[debouncedGlobalFilter]
	);

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [subCategoriesDialogOpen, setSubCategoriesDialogOpen] = useState(false);
	const [selectedCategoryForSubs, setSelectedCategoryForSubs] = useState(null);
	const [subCategoriesData, setSubCategoriesData] = useState([]);

	let finalData = data || [];
	let isFetchingData = false;
	let isErrorFetchingData = false;
	let fetchError = null;

	const rtkQueryResult =
		useListQueryHook?.({
			pageNumber: paginationState.pageIndex + 1,
			pageSize: paginationState.pageSize,
			search: globalFilter,
			sort: sorting,
			filter: transformedFilters,
			globalFilterColumns,
			// serviceIdentifier,
			// requiredQueryParams,
			// requiredPathVariables
		}) || {};

	const {
		data: rtkData,
		isLoading: rtkIsLoading,
		isFetching: rtkIsFetching,
		isError: rtkIsError,
		error: rtkError,
		refetch: refetchList,
	} = rtkQueryResult;

	if (useListQueryHook) {
		finalData = rtkData?.data || [];
		isFetchingData = rtkIsLoading || rtkIsFetching;
		isErrorFetchingData = rtkIsError;
		fetchError = rtkError;
	}

	useEffect(() => {
		if (saveToStore && storeDataAction && finalData?.length) {
			dispatch(storeDataAction(finalData));
		}
	}, [finalData, saveToStore, storeDataAction, dispatch]);

	const [createMutation] = useCreateMutationHook?.() || [];
	const [updateMutation] = useUpdateMutationHook?.() || [];
	const [deleteMutation] = useDeleteMutationHook?.() || [];
	const [disableMutation] = useDisableMutationHook?.() || [];
	const handleDisableCategory = async (row) => {
		try {
			await disableMutation(row?.original?.id).unwrap();
			refetchList?.();
		} catch (err) {
			console.error("Disable category error", err);
		}
	};
	const handleShowSubCategories = async (row) => {
		setSelectedCategoryForSubs(row.original);
		setSubCategoriesDialogOpen(true);

		if (useSubCategoriesQueryHook) {
			try {
				const subsResult = await useSubCategoriesQueryHook(
					row.original.id
				).unwrap();
				setSubCategoriesData(subsResult || []);
			} catch (err) {
				console.error("Load subcategories error", err);
			}
		}
	};

	let createItemForm;

	if (createItemProps?.zodSchema) {
		const { zodSchema, defaultValues, onCreate } = createItemProps;
		createItemForm = useForm({
			resolver: zodResolver(zodSchema),
			defaultValues: defaultValues || {},
		});
	}
	let editItemForm;
	if (editItemProps?.zodSchema) {
		const { zodSchema } = editItemProps;
		editItemForm = useForm({ resolver: zodResolver(zodSchema) });
	}

	const openEditDialog = (row) => {
		setEditingRow(row);
		if (editItemForm && editItemProps?.getDefaultValues) {
			editItemForm.reset(editItemProps.getDefaultValues(row.original));
		} else if (editItemForm) {
			editItemForm.reset(row.original);
		}
		setEditDialogOpen(true);
	};
	const closeEditDialog = () => {
		setEditDialogOpen(false);
		setEditingRow(null);
	};
	const handleEditSubmit = async (vals) => {
		try {
			const payload = { ...vals, id: editingRow.original.id };
			if (editItemProps?.onUpdate) {
				await editItemProps.onUpdate(payload);
			} else {
				await updateMutation(payload).unwrap();
			}
			closeEditDialog();
			refetchList?.();
		} catch (err) {
			console.error("Update item error", err);
		}
	};

	const openCreateDialog = () => {
		if (createItemForm && createItemProps?.defaultValues) {
			createItemForm.reset(createItemProps.defaultValues);
		}

		setCreateDialogOpen(true);
	};
	const closeCreateDialog = () => {
		setCreateDialogOpen(false);
	};
	const handleCreateSubmit = async (vals) => {
		try {
			if (createItemProps?.onCreate) {
				await createItemProps.onCreate(vals);
			} else {
				await createMutation(vals).unwrap();
			}

			closeCreateDialog();
			refetchList?.();
		} catch (err) {
			console.error("Create item error", err);
		}
	};

	const rowActionMenuItems = ({ closeMenu, row, table }) => {
		const defaultItems = [
			// <Divider key="divider-1" />,
			// <MRT_ActionMenuItem
			// 	icon={<Email />}
			// 	key="action-send-email"
			// 	label="ارسال ایمیل"
			// 	onClick={() => {
			// 		closeMenu();
			// 		// example usage of update or something
			// 		// updateMutation?.(row?.original);
			// 	}}
			// 	table={table}
			// />,
			// <MRT_ActionMenuItem
			// 	icon={<PersonOffOutlined />}
			// 	key="action-block"
			// 	label="غیرفعال کردن"
			// 	onClick={async () => {
			// 		closeMenu();
			// 		// no direct logic => user can pass rowActions that do "disable"
			// 	}}
			// 	table={table}
			// />
			...(editItemProps && !enableBuiltInEditing
				? [
					<MRT_ActionMenuItem
						key="action-edit"
						icon={<FuseSvgIcon size={20}>heroicons-outline:pencil</FuseSvgIcon>}
						label="ویرایش"
						onClick={() => {
							closeMenu();
							openEditDialog(row);
						}}
						table={table}
					/>,
				]
				: [])
		];

		let resolved;
		if (typeof rowActions === 'function') {
			resolved = rowActions({ row, table, refetchList }) || [];
		} else if (Array.isArray(rowActions)) {
			resolved = rowActions;
		} else {
			resolved = [];
		}

		const visible = resolved.filter((a) => {
			if (!a) return false;
			if (typeof a.show === 'function') return a.show(row, table);
			if (typeof a.show === 'boolean') return a.show;
			return true;
		});

		const userActionItems = visible.map((action, idx) => {
			if (isValidElement(action)) {
				return cloneElement(action, { key: action.key ?? `rowAction-${idx}` });
			}

			const label =
				typeof action.label === 'function' ? action.label(row, table) : action.label;
			const icon =
				typeof action.icon === 'function' ? action.icon(row, table) : action.icon;

			return (
				<MRT_ActionMenuItem
					key={action.key ?? `rowAction-${idx}`}
					icon={icon}
					label={label}
					onClick={async () => {
						closeMenu();
						await action.onClick?.(row, table, refetchList);
					}}
					table={table}
				/>
			);
		});
		// const userActionItems = rowActions.map((action, idx) => (
		// 	<MRT_ActionMenuItem
		// 		key={`rowAction-${idx}`}
		// 		icon={action.icon}
		// 		label={action.label}
		// 		onClick={async () => {
		// 			closeMenu();
		// 			await action.onClick?.(row, table, refetchList);
		// 		}}
		// 		table={table}
		// 	/>
		// ));

		return [...defaultItems, <Divider key="divider-2" />, ...userActionItems];
	};

	const validateUser = (item) => {
		return {};
	};
	const handleCreate = async ({ values, table }) => {
		const errs = validateUser(values);

		if (Object.values(errs).some((error) => error)) {
			return;
		}

		await createMutation(values);
		table.setCreatingRow(null);
		refetchList?.();
	};

	const handleUpdate = async ({ values, table }) => {
		const errs = validateUser(values);

		if (Object.values(errs).some((error) => error)) {
			return;
		}

		await updateMutation(values);
		table.setEditingRow(null);
		refetchList?.();
	};

	const openDeleteConfirmModal = (row) => {
		dispatch(
			openDialog({
				children: (
					<>
						<DialogTitle>حذف</DialogTitle>
						<DialogContent>
							<DialogContentText>
								آیا از حذف این ردیف مطمئن هستید؟
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => dispatch(closeDialog())}>لغو</Button>
							<Button
								onClick={() => {
									dispatch(closeDialog());
									deleteMutation(row.original.id);
									refetchList?.();
								}}
								color="error"
								variant="contained"
							>
								حذف
							</Button>
						</DialogActions>
					</>
				),
			})
		);
	};

	const defaults = useMemo(
		() =>
			_.defaults(rest, {
				initialState: {
					density: "spacious",
					// showColumnFilters: true,
					// showGlobalFilter: true,
					enablePagination: true,
					columnPinning: {
						left: ["mrt-row-expand", "mrt-row-select"],
						right: ["mrt-row-actions"],
					},
					pagination: {
						pageIndex: 0,
						pageSize: 10,
					},
					enableFullScreenToggle: true,
					localization: { MRT_Localization_FA },
				},
				enableColumnResizing: true,
				// columnResizeDirection: 'rtl',
				textAlign: "right",
				enableCellActions: true,
				enableClickToCopy: "context-menu",
				enableEditing: enableBuiltInEditing,
				enableStickyBody: true,

				// editDisplayMode: 'cell',
				editDisplayMode: "modal",
				createDisplayMode: "modal",
				positionActionsColumn: "last",
				onCreatingRowSave: async ({ values, table }) => {
					await createMutation(values);
					table.setCreatingRow(null);
				},
				onEditingRowSave: async ({ values, row, table }) => {
					await updateMutation(values);
					table.setEditingRow(null);
				},
				renderCreateRowDialogContent: ({
					table,
					row,
					internalEditComponents,
				}) => (
					<>
						<DialogTitle>{tableTitle || "ثبت"}</DialogTitle>
						<DialogContent
							sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
						>
							{internalEditComponents}
						</DialogContent>
						<DialogActions>
							<MRT_EditActionButtons variant="text" table={table} row={row} />
						</DialogActions>
					</>
				),
				renderEditRowDialogContent: ({
					table,
					row,
					internalEditComponents,
				}) => (
					<>
						<DialogTitle>{tableTitle || "ویرایش"}</DialogTitle>
						<DialogContent
							sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
						>
							{internalEditComponents}
						</DialogContent>
						<DialogActions>
							<MRT_EditActionButtons variant="text" table={table} row={row} />
						</DialogActions>
					</>
				),
				renderCellActionMenuItems: rowActionMenuItems,
				renderRowActionMenuItems: rowActionMenuItems,
				enableFullScreenToggle: false,
				enableColumnFilterModes: true,
				enableColumnOrdering: true,
				enableGrouping: true,
				enableColumnPinning: true,
				enableFacetedValues: true,
				enableRowActions,
				enableRowSelection,
				muiBottomToolbarProps: {
					className: "flex items-center min-h-56 h-56",
				},
				muiTablePaperProps: {
					elevation: 0,
					square: true,
					className: "flex flex-col flex-auto h-full",
				},
				muiTableContainerProps: {
					className: "flex-auto",
				},
				enableStickyHeader: true,
				localization: { MRT_Localization_FA },
				enableStickyFooter: true,
				// paginationDisplayMode: 'pages',
				positionPagination: "bottom",
				positionToolbarAlertBanner: "top",
				muiPaginationProps: {
					color: "secondary",
					rowsPerPageOptions: [5, 10, 20, 30],
					shape: "rounded",
					variant: "outlined",
					showRowsPerPage: true,
				},
				getRowId: (row) => row.id,
				muiTableBodyCellProps: {
					sx: { textAlign: "left", direction: "rtl" },
				},
				// muiSearchTextFieldProps: {
				// 	placeholder: 'جستجو',
				// 	sx: { minWidth: '300px' },
				// 	variant: 'outlined',
				// 	size: 'small'
				// 	// onChange: (e) => {
				// 	// 	// setSearchValue(e.target.value);
				// 	// 	// setGlobalFilter(e.target.value);
				// 	// 	// handleGlobalFilterChange(e.target.value);
				// 	// }
				// },
			muiFilterTextFieldProps: {
				variant: "outlined",
				size: "small",
				sx: {
					"& .MuiInputBase-root": {
						padding: "0px 8px",
						height: "32px!important",
						minHeight: "32px!important",
						direction: "rtl",
						textAlign: "right",
						color: "#FFF",
						backgroundColor: "rgba(255, 255, 255, 0.1)",
					},
					"& .MuiInputBase-input": {
						color: "#FFF",
						"&::placeholder": {
							color: "rgba(255, 255, 255, 0.7)",
							opacity: 1,
						},
					},
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "rgba(255, 255, 255, 0.3)",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "rgba(255, 255, 255, 0.5)",
					},
					"& .MuiSvgIcon-root": {
						color: "#FFF",
					},
				},
			},
				muiSelectAllCheckboxProps: {
					className: "w-48",
				},
				muiSelectCheckboxProps: {
					className: "w-48",
				},
				muiTableBodyRowProps: ({ row, table }) => {
					const { density } = table.getState();

					if (density === "compact") {
						return {
							sx: {
								backgroundColor: "initial",
								opacity: 1,
								boxShadow: "none",
								height: row.getIsPinned() ? `${37}px` : undefined,
							},
						};
					}

					return {
						sx: {
							backgroundColor: "initial",
							opacity: 1,
							boxShadow: "none",
							height: row.getIsPinned()
								? `${density === "comfortable" ? 53 : 69}px`
								: undefined,
						},
					};
				},
				muiTableHeadCellProps: ({ column }) => ({
					sx: {
						textAlign: "left",
						direction: "ltr",
						"& .Mui-TableHeadCell-Content-Labels": {
							flex: 1,
							justifyContent: "space-between",
						},
						"& .Mui-TableHeadCell-Content-Actions": {
							"& .MuiIconButton-root": {
								color: "#FFF", // Set header icons to white
							},
							"& .MuiSvgIcon-root": {
								color: "#FFF", // Set header icons to white
							},
						},
						"& .MuiFormHelperText-root": {
							textAlign: "center",
							marginX: 0,
							color: (theme) => theme.palette.text.disabled,
							fontSize: 11,
						},
						backgroundColor: (theme) =>
							column.getIsPinned() ? theme.palette.background.paper : "inherit",
					},
				}),

				manualFiltering: true,
				manualSorting: true,
				manualPagination: true,
				onColumnFiltersChange: setColumnFilters,
				onGlobalFilterChange: setGlobalFilter,
				onShowGlobalFilterChange: setShowGlobalFilter,
				onSortingChange: setSorting,
				onPaginationChange: setPaginationState,
				enableGlobalFilter: true,
				enableFilterMatchHighlighting: true,
				// globalFilterFn: 'noop',
				enableGlobalFilterModes: true,
				globalFilterModeOptions: ["asfd", "contains", "fuzzy"],
				rowCount: rtkData?.totalElements || 100,
				mrtTheme: (theme) => ({
					baseBackgroundColor: theme.palette.background.paper,
					menuBackgroundColor: theme.palette.background.paper,
					pinnedRowBackgroundColor: theme.palette.background.paper,
					pinnedColumnBackgroundColor: theme.palette.background.paper,
				}),
				renderTopToolbar: (_props) => <DataTableTopToolbar {..._props} />,
				renderBottomToolbar: (_props) => <DataTableBottomToolbar {..._props} />,
				renderTopToolbarCustomActions: ({ table }) => {
					return (
						<div className="flex flex-row">
							<div className="flex justify-start px-8 py-16">
								<IconButton onClick={() => refetchList?.()}>
									<RefreshIcon
										className={`cursor-pointer transition-transform ${
											isFetchingData
												? "animate-spin text-gray-400"
												: "text-gray-500 hover:scale-105 active:scale-95"
										}`}
									/>
								</IconButton>
								{/* <Button */}
								{/*	onClick={() => refetchList?.()} */}
								{/*	variant="outlined" */}
								{/*	color="secondary" */}
								{/* > */}
								{/*	بازیابی مجدد */}
								{/* </Button> */}
							</div>
							{createItemProps && (
								<div className="flex justify-start py-16 px-8">
									<Button
										variant="contained"
										color="primary"
										onClick={() => setCreateDialogOpen(true)}
									>
										{createItemProps.buttonLabel || "ایجاد آیتم جدید"}
									</Button>
								</div>
							)}

							{/* {createItemProps && ( */}
							{/*	<div className="flex justify-start py-16 px-8"> */}
							{/*		<Button */}
							{/*			variant="contained" */}
							{/*			color="secondary" */}
							{/*			onClick={openCreateDialog} */}
							{/*		> */}
							{/*			{createItemProps.buttonLabel || 'ایجاد آیتم جدید'} */}
							{/*		</Button> */}
							{/*	</div> */}
							{/* )} */}
							{RenderTopToolbarCustomActions ? (
								<div
									className={
										renderTopToolbarCustomActionsClasses ||
										"flex justify-start px-8 py-16"
									}
								>
									<RenderTopToolbarCustomActions />
								</div>
							) : (
								<></>
							)}
						</div>
					);
				},
				state: {
					isLoading: isFetchingData,
					showProgressBars: isFetchingData,
					showLoadingOverlay: isFetchingData,
					columnFilters,
					globalFilter,
					sorting,
					showGlobalFilter,
					pagination: paginationState,
				},
				icons: tableIcons,
				localeText: { MRT_Localization_FA },
				enablePagination: true,
				// enableColumnResizing: true
			}),
		[
			rest,
			isFetchingData,
			columnFilters,
			globalFilter,
			sorting,
			paginationState,
			setGlobalFilter,
		] // handleGlobalFilterChange]
	);

	const table = useMaterialReactTable({
		columns,
		data: finalData,
		...defaults,
		...rest,
		muiTableHeadCellProps: {
			sx: { backgroundColor: "#0C0C0C", color: "#FFF" },
		},
		muiIconButtonProps: {
			sx: {
				color: "#FFF", // Set the icon color to white
				"&:hover": {
					color: "#FFD700", // Change icon color on hover (e.g., gold)
				},
			},
		},
		muiFilterTextFieldProps: {
			sx: {
				"& .MuiInputBase-root": {
					color: "#FFF", // Input text color
					backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight background for visibility
				},
				"& .MuiInputBase-input": {
					color: "#FFF", // Ensure input text is white
					"&::placeholder": {
						color: "rgba(255, 255, 255, 0.7)", // Placeholder color
						opacity: 1,
					},
				},
				"& .MuiOutlinedInput-notchedOutline": {
					borderColor: "rgba(255, 255, 255, 0.3)", // Border color
				},
				"&:hover .MuiOutlinedInput-notchedOutline": {
					borderColor: "rgba(255, 255, 255, 0.5)", // Border color on hover
				},
				"& .MuiSvgIcon-root": {
					color: "#FFF", // Icon color (for select dropdowns, etc.)
				},
			},
		},
		manualGlobalFilter: true,
		enableFilterMatchHighlighting: true,
		// globalFilterFn: 'noop',
		localization: MRT_Localization_FA,
	});

	if (isErrorFetchingData) {
		const errorMessage =
			fetchError?.data?.message ||
			fetchError?.error ||
			"خطا در دریافت داده‌ها از سرور.";
		return <p style={{ color: "red" }}>خطا: {errorMessage}</p>;
	}

	return (
		<div
			style={{
				direction: "rtl",
				backgroundColor: "#fff",
				boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
			}}
			className="w-full max-w-screen flex flex-col h-full overflow-auto"
		>
			<MaterialReactTable
				table={table}
				enablePagination
				manualFiltering
				muiTableHeadProps={{
					sx: {
						backgroundColor: "#000",
						color: "#111", // Change the background color of the header cells
					},
				}}
				columnFilterDisplayMode="popover"
				columnResizeDirection="rtl"
				onGlobalFilterChange={setGlobalFilter}
				manualGlobalFilter
				enableFilterMatchHighlighting
				// globalFilterFn="noop"
				state={{ globalFilter }}
			/>

			{createItemProps && (
				<Dialog
					open={createDialogOpen}
					onClose={() => setCreateDialogOpen(false)}
					fullWidth
					maxWidth="sm"
				>
					{/* <DialogTitle>{createItemProps.dialogTitle || 'ایجاد آیتم جدید'}</DialogTitle> */}
					{/* <DialogContent className="p-32"> */}
					<DialogContent
						sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
					>
						<CreateItemForm
							schema={
								createItemProps.formValidationStruct === "ZOD_SCHEMA"
									? createItemProps.zodSchema
									: createItemProps.jsonSchema
							}
							defaultValues={createItemProps.defaultValues}
							formEngine={createItemProps.formEngine || "DEFAULT"}
							formFieldsInputTypes={createItemProps.formFieldsInputTypes || {}}
							formHeaderTitle={createItemProps.formHeaderTitle}
							formValidationStruct={createItemProps.formValidationStruct}
							formGenerationType={createItemProps.formGenerationType}
							hideSubmitField={createItemProps.hideSubmitField}
							setCreateDialogOpen={setCreateDialogOpen}
							onSubmit={async (vals) => {
								let result;
								console.log(`Generic Crud Table's OnSubmit: ${vals}`)

								if (createItemProps.onCreate) {
									result = await createItemProps.onCreate(vals);
								} else {
									result = await createMutation(vals);
								}

								if (result) setCreateDialogOpen(false);
								// setCreateDialogOpen(false);
								// refetchList?.();
							}}
						/>
						{/* {createItemForm && ( */}
						{/*	<form className="space-y-16"> */}
						{/*		{Object.keys(createItemForm.formState.errors).length > 0 && ( */}
						{/*			<Typography */}
						{/*				type="p" */}
						{/*				className="my-8" */}
						{/*				style={{ color: 'red' }} */}
						{/*			> */}
						{/*				لطفا خطا‌های زیر را اصلاح کنید */}
						{/*			</Typography> */}
						{/*		)} */}

						{/*		{Object.entries(createItemProps?.formFieldsInputTypes || {}).length && */}
						{/*			Object.entries(createItemProps.formFieldsInputTypes).map(([key, value], index) => ( */}
						{/*				<TextField */}
						{/*					label={value?.label} */}
						{/*					variant={value?.variant || 'outlined'} */}
						{/*					className={value?.classes || ''} */}
						{/*					{...createItemForm.register(key)} */}
						{/*					error={!!createItemForm.formState.errors[key]} */}
						{/*					helperText={createItemForm.formState.errors[key]?.message} */}
						{/*					{...value.props} */}
						{/*				/> */}
						{/*			))} */}
						{/*	</form> */}
						{/* )} */}
					</DialogContent>
					{/* <DialogActions> */}
					{/* <Button onClick={() => setCreateDialogOpen(false)}>بستن</Button> */}
					{/* <Button */}
					{/*	onClick={ */}
					{/*		createItemForm */}
					{/*			? createItemForm.handleSubmit(handleCreateSubmit) */}
					{/*			: () => setCreateDialogOpen(false) */}
					{/*	} */}
					{/*	color="primary" */}
					{/*	variant="contained" */}
					{/* > */}
					{/*	ثبت */}
					{/* </Button> */}
					{/* </DialogActions> */}
				</Dialog>
			)}
			{editItemProps && (
				<Dialog
					open={editDialogOpen}
					onClose={closeEditDialog}
					fullWidth
					maxWidth="sm"
				>
					<DialogContent sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<EditItemForm
							schema={
								editItemProps.formValidationStruct === "ZOD_SCHEMA"
									? editItemProps.zodSchema
									: editItemProps.jsonSchema
							}
							defaultValues={
								editItemProps.getDefaultValues
									? editItemProps.getDefaultValues(editingRow?.original)
									: editingRow?.original || {}
							}
							formEngine={editItemProps.formEngine || "DEFAULT"}
							formFieldsInputTypes={editItemProps.formFieldsInputTypes || {}}
							formHeaderTitle={editItemProps.formHeaderTitle || "ویرایش آیتم"}
							formValidationStruct={editItemProps.formValidationStruct}
							formGenerationType={editItemProps.formGenerationType}
							hideSubmitField={editItemProps.hideSubmitField}
							setEditDialogOpen={setEditDialogOpen}
							editingRow={editingRow}
							onSubmit={handleEditSubmit}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

function CreateItemForm({
	schema,
	defaultValues,
	onSubmit,
	formFieldsInputTypes = {},
	formEngine = "DEFAULT",
	formValidationStruct,
	formHeaderTitle = "ثبت آیتم",
	formGenerationType = "AUTO",
	setCreateDialogOpen,
	hideSubmitField,
}) {
	const form = useForm({
		resolver: schema ? zodResolver(schema) : undefined,
		defaultValues: defaultValues || {},
	});
	const { register, handleSubmit, formState, reset } = form;
	const handleFormSubmit = async (data) => {
		await onSubmit(data);
	};

	// console.log(`Schema here: ${JSON.stringify(schema())}`);

	if (formEngine === "UNIFORMS") {
		return (
			<DynamicFormGenerator
				initialData={{}}
				onSubmit={onSubmit}
				formHeaderTitle={formHeaderTitle}
				schema={schema || {}}
				formValidationStruct={formValidationStruct}
				formFieldsInputTypes={
					(formFieldsInputTypes && Object.keys(formFieldsInputTypes)) || null
				}
				formGenerationType={formGenerationType}
				hideSubmitField={hideSubmitField}
				setCreateDialogOpen={setCreateDialogOpen}
				isSubmitting={false}
			/>
		);
	}

	return (
		<form className="space-y-16" onSubmit={handleSubmit(handleFormSubmit)}>
			{Object.entries(formFieldsInputTypes).map(([key, cfg], idx) => {
				if (cfg.renderCustomInput) {
					return (
						<Box
							key={key + idx}
							className={cfg.classes || ""}
							sx={cfg.styles || {}}
						>
							{typeof cfg.renderCustomInput === "function"
								? cfg.renderCustomInput(key, cfg, form)
								: null}
						</Box>
					);
				}

				if (cfg.inputType === "Select") {
					return (
						<TextField
							key={key + idx}
							select
							label={cfg?.label || key}
							variant={cfg?.variant || "outlined"}
							className={cfg?.classes || ""}
							{...register(key)}
							error={!!formState.errors[key]}
							helperText={formState.errors[key]?.message}
							{...(cfg.props || {})}
						/>
					);
				}

				if (cfg.inputType === "Checkbox") {
					return (
						<Box
							key={key + idx}
							className={cfg.classes || ""}
							sx={cfg.styles || {}}
						>
							<label>
								<input type="checkbox" {...register(key)} />
								{cfg.label || key}
							</label>
							{formState.errors[key]?.message && (
								<Typography style={{ color: "red" }}>
									{formState.errors[key]?.message}
								</Typography>
							)}
						</Box>
					);
				}

				if (cfg.inputType === "Date") {
					if (cfg?.overrideCustomDatePicker) {
						return (
							<Box
								key={key + idx}
								className={cfg.classes || ""}
								sx={cfg.styles || {}}
							>
								{cfg.overrideCustomDatePicker(key, cfg, form)}
							</Box>
						);
					}

					return (
						<TextField
							key={key + idx}
							type="date"
							label={cfg?.label || key}
							variant={cfg?.variant || "outlined"}
							className={cfg?.classes || ""}
							{...register(key)}
							error={!!formState.errors[key]}
							helperText={formState.errors[key]?.message}
							{...(cfg.props || {})}
						/>
					);
				}

				return (
					<TextField
						key={key + idx}
						label={cfg?.label || key}
						variant={cfg?.variant || "outlined"}
						className={cfg?.classes || ""}
						{...register(key)}
						error={!!formState.errors[key]}
						helperText={formState.errors[key]?.message}
						{...(cfg.props || {})}
					/>
				);
			})}
			<DialogActions>
				<Button
					onClick={() => {
						reset(defaultValues);
					}}
				>
					انصراف
				</Button>
				<Button
					onClick={handleSubmit(handleFormSubmit)}
					color="primary"
					variant="contained"
				>
					ثبت
				</Button>
			</DialogActions>
		</form>
	);
}
function EditItemForm({
						  schema,
						  defaultValues,
						  onSubmit,
						  formFieldsInputTypes = {},
						  formEngine = "DEFAULT",
						  formValidationStruct,
						  formHeaderTitle = "ویرایش آیتم",
						  formGenerationType = "AUTO",
						  setEditDialogOpen,
						  hideSubmitField,
						  editingRow,
					  }) {
	const form = useForm({
		resolver: schema ? zodResolver(schema) : undefined,
		defaultValues: defaultValues || {},
	});
	const { register, handleSubmit, formState, reset } = form;
	useEffect(() => {
		if (defaultValues) reset(defaultValues);
	}, [defaultValues, reset]);
	const handleFormSubmit = async (data) => await onSubmit(data);

	if (formEngine === "UNIFORMS") {
		return (
			<DynamicFormGenerator
				initialData={defaultValues}
				onSubmit={onSubmit}
				formHeaderTitle={formHeaderTitle}
				schema={schema || {}}
				formValidationStruct={formValidationStruct}
				formFieldsInputTypes={
					(formFieldsInputTypes && Object.keys(formFieldsInputTypes)) || null
				}
				formGenerationType={formGenerationType}
				hideSubmitField={hideSubmitField}
				setCreateDialogOpen={setEditDialogOpen}
				isSubmitting={false}
			/>
		);
	}

	return (
		<form className="space-y-16" onSubmit={handleSubmit(handleFormSubmit)}>
			<Typography variant="h6" className="mb-16">
				{formHeaderTitle}
			</Typography>
			{Object.entries(formFieldsInputTypes).map(([key, cfg], idx) => {
				if (cfg.renderCustomInput) {
					return (
						<Box
							key={key + idx}
							className={cfg.classes || ""}
							sx={cfg.styles || {}}
						>
							{typeof cfg.renderCustomInput === "function"
								? cfg.renderCustomInput(key, cfg, form)
								: null}
						</Box>
					);
				}

				if (cfg.inputType === "Select") {
					return (
						<TextField
							key={key + idx}
							select
							label={cfg?.label || key}
							variant={cfg?.variant || "outlined"}
							className={cfg?.classes || ""}
							{...register(key)}
							error={!!formState.errors[key]}
							helperText={formState.errors[key]?.message}
							{...(cfg.props || {})}
						/>
					);
				}

				if (cfg.inputType === "Checkbox") {
					return (
						<Box
							key={key + idx}
							className={cfg.classes || ""}
							sx={cfg.styles || {}}
						>
							<label>
								<input type="checkbox" {...register(key)} />
								{cfg.label || key}
							</label>
							{formState.errors[key]?.message && (
								<Typography style={{ color: "red" }}>
									{formState.errors[key]?.message}
								</Typography>
							)}
						</Box>
					);
				}

				if (cfg.inputType === "Date") {
					if (cfg?.overrideCustomDatePicker) {
						return (
							<Box
								key={key + idx}
								className={cfg.classes || ""}
								sx={cfg.styles || {}}
							>
								{cfg.overrideCustomDatePicker(key, cfg, form)}
							</Box>
						);
					}

					return (
						<TextField
							key={key + idx}
							type="date"
							label={cfg?.label || key}
							variant={cfg?.variant || "outlined"}
							className={cfg?.classes || ""}
							{...register(key)}
							error={!!formState.errors[key]}
							helperText={formState.errors[key]?.message}
							{...(cfg.props || {})}
						/>
					);
				}

				return (
					<TextField
						key={key + idx}
						label={cfg?.label || key}
						variant={cfg?.variant || "outlined"}
						className={cfg?.classes || ""}
						{...register(key)}
						error={!!formState.errors[key]}
						helperText={formState.errors[key]?.message}
						{...(cfg.props || {})}
					/>
				);
			})}
			<DialogActions>
				<Button onClick={() => {
					reset(defaultValues);
					setEditDialogOpen(false);
				}}>
					انصراف
				</Button>
				<Button onClick={handleSubmit(handleFormSubmit)} color="primary" variant="contained">
					بروزرسانی
				</Button>
			</DialogActions>
		</form>
	);
}

export default GenericCrudTable;
