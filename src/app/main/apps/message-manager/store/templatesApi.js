import { apiService as api } from 'app/store/apiService';

const addTagTypes = [
	'EmailTemplate',
	'SmsTemplate',
	'MessageTemplate',
	'Recipient',
	'TemplateType',
	'MessagingHistory'
];

const TemplatesApi = api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
	endpoints: (builder) => ({
		getTemplateTypes: builder.query({
			query: (medium) => ({
				url: '/message-template/types',
				method: 'GET',
				params: medium ? { medium } : undefined
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'TemplateType', id: 'LIST' }],
			keepUnusedDataFor: 300
		}),

		getMessageMediums: builder.query({
			query: () => ({
				url: '/message-template/mediums',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'TemplateType', id: 'MEDIUMS' }],
			keepUnusedDataFor: 600
		}),

		getAllTemplates: builder.query({
			query: () => ({
				url: '/message-template',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result) =>
				result?.length
					? [
							...result.map(({ id }) => ({ type: 'MessageTemplate', id })),
							{ type: 'MessageTemplate', id: 'LIST' }
						]
					: [{ type: 'MessageTemplate', id: 'LIST' }],
			keepUnusedDataFor: 120
		}),

		getTemplatesPaged: builder.query({
			query: ({
				page = 0,
				size = 10,
				sort = 'name',
				direction = 'asc',
				search = '',
				medium = ''
			} = {}) => ({
				url: '/message-template/paged',
				method: 'GET',
				params: {
					page,
					size,
					sort,
					direction,
					...(search ? { search } : {}),
					...(medium ? { medium } : {})
				}
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response?.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({ type: 'MessageTemplate', id })),
							{ type: 'MessageTemplate', id: 'PAGED' }
						]
					: [{ type: 'MessageTemplate', id: 'PAGED' }],
			keepUnusedDataFor: 60,
			refetchOnMountOrArgChange: true
		}),

		getTemplateById: builder.query({
			query: (id) => ({
				url: `/message-template/${id}`,
				method: 'GET'
			}),
			transformResponse: (response) => response?.data,
			providesTags: (_, __, id) => [{ type: 'MessageTemplate', id }],
			keepUnusedDataFor: 120
		}),

		getEmailTemplates: builder.query({
			query: () => ({
				url: '/message-template/email',
				method: 'GET'
			}),
			transformResponse: (response) => ({ data: response?.data || [] }),
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({ type: 'EmailTemplate', id })),
							{ type: 'EmailTemplate', id: 'LIST' },
							{ type: 'MessageTemplate', id: 'LIST' }
						]
					: [
							{ type: 'EmailTemplate', id: 'LIST' },
							{ type: 'MessageTemplate', id: 'LIST' }
						],
			keepUnusedDataFor: 120,
			refetchOnMountOrArgChange: true
		}),

		getSmsTemplates: builder.query({
			query: () => ({
				url: '/message-template/sms',
				method: 'GET'
			}),
			transformResponse: (response) => ({ data: response?.data || [] }),
			providesTags: (result) =>
				result?.data?.length
					? [
							...result.data.map(({ id }) => ({ type: 'SmsTemplate', id })),
							{ type: 'SmsTemplate', id: 'LIST' },
							{ type: 'MessageTemplate', id: 'LIST' }
						]
					: [
							{ type: 'SmsTemplate', id: 'LIST' },
							{ type: 'MessageTemplate', id: 'LIST' }
						],
			keepUnusedDataFor: 120,
			refetchOnMountOrArgChange: true
		}),

		getSystemTemplates: builder.query({
			query: () => ({
				url: '/message-template/system',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'MessageTemplate', id: 'SYSTEM' }],
			keepUnusedDataFor: 300
		}),

		getCustomTemplates: builder.query({
			query: () => ({
				url: '/message-template/custom',
				method: 'GET'
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: [{ type: 'MessageTemplate', id: 'CUSTOM' }],
			keepUnusedDataFor: 120
		}),

		createEmailTemplate: builder.mutation({
			query: (template) => ({
				url: '/message-template',
				method: 'POST',
				data: {
					...template,
					medium: 'EMAIL',
					templateType: template.templateType?.toUpperCase?.() || template.templateType,
					createdAt: null,
					updatedAt: null
				}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [
				{ type: 'EmailTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' },
				{ type: 'MessageTemplate', id: 'CUSTOM' }
			]
		}),

		updateEmailTemplate: builder.mutation({
			query: (template) => ({
				url: `/message-template/${template.id}`,
				method: 'PUT',
				data: {
					...template,
					templateType: template.templateType?.toUpperCase?.() || template.templateType,
					createdAt: null,
					updatedAt: null
				}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'EmailTemplate', id },
				{ type: 'EmailTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' }
			]
		}),

		deleteEmailTemplate: builder.mutation({
			query: (id) => ({
				url: `/message-template/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_, __, id) => [
				{ type: 'EmailTemplate', id },
				{ type: 'EmailTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' },
				{ type: 'MessageTemplate', id: 'CUSTOM' }
			]
		}),

		createSmsTemplate: builder.mutation({
			query: (template) => ({
				url: '/message-template',
				method: 'POST',
				data: {
					...template,
					medium: 'SMS',
					templateType: template.templateType?.toUpperCase?.() || template.templateType
				}
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [
				{ type: 'SmsTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' },
				{ type: 'MessageTemplate', id: 'CUSTOM' }
			]
		}),

		updateSmsTemplate: builder.mutation({
			query: (template) => ({
				url: `/message-template/${template.id}`,
				method: 'PUT',
				data: template
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'SmsTemplate', id },
				{ type: 'SmsTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' }
			]
		}),

		deleteSmsTemplate: builder.mutation({
			query: (id) => ({
				url: `/message-template/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_, __, id) => [
				{ type: 'SmsTemplate', id },
				{ type: 'SmsTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' },
				{ type: 'MessageTemplate', id: 'CUSTOM' }
			]
		}),

		toggleTemplateStatus: builder.mutation({
			query: ({ id, enabled }) => ({
				url: `/message-template/${id}/status`,
				method: 'PATCH',
				params: { enabled }
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'EmailTemplate', id },
				{ type: 'EmailTemplate', id: 'LIST' },
				{ type: 'SmsTemplate', id },
				{ type: 'SmsTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'PAGED' }
			]
		}),

		initializeSystemTemplates: builder.mutation({
			query: () => ({
				url: '/message-template/initialize',
				method: 'POST'
			}),
			invalidatesTags: [
				{ type: 'EmailTemplate', id: 'LIST' },
				{ type: 'SmsTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'LIST' },
				{ type: 'MessageTemplate', id: 'SYSTEM' },
				{ type: 'MessageTemplate', id: 'PAGED' }
			]
		}),

		getRecipients: builder.query({
			query: (medium) => ({
				url: '/recipient',
				method: 'GET',
				params: medium ? { medium } : undefined
			}),
			transformResponse: (response) => response?.data || [],
			providesTags: (result) =>
				result?.length
					? [
							...result.map(({ id }) => ({ type: 'Recipient', id })),
							{ type: 'Recipient', id: 'LIST' }
						]
					: [{ type: 'Recipient', id: 'LIST' }],
			keepUnusedDataFor: 60,
			refetchOnMountOrArgChange: true
		}),

		addRecipient: builder.mutation({
			query: (recipient) => ({
				url: '/recipient',
				method: 'POST',
				data: recipient
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [{ type: 'Recipient', id: 'LIST' }]
		}),

		updateRecipient: builder.mutation({
			query: (recipient) => ({
				url: `/recipient/${recipient.id}`,
				method: 'PUT',
				data: recipient
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: (_, __, { id }) => [
				{ type: 'Recipient', id },
				{ type: 'Recipient', id: 'LIST' }
			]
		}),

		deleteRecipient: builder.mutation({
			query: (id) => ({
				url: `/recipient/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_, __, id) => [
				{ type: 'Recipient', id },
				{ type: 'Recipient', id: 'LIST' }
			]
		}),

		testSendEmail: builder.mutation({
			query: (data) => ({
				url: '/message-template/test/email',
				method: 'POST',
				data
			}),
			invalidatesTags: [{ type: 'MessagingHistory', id: 'LIST' }]
		}),

		testSendSms: builder.mutation({
			query: (data) => ({
				url: '/message-template/test/sms',
				method: 'POST',
				data
			}),
			invalidatesTags: [{ type: 'MessagingHistory', id: 'LIST' }]
		}),

		sendBulkEmail: builder.mutation({
			query: (data) => ({
				url: '/message-template/test/bulk/email',
				method: 'POST',
				data
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [{ type: 'MessagingHistory', id: 'LIST' }]
		}),

		sendBulkSms: builder.mutation({
			query: (data) => ({
				url: '/message-template/test/bulk/sms',
				method: 'POST',
				data
			}),
			transformResponse: (response) => response?.data,
			invalidatesTags: [{ type: 'MessagingHistory', id: 'LIST' }]
		}),

		getMessagingHistory: builder.query({
			query: ({ userId, pageNumber = 1, pageSize = 20 } = {}) => ({
				url: '/messaging/history',
				method: 'GET',
				params: {
					pageNumber,
					pageSize,
					...(userId != null ? { userId } : {})
				}
			}),
			transformResponse: (response) => {
				const data = { data: response?.data || [] };
				if (response?.pagination) {
					data.totalPages = response.pagination.totalPages;
					data.totalElements = response.pagination.totalElements;
					data.pageSize = response.pagination.pageSize;
					data.pageNumber = response.pagination.pageNumber;
				}
				return data;
			},
			providesTags: [{ type: 'MessagingHistory', id: 'LIST' }],
			keepUnusedDataFor: 30,
			refetchOnMountOrArgChange: true
		})
	}),
	overrideExisting: true
});

export default TemplatesApi;

export const {
	useGetTemplateTypesQuery,
	useGetMessageMediumsQuery,
	useGetAllTemplatesQuery,
	useGetTemplatesPagedQuery,
	useGetTemplateByIdQuery,
	useGetEmailTemplatesQuery,
	useGetSmsTemplatesQuery,
	useGetSystemTemplatesQuery,
	useGetCustomTemplatesQuery,
	useCreateEmailTemplateMutation,
	useUpdateEmailTemplateMutation,
	useDeleteEmailTemplateMutation,
	useCreateSmsTemplateMutation,
	useUpdateSmsTemplateMutation,
	useDeleteSmsTemplateMutation,
	useToggleTemplateStatusMutation,
	useInitializeSystemTemplatesMutation,
	useGetRecipientsQuery,
	useAddRecipientMutation,
	useUpdateRecipientMutation,
	useDeleteRecipientMutation,
	useTestSendEmailMutation,
	useTestSendSmsMutation,
	useSendBulkEmailMutation,
	useSendBulkSmsMutation,
	useGetMessagingHistoryQuery
} = TemplatesApi;

// Backwards-compatible aliases used by older components
export const useGetEmailTemplateByIdQuery = useGetTemplateByIdQuery;
export const useGetSmsTemplateByIdQuery = useGetTemplateByIdQuery;
