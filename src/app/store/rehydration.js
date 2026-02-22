/**
 * Redux store rehydration utilities
 * Handles loading persisted state from localStorage
 */
import UserModel from '../auth/user/models/UserModel';

/**
 * Load user data from localStorage
 * @returns {Object|null} User data object or null if not found
 */
export const loadUserFromStorage = () => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			const storedData = localStorage.getItem("user_data");
			if (storedData) {
				const parsedUser = JSON.parse(storedData);
				console.log("Loaded user data from localStorage:", parsedUser);
				
				// Handle different user data structures
				let processedUser = parsedUser;
				
				// If the data is from /me endpoint response, extract the user object
				if (parsedUser && parsedUser.user) {
					processedUser = parsedUser.user;
					// Merge accesses and roles from the response
					if (parsedUser.accesses) {
						processedUser.accesses = parsedUser.accesses;
					}
					if (parsedUser.roles) {
						processedUser.roles = parsedUser.roles;
					}
				} else if (parsedUser && parsedUser.data && parsedUser.data.user) {
					processedUser = parsedUser.data.user;
					// Merge accesses and roles from the response
					if (parsedUser.data.accesses) {
						processedUser.accesses = parsedUser.data.accesses;
					}
					if (parsedUser.data.roles) {
						processedUser.roles = parsedUser.data.roles;
					}
				}
				
				// Use UserModel to ensure proper structure
				const structuredUser = UserModel(processedUser);
				return structuredUser;
			}
		}
	} catch (error) {
		console.error("Error loading user data from localStorage:", error);
	}
	return null;
};

/**
 * Load authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const loadTokenFromStorage = () => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			const token = localStorage.getItem("jwt_access_token");
			if (token) {
				console.log("Loaded token from localStorage");
				return token;
			}
		}
	} catch (error) {
		console.error("Error loading token from localStorage:", error);
	}
	return null;
};

/**
 * Create preloaded state for Redux store
 * @returns {Object} Preloaded state object
 */
export const createPreloadedState = () => {
	const userData = loadUserFromStorage();
	
	if (userData) {
		return {
			user: userData
		};
	}
	
	return {};
};

/**
 * Check if user data exists in localStorage
 * @returns {boolean} True if user data exists
 */
export const hasStoredUserData = () => {
	if (typeof window !== "undefined" && window.localStorage) {
		return !!localStorage.getItem("user_data");
	}
	return false;
};

/**
 * Check if authentication token exists in localStorage
 * @returns {boolean} True if token exists
 */
export const hasStoredToken = () => {
	if (typeof window !== "undefined" && window.localStorage) {
		return !!localStorage.getItem("jwt_access_token");
	}
	return false;
};
