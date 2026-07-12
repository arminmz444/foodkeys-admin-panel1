import { createSelector } from "@reduxjs/toolkit";
import { apiService as api } from "app/store/apiService";

export const addTagTypes = ["finance_dashboard_widgets"];
const FinanceDashboardApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getFinanceDashboardWidgets: build.query({
        query: (params = {}) => {
          const queryParams = {};
          if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
          if (params.dateTo) queryParams.dateTo = params.dateTo;
          if (params.status) queryParams.status = params.status;
          if (params.user) queryParams.user = params.user;
          if (params.userId) queryParams.userId = params.userId;
          if (params.transactionType && params.transactionType !== "all") {
            queryParams.transactionType = params.transactionType;
          }
          if (params.granularity) queryParams.granularity = params.granularity;
          return {
            url: `/dashboard/finance/widgets/all`,
            params: queryParams,
          };
        },
        transformResponse: (response) => response.data,
        providesTags: ["finance_dashboard_widgets"],
      }),
      getTransactions: build.query({
        query: (params) => ({
          url: "/transaction",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Transaction", id })),
                { type: "Transaction", id: "LIST" },
              ]
            : [{ type: "Transaction", id: "LIST" }],
      }),

      getMyTransactions: build.query({
        query: (params) => ({
          url: "/transaction",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Transaction", id })),
                { type: "Transaction", id: "MY_LIST" },
              ]
            : [{ type: "Transaction", id: "MY_LIST" }],
      }),

      getTransactionById: build.query({
        query: (id) => ({url: `/transaction/${id}`}),
        transformResponse: (response) => response.data,
        providesTags: (result, error, id) => [{ type: "Transaction", id }],
      }),

      // Payments
      getPayments: build.query({
        query: (params) => ({
          url: "/payment",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Payment", id })),
                { type: "Payment", id: "LIST" },
              ]
            : [{ type: "Payment", id: "LIST" }],
      }),

      getMyPayments: build.query({
        query: (params) => ({
          url: "/payment",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Payment", id })),
                { type: "Payment", id: "MY_LIST" },
              ]
            : [{ type: "Payment", id: "MY_LIST" }],
      }),

      getPaymentById: build.query({
        query: (id) => `payments/${id}`,
        transformResponse: (response) => response.data,
        providesTags: (result, error, id) => [{ type: "Payment", id }],
      }),

      startPayment: build.mutation({
        query: ({ clientId, data }) => ({
          url: `payments/start/${clientId}`,
          method: "POST",
          body: data,
        }),
        transformResponse: (response) => response.data,
        invalidatesTags: [
          { type: "Payment", id: "LIST" },
          { type: "Payment", id: "MY_LIST" },
          { type: "Transaction", id: "LIST" },
          { type: "Transaction", id: "MY_LIST" },
          "Dashboard",
        ],
      }),

      updatePaymentStatus: build.mutation({
        query: ({ id, status }) => ({
          url: `payments/${id}/status`,
          method: "PUT",
          params: { status },
        }),
        transformResponse: (response) => response.data,
        invalidatesTags: (result, error, { id }) => [
          { type: "Payment", id },
          { type: "Payment", id: "LIST" },
          { type: "Payment", id: "MY_LIST" },
          "Dashboard",
        ],
      }),

      generateBill: build.mutation({
        query: (transactionId) => ({
          url: `/billing-info/generate-bill/${transactionId}`,
          method: "POST",
          responseType: "blob",
        }),
      }),

      // Bills
      getBills: build.query({
        query: (params) => ({
          url: "bills",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Bill", id })),
                { type: "Bill", id: "LIST" },
              ]
            : [{ type: "Bill", id: "LIST" }],
      }),

      getMyBills: build.query({
        query: (params) => ({
          url: "bills/me",
          params,
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Bill", id })),
                { type: "Bill", id: "MY_LIST" },
              ]
            : [{ type: "Bill", id: "MY_LIST" }],
      }),

      getBillById: build.query({
        query: (id) => `bills/${id}`,
        transformResponse: (response) => response.data,
        providesTags: (result, error, id) => [{ type: "Bill", id }],
      }),

      // User Info
      getUserInfo: build.query({
        query: (userId) => ({ url: `/user/${userId}` }),
        transformResponse: (response) => response.data,
        providesTags: (result, error, userId) => [{ type: "User", id: userId }],
      }),

      // Filtered Transactions (for dashboard)
      getFilteredTransactions: build.query({
        query: ({ startDate, endDate, status, username, page = 0, size = 10 }) => ({
          url: "/transaction",
          params: { startDate, endDate, status, username, page, size },
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Transaction", id })),
                { type: "Transaction", id: "FILTERED_LIST" },
              ]
            : [{ type: "Transaction", id: "FILTERED_LIST" }],
      }),

      // Filtered Payments (for dashboard)
      getFilteredPayments: build.query({
        query: ({ startDate, endDate, status, username, page = 0, size = 10 }) => ({
          url: "/payment",
          params: { startDate, endDate, status, username, page, size },
        }),
        transformResponse: (response) => ({
          data: response.data,
          pagination: response.pagination,
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({ type: "Payment", id })),
                { type: "Payment", id: "FILTERED_LIST" },
              ]
            : [{ type: "Payment", id: "FILTERED_LIST" }],
      }),
    }),
    overrideExisting: false,
  });
export default FinanceDashboardApi;
export const {
  useGetFinanceDashboardWidgetsQuery,
  useGetTransactionsQuery,
  useGetMyTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetPaymentsQuery,
  useGetMyPaymentsQuery,
  useGetPaymentByIdQuery,
  useStartPaymentMutation,
  useUpdatePaymentStatusMutation,
  useGenerateBillMutation,
  useGetBillsQuery,
  useGetMyBillsQuery,
  useGetBillByIdQuery,
  useGetUserInfoQuery,
  useGetFilteredTransactionsQuery,
  useGetFilteredPaymentsQuery,
} = FinanceDashboardApi;
export const selectFinanceDashboardWidgets = createSelector(
  FinanceDashboardApi.endpoints.getFinanceDashboardWidgets.select(),
  (results) => results.data
);
export const selectWidget = (id) =>
  createSelector(selectFinanceDashboardWidgets, (widgets) => {
    return widgets?.[id];
  });
