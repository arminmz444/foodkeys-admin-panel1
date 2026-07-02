import { createSlice } from '@reduxjs/toolkit';
import { rootReducer } from 'app/store/lazyLoadedSlices';

const initialState = {
  searchText: '',
  inputSearchText: '',
  selectedRoleId: null,
  accessManagementOpen: false,
  accessManagementViewOnly: false,
};

/**
 * The Roles App slice.
 */
export const rolesAppSlice = createSlice({
  name: 'rolesApp',
  initialState,
  reducers: {
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    setInputSearchText: (state, action) => {
      state.inputSearchText = action.payload;
    },
    resetSearchText: (state) => {
      state.searchText = initialState.searchText;
      state.inputSearchText = initialState.inputSearchText;
    },
    setSelectedRoleId: (state, action) => {
      state.selectedRoleId = action.payload;
    },
    setAccessManagementOpen: (state, action) => {
      state.accessManagementOpen = action.payload;
    },
    openAccessManagement: (state, action) => {
      const payload = typeof action.payload === 'object'
        ? action.payload
        : { roleId: action.payload, viewOnly: false };

      state.selectedRoleId = payload.roleId;
      state.accessManagementViewOnly = payload.viewOnly ?? false;
      state.accessManagementOpen = true;
    },
    closeAccessManagement: (state) => {
      state.selectedRoleId = null;
      state.accessManagementOpen = false;
      state.accessManagementViewOnly = false;
    },
  },
  selectors: {
    selectSearchText: (state) => state.searchText,
    selectInputSearchText: (state) => state.inputSearchText,
    selectSelectedRoleId: (state) => state.selectedRoleId,
    selectAccessManagementOpen: (state) => state.accessManagementOpen,
    selectAccessManagementViewOnly: (state) => state.accessManagementViewOnly,
  },
});

/**
 * Lazy load
 */
rootReducer.inject(rolesAppSlice);
const injectedSlice = rolesAppSlice.injectInto(rootReducer);

export const { 
  setSearchText, 
  setInputSearchText, 
  resetSearchText,
  setSelectedRoleId,
  setAccessManagementOpen,
  openAccessManagement,
  closeAccessManagement,
} = rolesAppSlice.actions;

export const { 
  selectSearchText, 
  selectInputSearchText,
  selectSelectedRoleId,
  selectAccessManagementOpen,
  selectAccessManagementViewOnly,
} = injectedSlice.selectors;

export default rolesAppSlice.reducer;
