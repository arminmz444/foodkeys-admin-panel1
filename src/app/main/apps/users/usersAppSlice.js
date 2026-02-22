// import { createSlice } from '@reduxjs/toolkit';
// import { rootReducer } from 'app/store/lazyLoadedSlices';

// const initialState = { searchText: '' };
// /**
//  * The Users App slice.
//  */
// export const usersAppSlice = createSlice({
// 	name: 'usersApp',
// 	initialState,
// 	reducers: {
// 		setSearchText: {
// 			reducer: (state, action) => {
// 				state.searchText = action.payload;
// 			},
// 			prepare: (event) => ({
// 				payload: `${event?.target?.value}` || '',
// 				meta: undefined,
// 				error: null
// 			})
// 		},
// 		resetSearchText: (state) => {
// 			state.searchText = initialState.searchText;
// 		}
// 	},
// 	selectors: {
// 		selectSearchText: (state) => state.searchText
// 	}
// });
// /**
//  * Lazy load
//  * */
// rootReducer.inject(usersAppSlice);
// const injectedSlice = usersAppSlice.injectInto(rootReducer);
// export const { setSearchText, resetSearchText } = usersAppSlice.actions;
// export const { selectSearchText } = injectedSlice.selectors;
// const searchTextReducer = usersAppSlice.reducer;
// export default searchTextReducer;

import { createSlice } from '@reduxjs/toolkit';
import { rootReducer } from 'app/store/lazyLoadedSlices';

const initialState = {
  searchText: '',       // The actual debounced search text sent to the API
  inputSearchText: '',  // The live input text (what the user sees while typing)
};

/**
 * The Users App slice.
 */
export const usersAppSlice = createSlice({
  name: 'usersApp',
  initialState,
  reducers: {
    /**
     * Sets the debounced search text (used for API queries).
     */
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    /**
     * Sets the live input search text (what the user sees in the input field).
     */
    setInputSearchText: (state, action) => {
      state.inputSearchText = action.payload;
    },
    resetSearchText: (state) => {
      state.searchText = initialState.searchText;
      state.inputSearchText = initialState.inputSearchText;
    },
  },
  selectors: {
    selectSearchText: (state) => state.searchText,
    selectInputSearchText: (state) => state.inputSearchText,
  },
});

/**
 * Lazy load
 */
rootReducer.inject(usersAppSlice);
const injectedSlice = usersAppSlice.injectInto(rootReducer);
export const { setSearchText, setInputSearchText, resetSearchText } = usersAppSlice.actions;
export const { selectSearchText, selectInputSearchText } = injectedSlice.selectors;
const searchTextReducer = usersAppSlice.reducer;
export default searchTextReducer;