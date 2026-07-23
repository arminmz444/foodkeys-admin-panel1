// import GenericCrudTable from 'app/shared-components/data-table/GenericCrudTable.jsx';
// import FusePageCarded from '@fuse/core/FusePageCarded/index.js';
// import { styled } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import {
// 	useGetSubCategoriesQuery,
// 	useCreateSubCategoryMutation,
// 	useUpdateSubCategoryMutation,
// 	useDeleteSubCategoryMutation
// } from './SubCategoriesApi.js';
// import useThemeMediaQuery from '../../../../@fuse/hooks/useThemeMediaQuery.js';
//
// function SubCategoryTable() {
// 	const columns = [
// 		{
// 			header: 'شناسه',
// 			accessorKey: 'id',
// 			size: 10
// 		},
// 		{
// 			header: 'نام',
// 			accessorKey: 'name',
// 			size: 400
// 		},
// 		{
// 			header: 'نام انگلیسی',
// 			accessorKey: 'nameEn',
// 			size: 100
// 		},
// 		{
// 			header: 'ترتیب صفحه',
// 			accessorKey: 'pageOrder',
// 			size: 10
// 		},
// 		{
// 			header: 'شناسه دسته‌بندی',
// 			accessorKey: 'categoryId',
// 			size: 10
// 		},
// 		{
// 			header: 'دسته‌بندی',
// 			accessorKey: 'category',
// 			size: 100
// 		},
// 		{
// 			header: 'تاریخ ایجاد',
// 			accessorKey: 'createdAtStr',
// 			size: 80
// 		},
// 		{
// 			header: 'آخرین بروزرسانی',
// 			accessorKey: 'updatedAtStr',
// 			size: 80
// 		},
// 		{
// 			header: 'شرکت‌های در انتظار تایید',
// 			accessorKey: 'pendingCompanies',
// 			size: 250
// 		},
// 		{
// 			header: 'شرکت‌های تایید شده',
// 			accessorKey: 'verifiedCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'شرکت‌های رد شده',
// 			accessorKey: 'deniedCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'شرکت‌های جدید',
// 			accessorKey: 'newCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'شرکت‌های آرشیوشده',
// 			accessorKey: 'archivedCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'شرکت‌های حذف شده',
// 			accessorKey: 'deletedCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'شرکت‌های بروزرسانی شده',
// 			accessorKey: 'updatedCompanies',
// 			size: 250
// 		},
// 		{
// 			header: 'شرکت‌های منتشر شده',
// 			accessorKey: 'publishedCompanies',
// 			size: 50
// 		},
// 		{
// 			header: 'صفحه جزئیات',
// 			accessorKey: 'hasDetailsPage',
// 			size: 30,
// 			accessorFn: (row) => (row.hasDetailsPage ? 'دارد' : 'ندارد')
// 		}
// 	];
//
// 	const Root = styled(FusePageCarded)({
// 		'& .FusePageCarded-header': {},
// 		'& .FusePageCarded-toolbar': {},
// 		'& .FusePageCarded-content': {},
// 		'& .FusePageCarded-sidebarHeader': {},
// 		'& .FusePageCarded-sidebarContent': {}
// 	});
//
// 	// return (
// 	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
// 	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
// 	const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
// 	useEffect(() => {
// 		setLeftSidebarOpen(!isMobile);
// 		setRightSidebarOpen(!isMobile);
// 	}, [isMobile]);
// 	return (
// 		<GenericCrudTable
// 			columns={columns}
// 			// Provide the RTK Query hooks for listing and mutations
// 			useListQueryHook={useGetSubCategoriesQuery}
// 			useCreateMutationHook={useCreateSubCategoryMutation}
// 			useUpdateMutationHook={useUpdateSubCategoryMutation}
// 			useDeleteMutationHook={useDeleteSubCategoryMutation}
// 			saveToStore={false}
// 			enablePagination
// 			pagination={{ pageIndex: 1, pageSize: 10 }}
// 		/>
// 	);
// }
//
// export default SubCategoryTable;

import React from "react";
import { z } from "zod";

import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} from "./SubCategoriesApi";
import GenericCrudTable from "../../../shared-components/data-table/GenericCrudTable";
import CustomUniformsAsyncSelect from "app/shared-components/dynamic-field-generator/CustomUniformsAsyncSelect";
import axios from "axios";
import _ from "lodash";

const citiesList = [
  "صنایع غذایی",
  "بانک صنعت کشاورزی",
  "بانک ماشین‌آلات",
  "بانک خدمات",
  "صنایع امیر",
  "صنایع مجتبی",
  "یک خدمت جدید",
  "تست ثبت داده برای دسته‌بندی",
];

// 	[
// 	{
// 		accessorKey: 'id',
// 		header: 'شناسه',
// 		size: 32
// 	},
// 	{
// 		header: 'نام دسته بندی',
// 		accessorKey: 'name'
// 	},
// 	{
// 		header: 'نام انگلیسی',
// 		accessorKey: 'nameEn'
// 	},
// 	{
// 		header: 'وضعیت',
// 		accessorKey: 'categoryStatus',
// 		editVariant: 'select',
// 		editSelectOptions: categoryStatusSelectOptions,
// 		muiEditTextFieldProps: {
// 			select: true
// 		},
// 		accessorFn: (row) =>
// 			row?.categoryStatus == 1 ? (
// 				<EntityStatusField
// 					name="فعال"
// 					colorClsx="bg-green text-white"
// 				/>
// 			) : (
// 				<EntityStatusField
// 					name="غیرفعال"
// 					colorClsx="bg-red-700 text-white"
// 				/>
// 			)
// 	},
// 	{
// 		header: 'ترتیب صفحه',
// 		accessorKey: 'pageOrder'
// 	},
// 	{
// 		header: 'تعداد زیرمجموعه‌ها',
// 		accessorKey: 'subCategoryCount',
// 		enableEditing: false
// 	},
// 	{
// 		header: 'تعداد شرکت‌ها',
// 		accessorKey: 'companyCount',
// 		enableEditing: false
// 	},
// 	{
// 		header: 'تعداد صنایع',
// 		accessorKey: 'industryCount',
// 		enableEditing: false
// 	},
// 	{
// 		header: 'تعداد بازدید',
// 		accessorKey: 'visitCount',
// 		enableEditing: false
// 	},
// 	{
// 		header: 'تاریخ ایجاد',
// 		accessorKey: 'createdAtStr',
// 		Cell: ({ value }) => value || '—',
// 		enableEditing: false
// 	},
// 	{
// 		header: 'آخرین بروزرسانی',
// 		accessorKey: 'updatedAtStr',
// 		Cell: ({ value }) => value || '—',
// 		enableEditing: false
// 	}
// ],


const loadCategories = async () => {
  const result = await axios.get("/category/options?pageSize=9999999"); // TODO: Use category options endpoint (create if not exists)
  const data = result?.data?.data || [];

  const res = data.map((d) => {
    return { label: d.label, value: d.value };
  });
  return res;
};

const DateCell = ({ row }) => <div dir="rtl">{row.original.createdAtStr}</div>;
const UpdatedDateCell = ({ row }) => <div dir="rtl">{row.original.updatedAtStr}</div>;

function SubCategoryTable() {
  const [createSubCategory] = useCreateSubCategoryMutation();
  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const columns = React.useMemo(
    () => [
      {
        header: "شناسه",
        accessorKey: "id",
        size: 130,
        enableEditing: false,
      },
      {
        header: "نام",
        accessorKey: "name",
        size: 500,
      },
      {
        header: "نام انگلیسی",
        accessorKey: "nameEn",
        size: 200,
      },
      {
        header: "نام نمایشی",
        accessorKey: "displayName",
        size: 200,
      },
      {
        header: "ترتیب صفحه",
        accessorKey: "pageOrder",
        size: 200,
      },
      {
        header: "شناسه دسته‌بندی",
        accessorKey: "categoryId",
        size: 200,
      },
      {
        header: "دسته‌بندی",
        accessorKey: "category",
        size: 200,
        enableEditing: false,
        filterVariant: "select",
        filterSelectOptions: citiesList,
      },
      {
        header: "تاریخ ایجاد",
        accessorKey: "createdAtStr",
        size: 200,
        enableEditing: false,
        Cell: DateCell,
      },
      {
        header: "آخرین بروزرسانی",
        accessorKey: "updatedAtStr",
        size: 200,
        enableEditing: false,
        Cell: UpdatedDateCell,
      },
      {
        header: "شرکت‌های در انتظار تایید",
        accessorKey: "pendingCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های تایید شده",
        accessorKey: "verifiedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های رد شده",
        accessorKey: "deniedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های جدید",
        accessorKey: "newCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های آرشیوشده",
        accessorKey: "archivedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های حذف شده",
        accessorKey: "deletedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های بروزرسانی شده",
        accessorKey: "updatedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "شرکت‌های منتشر شده",
        accessorKey: "publishedCompanies",
        size: 250,
        enableEditing: false,
      },
      {
        header: "صفحه جزئیات",
        accessorKey: "hasDetailsPage",
        size: 200,
        accessorFn: (row) => (row.hasDetailsPage ? "دارد" : "ندارد"),
      },
    ],
    []
  );

  // define row actions
  const rowActions = [
    {
      icon: <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>,
      label: "مشاهده صفحه مجموعه‌",
      onClick: async (row, table, refetchList) => {
        // alert(`Show cat-item for: ${row.original.name}`);
        refetchList();
      },
    },
    // {
    // 	icon: <PersonOffOutlined />,
    // 	label: 'غیرفعال کردن',
    // 	onClick: async (row, table, refetchList) => {
    // 		// call your disable API
    // 		alert(`Disable: ${row.original.name}`);
    // 		// e.g. await useDisableCategoryMutation(row.original.id);
    // 		refetchList();
    // 	}
    // }
  ];
  const handleCreate = async (vals) => {
    const data = _.clone(vals);
    console.log(`SUB:${data}`);
    await createSubCategory(data);
    return true;
  };
  const handleUpdate = async (vals) => {
    const data = _.clone(vals);
    // data.categoryStatus = vals.categoryStatus === 'فعال' ? 1 : 2;
    data.updatedAt = null;
    data.createdAt = null;
    await updateSubCategory(data);
    return true;
  };
  const getEditDefaultValues = (rowData) => {
    console.log("Row Data for editing:", rowData);

    const editValues = {
      ...rowData,
      categoryId: rowData?.categoryId,
      createdAt: undefined,
      updatedAt: undefined,
      category: undefined,
    };

    console.log("Edit values:", editValues);
    return editValues;
  };
  // const getEditDefaultValues = (rowData) => {
  //   console.log("Row Data")
  //   const category = { label: rowData?.category, value: rowData?.categoryId }
  //   console.log({
  //     ...rowData,
  //     category,
  //     categoryId: category
  //     // categoryStatus: rowData.categoryStatus === 1 ? 'فعال' : 'غیرفعال'
  //   })
  //   return {
  //     ...rowData,
  //     category,
  //     categoryId: category
  //     // categoryStatus: rowData.categoryStatus === 1 ? 'فعال' : 'غیرفعال'
  //   };
  // };
  const subCategorySchema = z.object({
    name: z
        .string({
          invalid_type_error: "فرمت داده ورودی اشتباه است",
          required_error: "این فیلد الزامی است",
        })
        .min(1, { message: "این فیلد الزامی است" })
        .uniforms({
          displayName: "نام",
          label: "نام زیرشاخه",
          placeholder: "نام زیرشاخه را وارد کنید",
        }),
    nameEn: z
        .string({
          invalid_type_error: "فرمت داده ورودی اشتباه است",
          required_error: "این فیلد الزامی است",
        })
        .min(1, { message: "این فیلد الزامی است" })
        .uniforms({
          displayName: "نام انگلیسی",
          label: "نام انگلیسی زیرشاخه",
          placeholder: "نام انگلیسی زیرشاخه را وارد کنید",
        }),
    displayName: z
        .string({
          invalid_type_error: "فرمت داده ورودی اشتباه است",
          required_error: "این فیلد الزامی است",
        })
        .min(1, { message: "این فیلد الزامی است" })
        .uniforms({
          displayName: "نام نمایشی",
          label: "نام نمایشی زیرشاخه",
          placeholder: "نام نمایشی زیرشاخه را وارد کنید",
        }),
    categoryId: z
        .number({
          required_error: "این فیلد الزامی است",
          invalid_type_error: "فرمت داده ورودی اشتباه است",
          message: "مقدار انتخاب شده معتبر نیست",
        })
        .uniforms({
          displayName: "دسته‌بندی",
          label: "دسته‌بندی",
          placeholder: "دسته‌بندی را انتخاب کنید",
          loadOptions: loadCategories,
          component: CustomUniformsAsyncSelect,
        }),
    pageOrder: z
        .number({
          invalid_type_error: "فرمت داده ورودی اشتباه است",
          required_error: "این فیلد الزامی است",
        })
        .min(1, { message: "حداقل مقدار برای این فیلد ۱ است" })
        .uniforms({
          displayName: "ترتیب صفحه",
          label: "ترتیب صفحه زیرشاخه",
          placeholder: "اولویت نمایش زیرشاخه در سایت اصلی را انتخاب کنید",
        }),
    hasDetailsPage: z
        .boolean({ description: "صفحه اختصاصی دارد؟" })
        .optional()
        .uniforms({
          displayName: "ایجاد صفحه اختصاصی",
          label: "ایجاد صفحه اختصاصی",
        }),
  });
  const formFieldsInputTypes = {
    name: {
      label: "نام",
      inputType: "TextField",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
    nameEn: {
      label: "نام انگلیسی",
      inputType: "TextField",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
    displayName: {
      label: "نام نمایشی",
      inputType: "TextField",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
    categoryId: {
      label: "دسته‌بندی",
      inputType: "Select",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
    // description: {
    // 	label: "توضیحات",
    // 	inputType: "TextField",
    // 	renderCustomInput: false,
    // 	classes: "mt-10",
    // 	styles: null,
    // 	props: {
    // 		fullWidth: true,
    // 	}
    // },
    pageOrder: {
      label: "ترتیب صفحه",
      inputType: "TextField",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
    hasDetailsPage: {
      label: "صفحه اختصاصی دارد؟",
      inputType: "CheckBox",
      renderCustomInput: false,
      classes: "mt-10",
      styles: null,
      props: {
        fullWidth: true,
      },
    },
  }
  const createItemProps = {
    zodSchema: subCategorySchema,
    defaultValues: {
      name: "",
      nameEn: "",
      categoryId: 0,
      pageOrder: 0,
      hasDetailsPage: false,
    },
    formHeaderTitle: "ثبت زیرشاخه جدید",
    formEngine: "UNIFORMS",
    formValidationStruct: "ZOD_SCHEMA",
    formGenerationType: "MANUAL",
    hideSubmitField: false,
    formFieldsInputTypes,
    onCreate: async (vals) => handleCreate(vals),
    buttonLabel: "افزودن زیرشاخه جدید",
    dialogTitle: "ایجاد زیرشاخه جدید",
  };

  const editItemProps = {
    zodSchema: subCategorySchema,
    formHeaderTitle: 'ویرایش زیرشاخه',
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
      useListQueryHook={useGetSubCategoriesQuery} // listing
      useCreateMutationHook={useCreateSubCategoryMutation} // create
      useUpdateMutationHook={useUpdateSubCategoryMutation} // update
      useDeleteMutationHook={useDeleteSubCategoryMutation} // delete
      rowActions={rowActions}
      createItemProps={createItemProps}
      editItemProps={editItemProps}
      enableBuiltInEditing={false}
      renderTopToolbarCustomActionsClasses="flex justify-start px-8 py-16"
      enableFilters
      enableGlobalFilter
      enableColumnFilters
      enableFacetedValues
      columnFilterDisplayMode="popover"
      initialState={{
        showColumnFilters: false,
        showGlobalFilter: true,
        density: 'comfortable',
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      }}
      localization={{
        filterByColumn: 'فیلتر بر اساس {column}',
        filteringByColumn: 'فیلتر شده بر اساس {column}',
        hideColumn: 'پنهان کردن {column}',
        sortByColumnAsc: 'مرتب‌سازی {column} صعودی',
        sortByColumnDesc: 'مرتب‌سازی {column} نزولی',
        globalFilterPlaceholder: 'جستجو در همه ستون‌ها...',
      }}
      // renderTopToolbarCustomActions={() => (
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
      /* <div /> */
      // )*/}
    />
  );
}

export default SubCategoryTable;
