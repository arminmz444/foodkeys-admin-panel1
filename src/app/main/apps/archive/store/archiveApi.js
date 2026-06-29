import { createSelector } from "@reduxjs/toolkit";
import { apiService as api } from "app/store/apiService";
import FuseUtils from "@fuse/utils";
import { selectSearchText } from "./archiveAppSlice";

export const addTagTypes = [
  "Archive",
  "archives",
  "Archives",
  "ArchiveTask",
  "archiveTasks",
  "ArchiveTasks",
];

const ArchiveApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getArchives: build.query({
        query: (params) => ({
          url: `/archives`,
          params,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "Archive", id })),
                { type: "Archives", id: "LIST" },
                { type: "archives", id: "LIST" },
              ]
            : [{ type: "Archives", id: "LIST" }, { type: "archives", id: "LIST" }],
        transformResponse: (response) => {
          return {
            data: response?.data || [],
            pagination: response?.pagination || {
              totalPages: 1,
              totalElements: 0,
              pageSize: 10,
              pageNumber: 0,
            },
          };
        },
        refetchOnMountOrArgChange: true,
      }),
      getArchiveTasks: build.query({
        query: (params) => ({
          url: `/archive-tasks`,
          params,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "ArchiveTask", id })),
                { type: "ArchiveTasks", id: "LIST" },
                { type: "archiveTasks", id: "LIST" },
              ]
            : [{ type: "ArchiveTasks", id: "LIST" }, { type: "archiveTasks", id: "LIST" }],
        transformResponse: (response) => {
          return {
            data: response?.data || [],
            pagination: response?.pagination || {
              totalPages: 1,
              totalElements: 0,
              pageSize: 10,
              pageNumber: 0,
            },
          };
        },
        refetchOnMountOrArgChange: true,
      }),
      getArchivesList: build.query({
        query: (paginationParams) => ({
          url: `/archives`,
          params: paginationParams,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "Archive", id })),
                { type: "archives", id: "LIST" },
                { type: "Archives", id: "LIST" },
              ]
            : [{ type: "archives", id: "LIST" }, { type: "Archives", id: "LIST" }],
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
        refetchOnMountOrArgChange: true,
      }),
      getArchiveTypes: build.query({
        query: () => ({ url: `/archives/types` }),
        transformResponse: (response) => response?.data,
        providesTags: ["archiveTypes"],
        refetchOnMountOrArgChange: true,
      }),
      rollbackToArchive: build.mutation({
        query: ({ archiveId, reason }) => ({
          url: `/archives/rollback/${archiveId}`,
          method: "POST",
          params: { reason },
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [
          { type: "archives", id: "LIST" },
          { type: "Archives", id: "LIST" },
          { type: "Archives", id: "ENTITY_LIST" },
        ],
      }),
      searchArchiveTasks: build.mutation({
        query: ({ search, ...paginationParams }) => ({
          url: `/archive-tasks/search`,
          method: "POST",
          data: search,
          params: paginationParams,
        }),
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
      }),
      deleteArchive: build.mutation({
        query: (id) => ({
          url: `/archives/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Archive", id },
          { type: "archives", id: "LIST" },
          { type: "Archives", id: "LIST" },
          { type: "Archives", id: "ENTITY_LIST" },
        ],
      }),
      createArchiveTask: build.mutation({
        query: (taskData) => ({
          url: `/archive-tasks`,
          method: "POST",
          data: taskData,
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [
          { type: "archiveTasks", id: "LIST" },
          { type: "ArchiveTasks", id: "LIST" },
          { type: "archiveTasks", id: "ENTITY_LIST" },
          { type: "archiveTasks", id: "STATUS_LIST" },
        ],
      }),
      processArchiveTask: build.mutation({
        query: (id) => ({
          url: `/archive-tasks/${id}/process`,
          method: "POST",
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, id) => [
          { type: "ArchiveTask", id },
          { type: "archiveTasks", id: "LIST" },
          { type: "ArchiveTasks", id: "LIST" },
          { type: "archiveTasks", id: "ENTITY_LIST" },
          { type: "archiveTasks", id: "STATUS_LIST" },
          { type: "archives", id: "LIST" },
          { type: "Archives", id: "LIST" },
          { type: "Archives", id: "ENTITY_LIST" },
          { type: "Archive", id: "LIST" },
        ],
      }),
      getArchivesByEntity: build.query({
        query: ({ entityType, entityId, ...params }) => ({
          url: `/archives/entity/${entityType}/${entityId}`,
          params,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "Archive", id })),
                { type: "Archives", id: "ENTITY_LIST" },
              ]
            : [{ type: "Archives", id: "ENTITY_LIST" }],
        transformResponse: (response) => {
          return {
            data: response?.data || [],
            pagination: response?.pagination || {
              totalPages: 1,
              totalElements: 0,
              pageSize: 10,
              pageNumber: 0,
            },
          };
        },
        refetchOnMountOrArgChange: true,
      }),
      
      getArchiveTasksList: build.query({
        query: (paginationParams) => ({
          url: `/archive-tasks`,
          params: paginationParams,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "ArchiveTask", id })),
                { type: "archiveTasks", id: "LIST" },
                { type: "ArchiveTasks", id: "LIST" },
              ]
            : [{ type: "archiveTasks", id: "LIST" }, { type: "ArchiveTasks", id: "LIST" }],
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
        refetchOnMountOrArgChange: true,
      }),
      compareArchives: build.query({
        query: ({ archiveId1, archiveId2 }) => ({
          url: `/archives/compare`,
          params: { archiveId1, archiveId2 },
        }),
        transformResponse: (response) => response?.data,
      }),
      getArchiveById: build.query({
        query: (archiveId) => ({ url: `/archives/${archiveId}` }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, archiveId) => [{ type: "Archive", id: archiveId }],
        refetchOnMountOrArgChange: true,
      }),
      getArchiveTasksByStatus: build.query({
        query: ({ status, ...paginationParams }) => ({
          url: `/archive-tasks/status/${status}`,
          params: paginationParams,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "ArchiveTask", id })),
                { type: "archiveTasks", id: "STATUS_LIST" },
              ]
            : [{ type: "archiveTasks", id: "STATUS_LIST" }],
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
        refetchOnMountOrArgChange: true,
      }),
      getArchiveTasksByEntity: build.query({
        query: ({ entityType, entityId, ...paginationParams }) => ({
          url: `/archive-tasks/entity/${entityType}/${entityId}`,
          params: paginationParams,
        }),
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "ArchiveTask", id })),
                { type: "archiveTasks", id: "ENTITY_LIST" },
              ]
            : [{ type: "archiveTasks", id: "ENTITY_LIST" }],
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
        refetchOnMountOrArgChange: true,
      }),

      cancelArchiveTask: build.mutation({
        query: (id) => ({
          url: `/archive-tasks/${id}/cancel`,
          method: "POST",
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, id) => [
          { type: "ArchiveTask", id },
          { type: "archiveTasks", id: "LIST" },
          { type: "ArchiveTasks", id: "LIST" },
          { type: "archiveTasks", id: "ENTITY_LIST" },
          { type: "archiveTasks", id: "STATUS_LIST" },
        ],
      }),
      searchArchives: build.mutation({
        query: ({ search, ...paginationParams }) => ({
          url: `/archives/search`,
          method: "POST",
          data: search,
          params: paginationParams,
        }),
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageIndex;
          }

          return data;
        },
      }),
      getArchiveTaskById: build.query({
        query: (taskId) => ({ url: `/archive-tasks/${taskId}` }),
        // transformResponse: (response) => response?.data,
        providesTags: (result, error, taskId) => [{ type: "ArchiveTask", id: taskId }],
        refetchOnMountOrArgChange: true,
      }),
      deleteArchiveTask: build.mutation({
        query: (id) => ({
          url: `/archive-tasks/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "ArchiveTask", id },
          { type: "archiveTasks", id: "LIST" },
          { type: "ArchiveTasks", id: "LIST" },
          { type: "archiveTasks", id: "ENTITY_LIST" },
          { type: "archiveTasks", id: "STATUS_LIST" },
        ],
      }),
    }),
    overrideExisting: false,
  });

export default ArchiveApi;
export const {
  useGetArchiveTasksQuery,
  useGetArchivesQuery,
  useGetArchivesListQuery,
  useGetArchiveByIdQuery,
  useGetArchivesByEntityQuery,
  useGetArchiveTypesQuery,
  useSearchArchivesMutation,
  useCompareArchivesQuery,
  useRollbackToArchiveMutation,
  useDeleteArchiveMutation,
  useGetArchiveTasksListQuery,
  useGetArchiveTaskByIdQuery,
  useGetArchiveTasksByEntityQuery,
  useGetArchiveTasksByStatusQuery,
  useSearchArchiveTasksMutation,
  useCreateArchiveTaskMutation,
  useProcessArchiveTaskMutation,
  useCancelArchiveTaskMutation,
  useDeleteArchiveTaskMutation,
} = ArchiveApi;


export const selectFilteredArchiveList = (archives) =>
  createSelector([selectSearchText], (searchText) => {
    if (!archives) {
      return [];
    }

    if (searchText.length === 0) {
      return archives;
    }

    return FuseUtils.filterArrayByString(archives, searchText);
  });


export const selectFilteredArchiveTaskList = (tasks) =>
  createSelector([selectSearchText], (searchText) => {
    if (!tasks) {
      return [];
    }

    if (searchText.length === 0) {
      return tasks;
    }

    return FuseUtils.filterArrayByString(tasks, searchText);
  });


export const selectGroupedArchives = (archives) =>
  createSelector([selectFilteredArchiveList(archives)], (archives) => {
    if (!archives) {
      return {};
    }

    return archives.reduce((acc, archive) => {
      const type = archive.archiveType || "OTHER";

      if (!acc[type]) {
        acc[type] = { type, children: [archive] };
      } else {
        acc[type].children.push(archive);
      }

      return acc;
    }, {});
  });


export const selectArchivesByEntityType = (archives) =>
  createSelector([selectFilteredArchiveList(archives)], (archives) => {
    if (!archives) {
      return {};
    }

    return archives.reduce((acc, archive) => {
      const entityType = archive.entityType || "OTHER";

      if (!acc[entityType]) {
        acc[entityType] = { type: entityType, children: [archive] };
      } else {
        acc[entityType].children.push(archive);
      }

      return acc;
    }, {});
  });
