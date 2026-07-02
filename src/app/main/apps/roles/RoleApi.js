import { apiService as api } from "app/store/apiService";

export const addTagTypes = [
  "Role",
  "RoleItem",
  "RoleAccess",
  "Access",
];

const RoleApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get all roles with pagination
      getRolesListPaginated: build.query({
        query: ({ pageNumber = 1, pageSize = 10000, search = '', sortBy = 'name', sortDir = 'asc' } = {}) => {
          const params = { pageNumber, pageSize, sortBy, sortDir };
          if (search) {
            params.search = search;
          }
          return { url: `/role`, params };
        },
        serializeQueryArgs: ({ queryArgs }) => {
          const { search = '', sortBy = 'name', sortDir = 'asc' } = queryArgs || {};
          return `rolesList-${search}-${sortBy}-${sortDir}`;
        },
        merge: (currentCache, newResponse, { arg }) => {
          const pageNumber = arg?.pageNumber ?? 1;
          if (pageNumber === 1) {
            currentCache.data = newResponse.data;
          } else {
            currentCache.data.push(...(newResponse.data || []));
          }
          currentCache.totalPages = newResponse.totalPages;
          currentCache.totalElements = newResponse.totalElements;
          currentCache.pageSize = newResponse.pageSize;
          currentCache.pageNumber = newResponse.pageNumber;
        },
        forceRefetch: ({ currentArg, previousArg }) => {
          return currentArg?.pageNumber !== previousArg?.pageNumber
            || currentArg?.search !== previousArg?.search
            || currentArg?.sortBy !== previousArg?.sortBy
            || currentArg?.sortDir !== previousArg?.sortDir;
        },
        providesTags: (result) =>
          result && result.data && Array.isArray(result.data)
            ? [
                ...result.data.map(({ id }) => ({ type: "Role", id })),
                { type: "Role", id: "LIST" },
              ]
            : [{ type: "Role", id: "LIST" }],
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
      
      // Get single role by ID
      getRoleItem: build.query({
        query: (roleId) => ({ url: `/role/${roleId}` }),
        transformResponse: (response) => response?.data,
        providesTags: (result, error, id) => [{ type: "RoleItem", id }],
      }),
      
      // Create new role
      createRole: build.mutation({
        query: (roleData) => ({
          url: `/role`,
          method: "POST",
          data: roleData,
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [{ type: "Role", id: "LIST" }],
      }),
      
      // Update existing role
      updateRole: build.mutation({
        query: ({ id, ...body }) => ({
          url: `/role/${id}`,
          method: "PUT",
          data: body,
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, { id }) => [
          { type: "Role", id },
          { type: "RoleItem", id },
          { type: "Role", id: "LIST" },
        ],
      }),
      
      // Delete role
      deleteRole: build.mutation({
        query: (id) => ({
          url: `/role/${id}`,
          method: "DELETE",
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: [{ type: "Role", id: "LIST" }],
      }),
      
      // Get accesses for a specific role
      getRoleAccesses: build.query({
        query: (roleId) => ({ url: `/role/${roleId}/accesses` }),
        transformResponse: (response) => response?.data || [],
        providesTags: (result, error, id) => [{ type: "RoleAccess", id }],
      }),
      
      // Set accesses for a role (replaces all existing accesses)
      setRoleAccesses: build.mutation({
        query: ({ roleId, accessIds }) => ({
          url: `/role/${roleId}/accesses`,
          method: "PUT",
          data: accessIds.map(id => ({ id })),
        }),
        transformResponse: (response) => response?.data,
        invalidatesTags: (result, error, { roleId }) => [
          { type: "RoleAccess", id: roleId },
          { type: "RoleItem", id: roleId },
          { type: "Role", id: roleId },
          { type: "Role", id: "LIST" },
        ],
      }),
      
      // Get all available accesses
      getAllAccesses: build.query({
        query: () => ({ url: `/access` }),
        transformResponse: (response) => response?.data || [],
        providesTags: ["Access"],
      }),
    }),
    overrideExisting: false,
  });

export default RoleApi;

export const {
  useGetRolesListPaginatedQuery,
  useGetRoleItemQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleAccessesQuery,
  useSetRoleAccessesMutation,
  useGetAllAccessesQuery,
} = RoleApi;

// System roles that cannot be edited or deleted
export const PROTECTED_ROLES = ['EMPLOYEE', 'ADMIN', 'CONSUMER'];

/**
 * Check if a role is protected (system role that cannot be modified)
 */
export function isProtectedRole(role) {
  if (!role) return false;
  return PROTECTED_ROLES.includes(role.name) || role.system === true;
}

/**
 * Group accesses by entity name and operation
 * Returns: {
 *   COMPANY: {
 *     displayName: "شرکت",
 *     operations: {
 *       READ: [access1, access2, ...],
 *       UPDATE: [access3, ...],
 *     }
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
      acc[entity] = {
        displayName: entityDisplayName,
        operations: {},
      };
    }

    if (!acc[entity].operations[operation]) {
      acc[entity].operations[operation] = [];
    }

    acc[entity].operations[operation].push(access);

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

/**
 * Get display name for operation
 */
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
 * Get scope label in Persian
 */
export function getScopeLabel(scope) {
  switch (scope) {
    case "ALL": return "همه";
    case "OWN": return "خود";
    case "ONLINE_POLICY_CHECK": return "شرطی";
    default: return scope;
  }
}

/**
 * Get scope color for chips
 */
export function getScopeColor(scope) {
  switch (scope) {
    case "ALL": return "error";
    case "OWN": return "warning";
    case "ONLINE_POLICY_CHECK": return "info";
    default: return "default";
  }
}

/**
 * Get role type label in Persian
 */
export function getRoleTypeLabel(roleType) {
  switch (roleType) {
    case "SYSTEM": return "سیستمی";
    case "BUSINESS": return "کسب‌وکار";
    case "CUSTOM": return "سفارشی";
    default: return roleType || "نامشخص";
  }
}
