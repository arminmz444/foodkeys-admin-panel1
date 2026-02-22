import { apiService as api } from "app/store/apiService";

export const addTagTypes = [
  "User",
  "Role",
  "Access",
  "UserRole",
  "UserAccess",
  "RoleAccess",
  "UserCredit",
];

const UserApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getUsersList: build.query({
        query: ({ pageNumber = 1, pageSize = 10, search = '', sortBy = 'firstName', sortDir = 'asc' } = {}) => {
          const params = { pageNumber, pageSize, sortBy, sortDir };
          // Only include search param when non-empty
          if (search) {
            params.search = search;
          }
          return { url: `/user`, params };
        },
        // Serialize cache key based on search/sort only (NOT pageNumber), so
        // all pages for the same search+sort share one cache entry.
        serializeQueryArgs: ({ queryArgs }) => {
          const { search = '', sortBy = 'firstName', sortDir = 'asc' } = queryArgs || {};
          return `usersList-${search}-${sortBy}-${sortDir}`;
        },
        // Merge new page data into the existing cache entry.
        // NOTE: RTK Query's merge runs inside Immer — mutate currentCache directly.
        merge: (currentCache, newResponse, { arg }) => {
          const pageNumber = arg?.pageNumber ?? 1;
          if (pageNumber === 1) {
            // First page or new search: replace everything
            currentCache.data = newResponse.data;
          } else {
            // Subsequent pages: append data
            currentCache.data.push(...(newResponse.data || []));
          }
          // Always update pagination metadata
          currentCache.totalPages = newResponse.totalPages;
          currentCache.totalElements = newResponse.totalElements;
          currentCache.pageSize = newResponse.pageSize;
          currentCache.pageNumber = newResponse.pageNumber;
        },
        // Re-fetch when pageNumber changes (even though cache key is the same).
        forceRefetch: ({ currentArg, previousArg }) => {
          return currentArg?.pageNumber !== previousArg?.pageNumber
            || currentArg?.search !== previousArg?.search
            || currentArg?.sortBy !== previousArg?.sortBy
            || currentArg?.sortDir !== previousArg?.sortDir;
        },
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "User", id })),
                { type: "User", id: "LIST" },
              ]
            : [{ type: "User", id: "LIST" }],
        transformResponse: (response) => {
          const data = { data: response?.data || [] };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageNumber = response.pagination.pageNumber;
          }

          return data;
        },
      }),
      getUsersItem: build.query({
        query: (userId) => ({ url: `/user/${userId}` }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, id) => [{ type: "User", id }],
      }),
      createUser: build.mutation({
        query: (userData) => ({
          url: `/user`,
          method: "POST",
          data: userData,
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [{ type: "User", id: "LIST" }],
      }),
      updateUser: build.mutation({
        query: ({ id, ...body }) => ({
          url: `/user/${id}`,
          method: "PUT",
          data: body,
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, { id }) => [
          { type: "User", id },
          { type: "User", id: "LIST" },
        ],
      }),
      deleteUser: build.mutation({
        query: (id) => ({
          url: `/user/${id}`,
          method: "DELETE",
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [{ type: "User", id: "LIST" }],
      }),
      // Roles endpoints
      getRolesList: build.query({
        query: () => ({ url: `/role` }),
        providesTags: ["Role"],
      }),
      getUserRoles: build.query({
        query: (userId) => ({ url: `/user/${userId}/role` }),
        providesTags: (result, error, id) => [{ type: "UserRole", id }],
      }),
      addRoleToUser: build.mutation({
        query: ({userId, roleId}) => ({
          url: `/user/${userId}/role`,
          method: "POST",
          data: { id: roleId },
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserRole", id: userId },
        ],
      }),
      removeRoleFromUser: build.mutation({
        query: ({userId, roleId}) => ({
          url: `/user/${userId}/role/${roleId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserRole", id: userId },
        ],
      }),
      // Accesses endpoints
      getAccessesList: build.query({
        query: () => ({ url: `/access` }),
        providesTags: ["Access"],
      }),
      getUserAccesses: build.query({
        query: (userId) => ({ url: `/user/${userId}/access` }),
        providesTags: (result, error, id) => [{ type: "UserAccess", id }],
      }),
      updateUserAccesses: build.mutation({
        query: ({userId, accesses}) => ({
          url: `/user/${userId}/access`,
          method: "PUT",
          data: accesses,
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserAccess", id: userId },
        ],
      }),
      addAccessToUser: build.mutation({
        query: ({userId, accessId}) => ({
          url: `/user/${userId}/access`,
          method: "POST",
          data: { id: accessId },
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserAccess", id: userId },
        ],
      }),
      removeAccessFromUser: build.mutation({
        query: ({userId, accessId}) => ({
          url: `/user/${userId}/access/${accessId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserAccess", id: userId },
        ],
      }),
      getProvinces: build.query({
        query: () => ({ url: `/province` }),
        transformResponse: (response) => response.data,
      }),
      getCities: build.query({
        query: (provinceId) => ({ url: `/province/${provinceId}/city` }),
        transformResponse: (response) => response.data,
      }),
      // Credit endpoints
      getUserCredit: build.query({
        query: (userId) => ({ url: `/user/${userId}/credit` }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, id) => [{ type: "UserCredit", id }],
      }),
      updateUserCredit: build.mutation({
        query: ({ userId, amount, ghostModeOn, operation }) => ({
          url: `/user/${userId}/credit`,
          method: "POST",
          data: { amount, ghostModeOn, operation },
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, { userId }) => [
          { type: "UserCredit", id: userId },
        ],
      }),
    }),
    overrideExisting: false,
  });

export default UserApi;
export const {
  useGetUsersListQuery,
  useGetUsersItemQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesListQuery,
  useGetUserRolesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  useGetAccessesListQuery,
  useGetUserAccessesQuery,
  useUpdateUserAccessesMutation,
  useAddAccessToUserMutation,
  useRemoveAccessFromUserMutation,
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetUserCreditQuery,
  useUpdateUserCreditMutation,
} = UserApi;

/**
 * Group users by the first letter of their firstName.
 * The data is already sorted by the API (sortBy=firstName, sortDir=asc),
 * so we only need to bucket them by their first character.
 */
export function groupUsersByFirstLetter(users) {
  if (!users || users.length === 0) {
    return {};
  }

  return users.reduce((acc, user) => {
    const group = user?.firstName?.[0] || "#";
    if (!acc[group]) {
      acc[group] = { group, children: [user] };
    } else {
      acc[group].children.push(user);
    }
    return acc;
  }, {});
}