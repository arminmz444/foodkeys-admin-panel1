import { useEffect, useMemo } from "react";
import { useAppDispatch } from "app/store/hooks";
import { useGetCategoryOptionsQuery } from "src/app/main/category/CategoriesApi";
import { setBanksCompanyNavigation } from "app/theme-layouts/shared-components/navigation/store/navigationSlice";

/**
 * Builds the "بانک‌ها" (Banks) sidebar section dynamically from the cached
 * `/api/v1/category/options` response.
 *
 * For every option with `dependantEntityType === "COMPANY"` a collapse is
 * created with two items (company list + user requests), mirroring the old
 * static food-industry bank entry. Options with `dependantEntityType === "SERVICE"`
 * are ignored (the static Services bank stays untouched).
 *
 * The category options query is cached (`keepUnusedDataFor: 3600`) and tagged
 * with `{ type: "Category", id: "LIST" }`, so it is only refetched — and the
 * navigation rebuilt — when a category is created/updated/deleted (those
 * mutations invalidate the same tag).
 */
function useDynamicBanksNavigation() {
  const dispatch = useAppDispatch();

  const { data } = useGetCategoryOptionsQuery({
    pageNumber: 1,
    pageSize: 1000,
    search: "",
    sort: "",
    filter: "",
  });

  const companyChildren = useMemo(() => {
    const options = data?.data;

    if (!Array.isArray(options)) {
      return [];
    }

    return options
      .filter((option) => option?.dependantEntityType === "COMPANY")
      .map((option) => ({
        id: `banks.company.${option.value}`,
        title: option.label,
        type: "collapse",
        icon: option.icon || "heroicons-outline:shopping-cart",
        children: [
          {
            id: `banks.company.${option.value}.list`,
            title: "COMPANY_LIST",
            translate: "COMPANY_LIST",
            type: "item",
            url: `banks/${option.value}/company/list`,
            end: true,
          },
          {
            id: `banks.company.${option.value}.requests`,
            title: "USER_REQUESTS",
            translate: "USER_REQUESTS",
            type: "item",
            url: `banks/${option.value}/request/list`,
          },
        ],
      }));
  }, [data]);

  useEffect(() => {
    dispatch(setBanksCompanyNavigation(companyChildren));
  }, [dispatch, companyChildren]);
}

export default useDynamicBanksNavigation;
