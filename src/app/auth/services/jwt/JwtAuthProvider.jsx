import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { useAppDispatch } from "app/store/hooks";
import config from "./jwtAuthConfig";
import { setUser as setUserAction } from "../../user/store/userSlice";

const defaultAuthContext = {
	isAuthenticated: false,
	isLoading: false,
	user: null,
	updateUser: null,
	signIn: null,
	signUp: null,
	signOut: null,
	refreshToken: null,
	setIsLoading: () => {},
	authStatus: 'configuring'
};
export const JwtAuthContext = createContext(defaultAuthContext);

function JwtAuthProvider(props) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [authStatus, setAuthStatus] = useState('configuring');
	const dispatch = useAppDispatch();
	const { children } = props;
	/**
	 * Handle sign-in success
	 */
	const handleSignInSuccess = useCallback((userData, accessToken) => {
		setSession(accessToken, userData);
		setIsAuthenticated(true);
		setUser(userData);
		// Also dispatch to Redux store
		dispatch(setUserAction(userData));
	}, [dispatch]);
	/**
	 * Handle sign-up success
	 */
	const handleSignUpSuccess = useCallback((userData, accessToken) => {
		setSession(accessToken, userData);
		setIsAuthenticated(true);
		setUser(userData);
		// Also dispatch to Redux store
		dispatch(setUserAction(userData));
	}, [dispatch]);
	/**
	 * Handle sign-in failure
	 */
	const handleSignInFailure = useCallback((error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
		handleError(error);
	}, []);
	/**
	 * Handle sign-up failure
	 */
	const handleSignUpFailure = useCallback((error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
		handleError(error);
	}, []);
	/**
	 * Handle error
	 */
	const handleError = useCallback((_error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
	}, []);
	// Set session
	const setSession = useCallback((accessToken, user) => {
		if (accessToken && typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(config.tokenStorageKey, accessToken);
			localStorage.setItem(config.userStorageKey, JSON.stringify(user));
			axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
		}
	}, []);
	// Reset session
	const resetSession = useCallback(() => {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.removeItem(config.tokenStorageKey);
		}
		delete axios.defaults.headers.common.Authorization;
	}, []);
	// Get access token from local storage
	const getAccessToken = useCallback(() => {
		if (typeof window !== "undefined" && window.localStorage) {
			return localStorage.getItem(config.tokenStorageKey);
		}
		return null;
	}, []);
	// Check if the access token is valid
	const isTokenValid = useCallback((accessToken) => {
		if (accessToken) {
			try {
				const decoded = jwtDecode(accessToken);
				const currentTime = Date.now() / 1000;
				return decoded.exp > currentTime;
			} catch (error) {
				return false;
			}
		}

		return false;
	}, []);
	// Check if the access token exist and is valid on mount
	useEffect(() => {
		const attemptAutoLogin = async () => {
			const accessToken = getAccessToken();

			// Attempting auto login

			if (isTokenValid(accessToken)) {
				try {
					setIsLoading(true);
					const response = await axios.get(config.getUserUrl, {
						headers: { Authorization: `Bearer ${accessToken}` }
					});
					const responseData = response?.data?.data;
					// Extract user object from response
					const userData = responseData?.user || responseData;
					if (userData) userData.accesses = responseData.accesses;

					// Token is valid
					handleSignInSuccess(userData, accessToken);
					return true;
				} catch (error) {
					// Error, Token is not valid
					const axiosError = error;
					handleSignInFailure(axiosError);
					return false;
				}
			} else {
				// Token is not valid
				resetSession();
				return false;
			}
		};

		if (!isAuthenticated) {
			attemptAutoLogin()
				.then((signedIn) => {
					setIsLoading(false);
					setAuthStatus(signedIn ? "authenticated" : "unauthenticated");
				})
				.catch((e) => {
					console.error(e);
					setIsLoading(false);
				});
		}
	}, [
		isTokenValid,
		setSession,
		handleSignInSuccess,
		handleSignInFailure,
		handleError,
		getAccessToken,
		isAuthenticated
	]);
	const handleRequest = async (url, data, handleSuccess, handleFailure) => {
		try {
			const response = await axios.post(url, data);
			// const userData = response?.data.user;
			// const accessToken = response?.data?.accessToken;
			const apiData = response.data?.data;
			const userData = apiData?.user;
			const accessToken = apiData?.token;
			handleSuccess(userData, accessToken);
			return userData;
		} catch (error) {
			const axiosError = error;
			handleFailure(axiosError);
			return axiosError;
		}
	};
	// Refactor signIn function
	const signIn = (credentials) => {
		return handleRequest(config.signInUrl, credentials, handleSignInSuccess, handleSignInFailure);
	};
	// Refactor signUp function
	const signUp = useCallback((data) => {
		return handleRequest(config.signUpUrl, data, handleSignUpSuccess, handleSignUpFailure);
	}, []);
	/**
	 * Sign out
	 */
	const signOut = useCallback(() => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
	}, []);
	/**
	 * Update user
	 */
	const updateUser = useCallback(async (userData) => {
		try {
			const response = await axios.put(config.updateUserUrl, userData);
			const updatedUserData = response?.data;
			setUser(updatedUserData);
			return null;
		} catch (error) {
			const axiosError = error;
			handleError(axiosError);
			return axiosError;
		}
	}, []);
	/**
	 * Refresh access token
	 */
	const refreshToken = async () => {
		setIsLoading(true);
		try {
			const response = await axios.post(config.tokenRefreshUrl);
			const accessToken = config.updateTokenFromHeader
				? response?.headers?.['New-Access-Token']
				: response.data?.data?.token;

			if (accessToken) {
				setSession(accessToken);
				return accessToken;
			}

			return null;
		} catch (error) {
			const axiosError = error;
			handleError(axiosError);
			return axiosError;
		}
	};
	/**
	 * if a successful response contains a new Authorization header,
	 * updates the access token from it.
	 *
	 */
	useEffect(() => {
		// 	if (config.updateTokenFromHeader && isAuthenticated) {
		// 		axios.interceptors.response.use(
		// 			(response) => {
		// 				const newAccessToken = response?.headers?.['New-Access-Token'];
		//
		// 				if (newAccessToken) {
		// 					setSession(newAccessToken);
		// 				}
		//
		// 				return response;
		// 			},
		// 			(error) => {
		// 				const axiosError = error;
		//
		// 				if (axiosError?.response?.status === 401) {
		// 					signOut();
		// 					// eslint-disable-next-line no-console
		// 					console.warn('Unauthorized request. User was signed out.');
		// 				}
		//
		// 				return Promise.reject(axiosError);
		// 			}
		// 		);
		// 	}
		// }, [isAuthenticated]);
		if (!isAuthenticated) return;

		const interceptor = axios.interceptors.response.use(
			(response) => {
				return response;
			},
			async (error) => {
				if (error.response?.status === 401) {
					try {
						const newAccessToken = await refreshToken();

						if (newAccessToken) {
							error.config.headers.Authorization = `Bearer ${newAccessToken}`;
							return axios(error.config);
						}
					} catch (refreshError) {
						signOut();
					}
				}

				return Promise.reject(error);
			}
		);
		// eslint-disable-next-line consistent-return
		return () => {
			axios.interceptors.response.eject(interceptor);
		};
	}, [isAuthenticated, signOut, refreshToken]);
	useEffect(() => {
		if (user) {
			setAuthStatus("authenticated");
		} else {
			setAuthStatus("unauthenticated");
		}
	}, [user]);
	const authContextValue = useMemo(
		() => ({
			user,
			isAuthenticated,
			authStatus,
			isLoading,
			signIn,
			signUp,
			signOut,
			updateUser,
			refreshToken,
			setIsLoading
		}),
		[user, isAuthenticated, isLoading, signIn, signUp, signOut, updateUser, refreshToken, setIsLoading]
	);
	return <JwtAuthContext.Provider value={authContextValue}>{children}</JwtAuthContext.Provider>;
}

export default JwtAuthProvider;
