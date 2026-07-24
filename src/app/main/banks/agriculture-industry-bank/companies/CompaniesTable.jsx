/* eslint-disable react/no-unstable-nested-components */
import { useMemo, useState } from "react";
import { IconButton, Paper, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import FuseScrollbars from "@fuse/core/FuseScrollbars/index.js";
import GenericCrudTable from "app/shared-components/data-table/GenericCrudTable.jsx";
import { API_STATIC_FILES_BASE_URL } from "app/store/apiService.js";
import EntityStatusField from "app/shared-components/data-table/EntityStatusField.jsx";
import { getCompanyStatusBadgeStyle } from "app/shared-components/data-table/companyStatusColors.js";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon/index.js";
import { companyAdvancedFilterConfig } from "app/shared-components/advanced-filters/configs/companyFilterConfig.js";
import { useGetAllAgricultureIndustryCompaniesQuery } from "../AgricultureIndustryApi";
import {
	useCreateCategoryMutation,
	useDeleteCategoryMutation,
	useUpdateCategoryMutation,
} from "../../../category/CategoriesApi";
import CompanyLocationModal, { hasCompanyLocationData } from "../../food-industry-bank/companies/CompanyLocationModal";

const CONTAINS_FILTER_FIELDS = new Set(["province", "city", "location"]);

const FILTER_MODE_TO_OPERATOR = {
	contains: "CONTAINS",
	fuzzy: "CONTAINS",
	startsWith: "STARTS_WITH",
	endsWith: "ENDS_WITH",
	equals: "EQUALS",
	notEquals: "NOT_EQUALS",
	greaterThan: "GREATER_THAN",
	greaterThanOrEqualTo: "GREATER_THAN_OR_EQUAL",
	lessThan: "LESS_THAN",
	lessThanOrEqualTo: "LESS_THAN_OR_EQUAL",
};

function transformCompanyColumnFilters(columnFilters, context = {}) {
	const { columnFilterFns = {} } = context;

	return columnFilters
		.map((filter) => {
			const { id, value } = filter;
			const filterMode = columnFilterFns[id];

			if (filterMode === "empty") {
				return `${id}:IS_EMPTY`;
			}

			if (filterMode === "notEmpty") {
				return `${id}:IS_NOT_EMPTY`;
			}

			if (value == null || value === "") {
				return null;
			}

			if (Array.isArray(value)) {
				const normalizedValues = value.filter(
					(item) => item != null && item !== ""
				);

				if (!normalizedValues.length) {
					return null;
				}

				if (
					filterMode === "between" ||
					filterMode === "betweenInclusive" ||
					filterMode === "inNumberRange"
				) {
					return `${id}:BETWEEN:${normalizedValues[0]},${normalizedValues[1] ?? ""}`;
				}

				if (normalizedValues.length === 2 && typeof normalizedValues[0] === "number") {
					return `${id}:BETWEEN:${normalizedValues[0]},${normalizedValues[1] ?? ""}`;
				}

				return `${id}:IN:${normalizedValues.join(",")}`;
			}

			if (typeof value === "boolean") {
				const operator = FILTER_MODE_TO_OPERATOR[filterMode] || "EQUALS";
				return `${id}:${operator}:${value}`;
			}

			if (FILTER_MODE_TO_OPERATOR[filterMode]) {
				return `${id}:${FILTER_MODE_TO_OPERATOR[filterMode]}:${value}`;
			}

			if (filterMode === "between" || filterMode === "betweenInclusive") {
				return `${id}:BETWEEN:${value}`;
			}

			if (filterMode === "arrIncludes" || filterMode === "arrIncludesSome") {
				return `${id}:IN:${value}`;
			}

			if (value && String(value).includes("%")) {
				return `${id}:LIKE:${value}`;
			}

			if (CONTAINS_FILTER_FIELDS.has(id) || id.startsWith("location.")) {
				return `${id}:CONTAINS:${value}`;
			}

			return `${id}:EQUALS:${value}`;
		})
		.filter(Boolean);
}

function CompaniesTable() {
	const [locationModal, setLocationModal] = useState({
		open: false,
		companyName: "",
		location: null,
	});

	const openLocationModal = (companyName, location) => {
		setLocationModal({
			open: true,
			companyName,
			location,
		});
	};

	const closeLocationModal = () => {
		setLocationModal({
			open: false,
			companyName: "",
			location: null,
		});
	};
	const columns = useMemo(
		() => [
			{
				accessorFn: (row) => row.featuredImageId,
				id: "featuredImageId",
				header: "لوگو شرکت",
				enableColumnFilter: false,
				enableColumnDragging: false,
				size: 150,
				enableSorting: false,
				Cell: ({ row }) => (
					<div className="flex items-center justify-center">
						{row.original?.logo ? (
							<img
								className="w-120 h-120 rounded-full"
								src={API_STATIC_FILES_BASE_URL + row.original.logo}
								alt={row.original.companyName}
							/>
						) : (
							<img
								className="w-full max-h-40 max-w-40 block rounded-full"
								src="assets/images/apps/ecommerce/product-image-placeholder.png"
								alt={row.original.name}
							/>
						)}
					</div>
				),
			},
			{
				accessorKey: "id",
				header: "شناسه شرکت",
				size: 15,
			},
			{
				accessorKey: "companyName",
				header: "نام شرکت",
				size: 250,
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/banks/agriculture-industry/company/${row.original.id}`}
						className="underline"
						color="secondary"
						role="button"
					>
						{row.original.companyName}
					</Typography>
				),
			},
			{
				accessorKey: "category",
				header: "دسته‌بندی",
			},
			{
				accessorKey: "subCategory",
				header: "زیرشاخه",
				size: 300,
			},
			{
				accessorKey: "province",
				header: "استان",
				Cell: ({ row }) => <div dir="rtl">{row.original.province || '—'}</div>,
				size: 120,
			},
			{
				accessorKey: "city",
				header: "شهر",
				Cell: ({ row }) => <div dir="rtl">{row.original.city || '—'}</div>,
				size: 120,
			},
			{
				accessorKey: "location",
				header: "موقعیت مکانی",
				size: 160,
				enableSorting: false,
				Cell: ({ row }) => {
					const location = row.original?.location;

					if (!hasCompanyLocationData(location)) {
						return (
							<Typography color="text.secondary" className="text-center">
								—
							</Typography>
						);
					}

					return (
						<div className="flex items-center justify-center">
							<Tooltip title="مشاهده جزئیات موقعیت">
								<IconButton
									size="small"
									color="primary"
									onClick={() =>
										openLocationModal(row.original.companyName, location)
									}
								>
									<FuseSvgIcon size={20}>
										heroicons-outline:location-marker
									</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</div>
					);
				},
			},
			{
				header: "وضعیت",
				accessorKey: "status",
				editVariant: "select",
				filterVariant: "select",
				filterSelectOptions: [
					{ label: "در انتظار تایید", value: "0" },
					{ label: "تایید شده", value: "1" },
					{ label: "رد شده", value: "2" },
					{ label: "آرشیو شده", value: "3" },
					{ label: "حذف شده", value: "4" },
					{ label: "ویرایش شده", value: "5" },
					{ label: "منتشر شده", value: "6" },
					{ label: "بازبینی", value: "7" },
					{ label: "ثبت اولیه", value: "8" },
					{ label: "در انتظار پرداخت", value: "9" },
					{ label: "اتمام اشتراک", value: "10" },
				],
				// editSelectOptions: categoryStatusSelectOptions,
				accessorFn: (row) => {
					const badgeStyle = getCompanyStatusBadgeStyle(row?.companyStatus);

					return (
						<EntityStatusField
							name={row?.companyStatusFa}
							bgColor={badgeStyle.backgroundColor}
							color={badgeStyle.color}
							heartbeat={false}
						/>
					);
				},
			},
			{
				accessorKey: "visit",
				header: "بازدید‌ها",
				Cell: ({ row }) => (
					<div className="flex items-center">
						{row?.original?.visit > 0 ? (
							<span className="flex flex-row">
								{row?.original?.visit}
								<FuseSvgIcon className="text-green ms-4" size={20}>
									heroicons-outline:plus-circle
								</FuseSvgIcon>
							</span>
						) : (
							<span className="flex flex-row">
								{row?.original?.visit}
								<FuseSvgIcon className="text-red ms-4" size={20}>
									heroicons-outline:minus-circle
								</FuseSvgIcon>
							</span>
						)}
					</div>
				),
			},
			{
				accessorFn: (row) => row?.companyType?.name,
				accessorKey: "companyType",
				header: "نوع شرکت",
				size: 50,
			},
		],
		[]
	);
	return (
		<div className="w-full flex flex-col">
			<FuseScrollbars className="grow overflow-x-auto">
				<Paper
					className="flex flex-col flex-auto shadow-3 rounded-t-16 overflow-hidden rounded-b-0 w-full h-screen p-24"
					elevation={0}
				>
					<GenericCrudTable
						columns={columns}
						useListQueryHook={useGetAllAgricultureIndustryCompaniesQuery}
						useCreateMutationHook={useCreateCategoryMutation}
						useUpdateMutationHook={useUpdateCategoryMutation}
						useDeleteMutationHook={useDeleteCategoryMutation}
						saveToStore={false}
						enableRowAction={false}
						enableEditing={false}
						enableBuiltInEditing={false}
						transformColumnFilters={transformCompanyColumnFilters}
						advancedFilterConfig={companyAdvancedFilterConfig}
						serviceIdentifier="agricultureCompanyList"
					/>
				</Paper>
			</FuseScrollbars>
			<CompanyLocationModal
				open={locationModal.open}
				onClose={closeLocationModal}
				companyName={locationModal.companyName}
				location={locationModal.location}
			/>
		</div>
	);
}

export default CompaniesTable;
