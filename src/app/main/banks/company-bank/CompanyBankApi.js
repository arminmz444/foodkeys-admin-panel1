import { apiService as api } from 'app/store/apiService';

/**
 * Generic Company Bank API.
 *
 * Unlike the legacy `FoodIndustryBankApi` / `AgricultureIndustryApi` (which hard-code
 * `categoryId=1` / `categoryId=2`), these endpoints receive the `categoryId` as an
 * argument so a single implementation can serve every dynamically generated
 * COMPANY bank (see `useDynamicBanksNavigation`).
 */
export const addTagTypes = ['companyBankList', 'companyBankRequestList'];

const CompanyBankApi = api
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      // GET /company/?categoryId={categoryId}&pageNumber=&pageSize=&search=&sort=&filter=
      getCompaniesByCategory: build.query({
        query: ({ categoryId, pageNumber, pageSize, search, sort, filter }) => {
          const sortParam =
            sort && Object.entries(sort)?.length
              ? encodeURIComponent(JSON.stringify(sort))
              : '';

          const filterParam =
            filter && Object.entries(filter)?.length
              ? encodeURIComponent(JSON.stringify(filter))
              : '';

          return {
            url:
              `/company/?categoryId=${categoryId}` +
              `&pageNumber=${pageNumber}` +
              `&pageSize=${pageSize}` +
              `&search=${encodeURIComponent(search ?? '')}` +
              `&sort=${sortParam}` +
              `&filter=${filterParam}`,
            method: 'GET'
          };
        },
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageNumber;
          }

          return data;
        },
        providesTags: (result, error, arg) => [
          { type: 'companyBankList', id: arg?.categoryId }
        ],
        keepUnusedDataFor: 0,
        refetchOnMountOrArgChange: true
      }),

      // GET /request/company?categoryId={categoryId}&...
      getCompanyRequestsByCategory: build.query({
        query: ({ pageNumber = 1, pageSize, search, sort, filter, categoryId, requestStatus }) => ({
          url: `/request/company`,
          method: 'GET',
          params: {
            pageNumber: pageNumber !== 0 ? pageNumber : 1,
            pageSize: pageSize || 10,
            search: search || '',
            categoryId,
            sort: (sort && Object.entries(sort)?.length && JSON.stringify(sort)) || '',
            filter: (filter && Object.entries(filter)?.length && JSON.stringify(filter)) || '',
            requestStatus: requestStatus || ''
          }
        }),
        transformResponse: (response) => {
          const data = { data: response?.data };

          if (response && response.pagination) {
            data.totalPages = response.pagination.totalPages;
            data.totalElements = response.pagination.totalElements;
            data.pageSize = response.pagination.pageSize;
            data.pageIndex = response.pagination.pageNumber;
          }

          return data;
        },
        providesTags: (result, error, arg) => [
          { type: 'companyBankRequestList', id: arg?.categoryId }
        ],
        keepUnusedDataFor: 0,
        refetchOnMountOrArgChange: true
      })
    }),
    overrideExisting: false
  });

export default CompanyBankApi;

export const {
  useGetCompaniesByCategoryQuery,
  useGetCompanyRequestsByCategoryQuery
} = CompanyBankApi;
