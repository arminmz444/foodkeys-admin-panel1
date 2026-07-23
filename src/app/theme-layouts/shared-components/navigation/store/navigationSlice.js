import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import _ from "@lodash";
import { selectUserRole } from "src/app/auth/user/store/userSlice";
import FuseNavigationHelper from "@fuse/utils/FuseNavigationHelper";
import i18next from "i18next";
import FuseNavItemModel from "@fuse/core/FuseNavigation/models/FuseNavItemModel";
import FuseUtils from "@fuse/utils";
import navigationConfig from "app/configs/navigationConfig";
import { selectCurrentLanguageId } from "app/store/i18nSlice";
import { rootReducer } from "app/store/lazyLoadedSlices";
import { getMergedNavigation } from "app/store/navigationMerger";

const navigationAdapter = createEntityAdapter();
const emptyInitialState = navigationAdapter.getInitialState([]);

// Use merged navigation (dynamic + static fallback)
const getInitialNavigation = () => {
  const mergedNav = getMergedNavigation();
  return navigationAdapter.upsertMany(
    emptyInitialState,
    FuseNavigationHelper.flattenNavigation(mergedNav)
  );
};

const initialState = getInitialNavigation();
console.log("initialState")
console.log(initialState)
/**
 * Redux Thunk actions related to the navigation store state
 */
/**
 * Appends a navigation item to the navigation store state.
 */
export const appendNavigationItem =
  (item, parentId) => async (dispatch, getState) => {
    const AppState = getState();
    const navigation = FuseNavigationHelper.unflattenNavigation(
      selectNavigationAll(AppState)
    );
    dispatch(
      setNavigation(
        FuseNavigationHelper.appendNavItem(
          navigation,
          FuseNavItemModel(item),
          parentId
        )
      )
    );
    return Promise.resolve();
  };
/**
 * Prepends a navigation item to the navigation store state.
 */
export const prependNavigationItem =
  (item, parentId) => async (dispatch, getState) => {
    const AppState = getState();
    const navigation = FuseNavigationHelper.unflattenNavigation(
      selectNavigationAll(AppState)
    );
    dispatch(
      setNavigation(
        FuseNavigationHelper.prependNavItem(
          navigation,
          FuseNavItemModel(item),
          parentId
        )
      )
    );
    return Promise.resolve();
  };
/**
 * Adds a navigation item to the navigation store state at the specified index.
 */
export const updateNavigationItem =
  (id, item) => async (dispatch, getState) => {
    const AppState = getState();
    const navigation = FuseNavigationHelper.unflattenNavigation(
      selectNavigationAll(AppState)
    );
    dispatch(
      setNavigation(FuseNavigationHelper.updateNavItem(navigation, id, item))
    );
    return Promise.resolve();
  };
/**
 * Rebuilds the children of the "banks" navigation group from the dynamically
 * generated COMPANY category collapses, while preserving every non-dynamic
 * child (e.g. the static Services bank item).
 *
 * Dynamic company items are identified by an id that starts with
 * "banks.company.".
 */
export const setBanksCompanyNavigation =
  (companyChildren = []) =>
  async (dispatch, getState) => {
    const AppState = getState();
    const navigation = FuseNavigationHelper.unflattenNavigation(
      selectNavigationAll(AppState)
    );

    const banksGroup = navigation.find((group) => group.id === "banks");

    if (!banksGroup) {
      return Promise.resolve();
    }

    const staticChildren = (banksGroup.children || []).filter(
      (child) => !String(child.id).startsWith("banks.company.")
    );

    const nextChildren = [...companyChildren, ...staticChildren];

    // Avoid dispatching (and re-rendering) when nothing actually changed.
    if (_.isEqual(banksGroup.children, nextChildren)) {
      return Promise.resolve();
    }

    const nextNavigation = navigation.map((group) =>
      group.id === "banks" ? { ...group, children: nextChildren } : group
    );

    dispatch(setNavigation(nextNavigation));
    return Promise.resolve();
  };
/**
 * Removes a navigation item from the navigation store state.
 */
export const removeNavigationItem = (id) => async (dispatch, getState) => {
  const AppState = getState();
  const navigation = FuseNavigationHelper.unflattenNavigation(
    selectNavigationAll(AppState)
  );
  dispatch(setNavigation(FuseNavigationHelper.removeNavItem(navigation, id)));
  return Promise.resolve();
};
export const {
  selectAll: selectNavigationAll,
  selectIds: selectNavigationIds,
  selectById: selectNavigationItemById,
} = navigationAdapter.getSelectors((state) => state.navigation);
/**
 * The navigation slice
 */
export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setNavigation(state, action) {
      return navigationAdapter.setAll(
        state,
        FuseNavigationHelper.flattenNavigation(action.payload)
      );
    },
    resetNavigation: () => initialState,
    refreshNavigationFromMeta(state) {
      const mergedNav = getMergedNavigation();
      return navigationAdapter.setAll(
        state,
        FuseNavigationHelper.flattenNavigation(mergedNav)
      );
    },
  },
});
/**
 * Lazy load
 * */
rootReducer.inject(navigationSlice);
navigationSlice.injectInto(rootReducer);
export const { setNavigation, resetNavigation, refreshNavigationFromMeta } = navigationSlice.actions;
export const selectNavigation = createSelector(
  [selectNavigationAll, selectUserRole, selectCurrentLanguageId],
  (navigationSimple, userRole) => {
    const navigation =
      FuseNavigationHelper.unflattenNavigation(navigationSimple);

    function setAdditionalData(data) {
      return data?.map((item) => ({
        hasPermission: Boolean(FuseUtils.hasPermission(item?.auth, userRole)),
        ...item,
        ...(item?.translate && item?.title
          ? { title: i18next.t(`navigation:${item?.translate}`) }
          : {}),
        ...(item?.subtitleTranslate && item?.subtitle
          ? { subtitle: i18next.t(`navigation:${item?.subtitleTranslate}`) }
          : {}),
        ...(item?.children
          ? { children: setAdditionalData(item?.children) }
          : {}),
      }));
    }

    const translatedValues = setAdditionalData(navigation);
    return translatedValues;
  }
);
export const selectFlatNavigation = createSelector(
  [selectNavigation],
  (navigation) => {
    return FuseNavigationHelper.flattenNavigation(navigation);
  }
);
export default navigationSlice.reducer;
