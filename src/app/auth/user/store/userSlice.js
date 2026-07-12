/* eslint import/no-extraneous-dependencies: off */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import settingsConfig from 'app/configs/settingsConfig';
import _ from '@lodash';
import { API_STATIC_FILES_BASE_URL } from 'app/store/apiService.js';
import userModel from '../models/UserModel';
import { getSafeString } from '@/utils/string-utils.js';

function updateRedirectUrl(user) {
	/*
    You can redirect the logged-in user to a specific route depending on his role
    */
	if (user?.data?.loginRedirectUrl && user?.data?.loginRedirectUrl !== '') {
		settingsConfig.loginRedirectUrl = user.data.loginRedirectUrl; // for example 'apps/academy'
	}
}

/**
 * Sets the user object in the Redux store.
 */
export const setUser = createAsyncThunk('user/setUser', async (user) => {
	updateRedirectUrl(user);
	return user;
});
/**
 * Reset the user state.
 */
export const resetUser = createAsyncThunk('user/resetUser', async () => {
	return true;
});
/**
 * The initial state of the user slice.
 */
const initialState = userModel({});
/**
 * The User slice
 */
export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		/**
		 * Updates the user's settings
		 */
		setUserShortcuts: (state, action) => {
			const oldState = _.cloneDeep(state);
			const newUser = _.setIn(oldState, 'data.shortcuts', action.payload);

			if (_.isEqual(oldState, newUser)) {
				return undefined;
			}

			return newUser;
		},
		/**
		 * Updates the user's settings
		 */
		setUserSettings: (state, action) => {
			const oldState = _.cloneDeep(state);
			const newUser = _.setIn(oldState, 'data.settings', action.payload);

			if (_.isEqual(oldState, newUser)) {
				return undefined;
			}

			return newUser;
		},
		/**
		 * Updates the user object in the Redux store.
		 */
		updateUser: (state, action) => {
			const oldState = _.cloneDeep(state);
			// action.payload.role = action?.payload?.roles?.map((role) => role.name);
			// action.payload.avatar = API_STATIC_FILES_BASE_URL + getSafeString(action?.payload?.avatar?.filePath);
			const user = action.payload;

			if (user) user.role = selectMostAuthoritativeRole(user.roles);

			const newUser = _.merge({}, oldState, user);

			if (_.isEqual(oldState, newUser)) {
				return undefined;
			}

			return newUser;
		},
		userSignOut: () => initialState
	},
	extraReducers: (builder) => {
		builder.addCase(setUser.fulfilled, (state, action) => {
			const user = _.cloneDeep(action.payload);
			const newUser = _.defaults(user, state);

			if (user) {
				// if (user.roles && user.roles.length) user.role = user.roles.map((role) => role.name);
				//
				// if (user.role && user.role.length) user.role = user.role[0];
				user.role = selectMostAuthoritativeRole(projectionOnName(user.roles));
				const userAvatarFileName = getSafeString(user.avatar?.fileName);
				const userAvatarFilePath = getSafeString(user.avatar?.filePath);
				user.avatar = {};
				user.avatar.fileName = userAvatarFileName;
				user.avatar.filePath = API_STATIC_FILES_BASE_URL + userAvatarFilePath;
			}

			if (_.isEqual(state, newUser)) {
				return undefined;
			}

			return user;
		});
		builder.addCase(resetUser.fulfilled, (state) => {
			if (!_.isEqual(state, initialState)) {
				return initialState;
			}

			return undefined;
		});
	}
});
export const { userSignOut, updateUser, setUserShortcuts, setUserSettings } = userSlice.actions;
export const selectUser = (state) => state?.user;
export const selectUserId = (state) => state?.user?.id;
export const selectUserRole = (state) => selectMostAuthoritativeRole(projectionOnName(state?.user?.roles));
export const selectIsUserGuest = (state) => {
	return isGuest(projectionOnName(state?.user?.role || state?.user?.roles));
};
export const selectIsUserAdmin = (state) => {
	return isAdmin(projectionOnName(state?.user?.accesses || state?.user?.userAccesses));
};
export const selectUserShortcuts = (state) => getUserShortcutsOrDefault(state?.user);
export const selectUserSettings = (state) => getUserSettingsOrDefault(state?.user);
export default userSlice.reducer;

const projectionOnName = (roles) => {
	return roles && Array.isArray(roles) && roles.length !== 0
		? roles.map((role) => (Object.prototype.hasOwnProperty.call(role, 'name') ? role.name : role))
		: undefined;
};
const selectMostAuthoritativeRole = (roles) => {
	if (isGuest(roles) || !roles.length) return roles;

	return settingsConfig.defaultAuth.find((auth) => {
		// console.log(`User roles in slice: ${roles}` && roles.length ? JSON.stringify(roles) : roles);

		if (roles.map((role) => role.toLowerCase()).includes(auth.toLowerCase())) return auth;

		return undefined;
	});
};

const isGuest = (role) => !role || (Array.isArray(role) && role.length === 0);

const isAdmin = (accesses) => accesses && Array.isArray(accesses) && accesses.includes('ADMIN_ACCESS');

const getUserSettingsOrDefault = (user) => {
	if (!user || !user.data) return DEFAULT_USER_SETTINGS;

	// Check if settings is a valid object
	if (user.data.settings && typeof user.data.settings === 'object' && !Array.isArray(user.data.settings)) {
		return user.data.settings;
	}

	return DEFAULT_USER_SETTINGS;
};

const getUserShortcutsOrDefault = (user) => {
	if (!user || !user.data) {
		return DEFAULT_USER_SHORTCUTS;
	}

	// Check if shortcuts is an array
	if (Array.isArray(user.data.shortcuts)) {
		return user.data.shortcuts;
	}

	// If shortcuts is an object, return empty array
	if (user.data.shortcuts && typeof user.data.shortcuts === 'object') {
		return [];
	}

	return DEFAULT_USER_SHORTCUTS;
};
const DEFAULT_USER_SETTINGS = {
	layout: {
		style: 'layout2',
		config: {
			mode: 'boxed',
			scroll: 'content',
			navbar: {
				display: true
			},
			toolbar: {
				display: true,
				position: 'below'
			},
			footer: {
				display: true,
				style: 'fixed'
			}
		}
	},
	customScrollbars: true,
	theme: {},
	uiEditorEnabled: false
};

const DEFAULT_USER_SHORTCUTS = ['apps.calendar', 'apps.mailbox', 'apps.contacts', 'apps.tasks', 'apps.settings'];
