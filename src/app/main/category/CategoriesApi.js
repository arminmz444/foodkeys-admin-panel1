import { apiService as api } from "app/store/apiService";

// Tag types for category
const addTagTypes = ["Category"]

const CategoryApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
	getCategoryOptions: builder.query({
      query: ({ pageNumber, pageSize, search, sort, filter }) => ({
        url: `/category/options?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&sort=${(sort && Object.entries(sort)?.length && JSON.stringify(sort)) || ""}&filter=${(filter && Object.entries(filter)?.length && JSON.stringify(filter)) || ""}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = { data: response?.data };

        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }

        // console.log(`response: ${JSON.stringify(response)}`);
        // console.log(`Data: ${JSON.stringify(data)}`);
        return data;
      },
      providesTags: (result) =>
        [{ type: "Category", id: "LIST" }],
      keepUnusedDataFor: 3600,
    }),

    // GET /category => fetch all categories
    getCategories: builder.query({
      query: ({ pageNumber, pageSize, search, sort, filter }) => ({
        url: `/category?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&sort=${(sort && Object.entries(sort)?.length && JSON.stringify(sort)) || ""}&filter=${(filter && Object.entries(filter)?.length && JSON.stringify(filter)) || ""}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const data = { data: response?.data };

        if (response && response.pagination) {
          data.totalPages = response.pagination.totalPages;
          data.totalElements = response.pagination.totalElements;
          data.pageSize = response.pagination.pageSize;
          data.pageIndex = response.pagination.pageIndex;
        }

        // console.log(`response: ${JSON.stringify(response)}`);
        console.log(`Categories Data: ${JSON.stringify(response?.data)}`);
        return data;
      },
      providesTags: (result) =>
        result && result.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({ type: "Category", id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
      keepUnusedDataFor: 3600,
    }),

    // GET /category/{id} => fetch single category
    getCategory: builder.query({
      query: (id) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation({
      query: (newCat) => ({
        url: "/category/",
        method: "POST",
        data: newCat,
      }),
      transformResponse: (response) => response,
      // onMutate: (newUserInfo: User) => {
      // 	queryClient.setQueryData(
      // 		['users'],
      // 		(prevUsers: any) =>
      // 			[
      // 				...prevUsers,
      // 				{
      // 					...newUserInfo,
      // 					id: (Math.random() + 1).toString(36).substring(7),
      // 				},
      // 			] as User[],
      // );
      // },
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    // PUT /category/{id} => update existing category
    updateCategory: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/category/${id}`,
        method: "PUT",
        data: rest,
      }),
      transformResponse: (response) => response?.data,
      // Invalidate both the individual category and the LIST tag so that the
      // cached `/category/options` result (used to build the Banks navigation)
      // is refetched when a category is updated.
      invalidatesTags: (result, error, arg) => [
        { type: "Category", id: arg?.id },
        { type: "Category", id: "LIST" },
      ],
    }),

    // DELETE /category/{id} => delete existing category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data,
      // Invalidate the LIST tag as well so the Banks navigation rebuilds after
      // a category is removed.
      invalidatesTags: (result, error, arg) => [
        { type: "Category", id: typeof arg === "object" ? arg?.id : arg },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export default CategoryApi;

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetCategoryOptionsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetECommerceProductsQuery,
  useDeleteECommerceProductsMutation,
  useGetECommerceProductQuery,
  useUpdateECommerceProductMutation,
  useDeleteECommerceProductMutation,
  useGetECommerceOrdersQuery,
  useGetECommerceOrderQuery,
  useUpdateECommerceOrderMutation,
  useDeleteECommerceOrderMutation,
  useDeleteECommerceOrdersMutation,
  useCreateECommerceProductMutation,
} = CategoryApi;
