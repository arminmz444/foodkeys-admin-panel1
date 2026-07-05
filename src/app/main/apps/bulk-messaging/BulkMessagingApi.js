import { apiService as api } from "app/store/apiService";

const addTagTypes = [
	"BulkMessagingTasks",
	"BulkMessagingTask",
	"BulkMessagingTemplates",
	"BulkMessagingReport",
	"SubCategories"
];

const BulkMessagingApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * GET /bulk-messaging/tasks — list all bulk messaging tasks
		 * Query params: pageNumber, pageSize, search, status
		 */
		getBulkMessagingTasks: builder.query({
			query: ({ pageNumber = 1, pageSize = 10, search = "", status = "" }) => ({
				url: `/bulk-messaging/tasks?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&status=${status}`,
				method: "GET"
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };

				if (response?.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageIndex = response.pagination.pageIndex;
				}

				return data;
			},
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({
								type: "BulkMessagingTasks",
								id
							})),
							{ type: "BulkMessagingTasks", id: "LIST" }
						]
					: [{ type: "BulkMessagingTasks", id: "LIST" }],
			keepUnusedDataFor: 60
		}),

		/**
		 * GET /bulk-messaging/tasks/:id — single task details
		 */
		getBulkMessagingTask: builder.query({
			query: (id) => ({
				url: `/bulk-messaging/tasks/${id}`,
				method: "GET"
			}),
			transformResponse: (response) => response?.data,
			providesTags: (result, error, id) => [{ type: "BulkMessagingTask", id }]
		}),

		/**
		 * GET /bulk-messaging/tasks/:id/report — detailed report for a finished task
		 * Returns: { totalRecipients, successCount, failureCount, details: [...] }
		 */
		getBulkMessagingReport: builder.query({
			query: (id) => ({
				url: `/bulk-messaging/tasks/${id}/report`,
				method: "GET"
			}),
			transformResponse: (response) => response?.data,
			providesTags: (result, error, id) => [{ type: "BulkMessagingReport", id }],
			keepUnusedDataFor: 300
		}),

		/**
		 * POST /bulk-messaging/tasks — create a new bulk messaging task
		 * Body: {
		 *   targetType: "users" | "subcategories",
		 *   subcategoryIds?: number[],
		 *   excludedUsernames?: string[],
		 *   mediums: ("whatsapp"|"telegram"|"bale"|"email"|"sms")[],
		 *   messageContent: string,
		 *   templateId?: number
		 * }
		 */
		createBulkMessagingTask: builder.mutation({
			query: (taskData) => ({
				url: "/bulk-messaging/tasks",
				method: "POST",
				data: taskData
			}),
			invalidatesTags: [{ type: "BulkMessagingTasks", id: "LIST" }]
		}),

		/**
		 * POST /bulk-messaging/tasks/:id/cancel — cancel a pending task
		 */
		cancelBulkMessagingTask: builder.mutation({
			query: (id) => ({
				url: `/bulk-messaging/tasks/${id}/cancel`,
				method: "POST"
			}),
			invalidatesTags: (result, error, id) => [
				{ type: "BulkMessagingTasks", id: "LIST" },
				{ type: "BulkMessagingTask", id }
			]
		}),

		/**
		 * GET /bulk-messaging/templates — list saved message templates
		 */
		getBulkMessagingTemplates: builder.query({
			query: () => ({
				url: "/bulk-messaging/templates",
				method: "GET"
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result) =>
				result?.length
					? [
							...result.map(({ id }) => ({
								type: "BulkMessagingTemplates",
								id
							})),
							{ type: "BulkMessagingTemplates", id: "LIST" }
						]
					: [{ type: "BulkMessagingTemplates", id: "LIST" }],
			keepUnusedDataFor: 600
		}),

		/**
		 * POST /bulk-messaging/templates — save a new message template
		 * Body: { name: string, content: string }
		 */
		createBulkMessagingTemplate: builder.mutation({
			query: (templateData) => ({
				url: "/bulk-messaging/templates",
				method: "POST",
				data: templateData
			}),
			invalidatesTags: [{ type: "BulkMessagingTemplates", id: "LIST" }]
		}),

		/**
		 * DELETE /bulk-messaging/templates/:id — delete a template
		 */
		deleteBulkMessagingTemplate: builder.mutation({
			query: (id) => ({
				url: `/bulk-messaging/templates/${id}`,
				method: "DELETE"
			}),
			invalidatesTags: (result, error, id) => [
				{ type: "BulkMessagingTemplates", id },
				{ type: "BulkMessagingTemplates", id: "LIST" }
			]
		}),

		/**
		 * GET /bulk-messaging/audience-criteria — audience resolution options
		 */
		getAudienceCriteria: builder.query({
			query: () => ({
				url: "/bulk-messaging/audience-criteria",
				method: "GET"
			}),
			transformResponse: (response) => response?.data || [],
			keepUnusedDataFor: 3600
		}),
		getSubCategoriesForMessaging: builder.query({
			query: ({ search = "" } = {}) => ({
				url: `/subcategory?pageNumber=1&pageSize=1000&search=${encodeURIComponent(search)}`,
				method: "GET"
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: "SubCategories", id: "LIST" }],
			keepUnusedDataFor: 3600
		}),

		/**
		 * POST /bulk-messaging/audience-preview — preview resolved audience
		 * Query: pageNumber, pageSize
		 * Body: BulkMessagingAudiencePreviewRequestDTO
		 */
		previewAudience: builder.mutation({
			query: ({ pageNumber = 1, pageSize = 50, ...body }) => ({
				url: `/bulk-messaging/audience-preview?pageNumber=${pageNumber}&pageSize=${pageSize}`,
				method: "POST",
				data: body
			}),
			transformResponse: (response) => response?.data
		}),

		/**
		 * POST /bulk-messaging/parse-exclusion-file — upload Excel with usernames to exclude
		 * Body: FormData with file field
		 * Returns: { usernames: string[] }
		 */
		parseExclusionFile: builder.mutation({
			query: (formData) => ({
				url: "/bulk-messaging/parse-exclusion-file",
				method: "POST",
				data: formData
			})
		})
	}),
	overrideExisting: false
});

export default BulkMessagingApi;

export const {
	useGetBulkMessagingTasksQuery,
	useGetBulkMessagingTaskQuery,
	useGetBulkMessagingReportQuery,
	useCreateBulkMessagingTaskMutation,
	useCancelBulkMessagingTaskMutation,
	useGetBulkMessagingTemplatesQuery,
	useCreateBulkMessagingTemplateMutation,
	useDeleteBulkMessagingTemplateMutation,
	useGetSubCategoriesForMessagingQuery,
	useParseExclusionFileMutation,
	useGetAudienceCriteriaQuery,
	usePreviewAudienceMutation
} = BulkMessagingApi;
