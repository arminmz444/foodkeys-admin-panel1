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
      // Roles endpoints (Authorization v2 - enriched with accesses)
      getRolesList: build.query({
        query: () => ({ url: `/role`, params: { pageNumber: 1, pageSize: 10000 } }),
        transformResponse: (response) => {
          const roles = response?.data || [];
          const filteredRoles = roles?.filter(role => role.enabled !== false && role.hidden !== true) || [];
          const data = { data: filteredRoles };

          if (response) {
            if (response.pagination) {
              data.totalPages = response.pagination.totalPages;
              data.totalElements = response.pagination.totalElements;
              data.pageSize = response.pagination.pageSize;
              data.pageIndex = response.pagination.pageIndex;
            }
            if (response.meta)
              data.meta = response.meta;
          }

          return data;
        },
        providesTags: ["Role"],
      }),
      getUserRoles: build.query({
        query: (userId) => ({ url: `/user/${userId}/role` }),
        providesTags: (result, error, id) => [{ type: "UserRole", id }],
      }),
      // Accesses endpoints (Authorization v2 - enriched with metadata)
      getAccessesList: build.query({
        query: () => ({ url: `/access` }),
        // transformResponse: (response) => {
        //   const accesses = response?.data || [];
        //   // Backend already filters out system=true and enabled=false
        //   // Group accesses by entity and operation for better UX
        //   return accesses;
        // },
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
      updateUserRoles: build.mutation({
        query: ({userId, roles}) => ({
          url: `/user/${userId}/role`,
          method: "PUT",
          data: roles,
        }),
        invalidatesTags: (result, error, { userId }) => [
          { type: "User", id: userId },
          { type: "UserRole", id: userId },
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
  useGetAccessesListQuery,
  useGetUserAccessesQuery,
  useUpdateUserAccessesMutation,
  useUpdateUserRolesMutation,
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

/**
 * Group accesses by entity name and operation (Authorization v2)
 * Provides a hierarchical structure for better UX in access picker
 *
 * Returns: {
 *   COMPANY: {
 *     READ: [access1, access2, ...],
 *     UPDATE: [access3, ...],
 *   },
 *   SERVICE: { ... }
 * }
 */
export function groupAccessesByEntity(accesses) {
  if (!accesses || accesses.length === 0) {
    return {};
  }

  return accesses.reduce((acc, access) => {
    const entity = access.entityName || 'OTHER';
    const operation = access.operation || 'OTHER';
    const entityDisplayName = access.entityDisplayName || "سایر";

    if (!acc[entity]) {
      acc[entity] = {};
    }

    if (!acc[entity].operations)
      acc[entity].operations = {};

    if (!acc[entity].operations[operation]) {
      acc[entity].operations[operation] = [];
    }

    acc[entity].operations[operation].push(access);
    acc[entity].displayName = entityDisplayName;

    return acc;
  }, {});
}

/**
 * Sort accesses within a group by scope priority (ALL > OWN > ONLINE_POLICY_CHECK)
 */
export function sortAccessesByScope(accesses) {
  const scopePriority = { 'ALL': 1, 'OWN': 2, 'ONLINE_POLICY_CHECK': 3 };
  return [...accesses].sort((a, b) => {
    const priorityA = scopePriority[a.scope] || 999;
    const priorityB = scopePriority[b.scope] || 999;
    return priorityA - priorityB;
  });
}


export function getOperationDisplayName(operation) {
  switch (operation) {
    case "CREATE": return "ایجاد";
    case "READ": return "مشاهده";
    case "UPDATE": return "ویرایش";
    case "DELETE": return "حذف";
    case "IMPORT": return "ورود اطلاعات";
    case "EXPORT": return "خروج اطلاعات";
    default: return operation;
  }
}
/**
 * Check if an access can be directly assigned to a user
 * (COMMON_CRM_ROLE and BUSINESS_ROLE accesses can only be assigned via roles)
 */
export function isAccessDirectlyAssignable(access) {
  return access.category === 'PERMISSION' || access.scope === 'ONLINE_POLICY_CHECK';
}

/**
 * Filter accesses that can be directly assigned to users
 */
export function filterDirectlyAssignableAccesses(accesses) {
  return accesses.filter(isAccessDirectlyAssignable);
}