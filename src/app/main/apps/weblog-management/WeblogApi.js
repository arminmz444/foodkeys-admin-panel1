import { apiService as api } from 'app/store/apiService';

export const addTagTypes = [
  'weblog_posts',
  'weblog_post',
  'weblog_categories',
  'weblog_category',
  'weblog_tags',
  'weblog_tag',
  'weblog_media',
  'weblog_media_item'
];

const WeblogApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // ==================== POSTS ====================
      getWeblogPosts: build.query({
        query: (params = {}) => ({
          url: `/admin/weblog/posts`,
          params: {
            page: params.page || 1,
            limit: params.limit || 10,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
            status: params.status,
            categoryId: params.categoryId,
            categorySlug: params.categorySlug,
            tagId: params.tagId,
            tagSlug: params.tagSlug,
            search: params.search,
            featured: params.featured
          }
        }),
        providesTags: ['weblog_posts'],
        transformResponse: (response) => response?.data || response
      }),

      getWeblogPost: build.query({
        query: ({ idOrSlug, view = false }) => ({
          url: `/admin/weblog/posts/${idOrSlug}`,
          params: { view }
        }),
        providesTags: ['weblog_post'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      createWeblogPost: build.mutation({
        query: (postData) => ({
          url: `/admin/weblog/posts`,
          method: 'POST',
          data: postData
        }),
        invalidatesTags: ['weblog_posts', 'weblog_post']
      }),

      updateWeblogPost: build.mutation({
        query: ({ id, ...postData }) => ({
          url: `/admin/weblog/posts/${id}`,
          method: 'PUT',
          data: postData
        }),
        invalidatesTags: ['weblog_posts', 'weblog_post']
      }),

      deleteWeblogPost: build.mutation({
        query: (id) => ({
          url: `/admin/weblog/posts/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['weblog_posts', 'weblog_post']
      }),

      // ==================== CATEGORIES ====================
      getWeblogCategories: build.query({
        query: (params = {}) => ({
          url: `/admin/weblog/categories`,
          params: {
            includeChildren: params.includeChildren || false,
            parentId: params.parentId
          }
        }),
        providesTags: ['weblog_categories'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      getWeblogCategory: build.query({
        query: (idOrSlug) => ({
          url: `/admin/weblog/categories/${idOrSlug}`
        }),
        providesTags: ['weblog_category'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      createWeblogCategory: build.mutation({
        query: (categoryData) => ({
          url: `/admin/weblog/categories`,
          method: 'POST',
          data: categoryData
        }),
        invalidatesTags: ['weblog_categories', 'weblog_category']
      }),

      updateWeblogCategory: build.mutation({
        query: ({ id, ...categoryData }) => ({
          url: `/admin/weblog/categories/${id}`,
          method: 'PUT',
          data: categoryData
        }),
        invalidatesTags: ['weblog_categories', 'weblog_category']
      }),

      deleteWeblogCategory: build.mutation({
        query: (id) => ({
          url: `/admin/weblog/categories/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['weblog_categories', 'weblog_category']
      }),

      // ==================== TAGS ====================
      getWeblogTags: build.query({
        query: (params = {}) => ({
          url: `/admin/weblog/tags`,
          params: {
            limit: params.limit,
            sortBy: params.sortBy
          }
        }),
        providesTags: ['weblog_tags'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      getWeblogTag: build.query({
        query: ({ idOrSlug, page = 1, limit = 10 }) => ({
          url: `/admin/weblog/tags/${idOrSlug}`,
          params: { page, limit }
        }),
        providesTags: ['weblog_tag'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      createWeblogTag: build.mutation({
        query: (tagData) => ({
          url: `/admin/weblog/tags`,
          method: 'POST',
          data: tagData
        }),
        invalidatesTags: ['weblog_tags', 'weblog_tag']
      }),

      bulkCreateWeblogTags: build.mutation({
        query: (tags) => ({
          url: `/admin/weblog/tags/bulk`,
          method: 'POST',
          data: { tags }
        }),
        invalidatesTags: ['weblog_tags']
      }),

      updateWeblogTag: build.mutation({
        query: ({ id, ...tagData }) => ({
          url: `/admin/weblog/tags/${id}`,
          method: 'PUT',
          data: tagData
        }),
        invalidatesTags: ['weblog_tags', 'weblog_tag']
      }),

      deleteWeblogTag: build.mutation({
        query: (id) => ({
          url: `/admin/weblog/tags/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['weblog_tags', 'weblog_tag']
      }),

      // ==================== MEDIA ====================
      getWeblogMedia: build.query({
        query: (params = {}) => ({
          url: `/admin/weblog/media`,
          params: {
            page: params.page || 1,
            limit: params.limit || 20,
            postId: params.postId
          }
        }),
        providesTags: ['weblog_media'],
        transformResponse: (response) => response?.data || response
      }),

      getWeblogMediaItem: build.query({
        query: (id) => ({
          url: `/admin/weblog/media/${id}`
        }),
        providesTags: ['weblog_media_item'],
        transformResponse: (response) => response?.data?.data || response?.data || response
      }),

      uploadWeblogMedia: build.mutation({
        query: ({ file, postId, alt }) => {
          const formData = new FormData();
          formData.append('file', file);
          if (postId) formData.append('postId', postId.toString());
          if (alt) formData.append('alt', alt);
          
          return {
            url: `/admin/weblog/media`,
            method: 'POST',
            data: formData
          };
        },
        invalidatesTags: ['weblog_media', 'weblog_media_item']
      }),

      updateWeblogMedia: build.mutation({
        query: ({ id, ...mediaData }) => ({
          url: `/admin/weblog/media/${id}`,
          method: 'PUT',
          data: mediaData
        }),
        invalidatesTags: ['weblog_media', 'weblog_media_item']
      }),

      deleteWeblogMedia: build.mutation({
        query: (id) => ({
          url: `/admin/weblog/media/${id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['weblog_media', 'weblog_media_item']
      }),

      // ==================== AUTH ====================
      verifyWeblogAuth: build.mutation({
        query: () => ({
          url: `/admin/weblog/auth/verify`,
          method: 'POST'
        })
      })
    }),
    overrideExisting: false
  });

export default WeblogApi;

export const {
  // Posts
  useGetWeblogPostsQuery,
  useGetWeblogPostQuery,
  useCreateWeblogPostMutation,
  useUpdateWeblogPostMutation,
  useDeleteWeblogPostMutation,
  // Categories
  useGetWeblogCategoriesQuery,
  useGetWeblogCategoryQuery,
  useCreateWeblogCategoryMutation,
  useUpdateWeblogCategoryMutation,
  useDeleteWeblogCategoryMutation,
  // Tags
  useGetWeblogTagsQuery,
  useGetWeblogTagQuery,
  useCreateWeblogTagMutation,
  useBulkCreateWeblogTagsMutation,
  useUpdateWeblogTagMutation,
  useDeleteWeblogTagMutation,
  // Media
  useGetWeblogMediaQuery,
  useGetWeblogMediaItemQuery,
  useUploadWeblogMediaMutation,
  useUpdateWeblogMediaMutation,
  useDeleteWeblogMediaMutation,
  // Auth
  useVerifyWeblogAuthMutation
} = WeblogApi;
