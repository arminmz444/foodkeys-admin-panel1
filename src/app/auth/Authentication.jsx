import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import BrowserRouter from "@fuse/core/BrowserRouter";
import FuseAuthorization from "@fuse/core/FuseAuthorization/FuseAuthorization";
import FuseSplashScreen from "@fuse/core/FuseSplashScreen/FuseSplashScreen";
import { resetUser, selectUserRole, setUser } from "./user/store/userSlice";
import useAuth from "./useAuth";
import UserModel from "./user/models/UserModel";
import useJwtAuth from "./services/jwt/useJwtAuth";
import useFirebaseAuth from "./services/firebase/useFirebaseAuth";
import { loadUserFromStorage, hasStoredUserData } from "../store/rehydration";
import NotificationProvider from "../main/apps/notifications/NotificationProvider";

function Authentication(props) {
	const { children } = props;
	const { setAuthProvider, resetAuthProvider } = useAuth();
	const userRole = useAppSelector(selectUserRole);
	const dispatch = useAppDispatch();
	/**
	 * Auth Providers
	 */
	/**
	 * Amplify Auth
	 */
	const { user: amplifyUser, authStatus: amplifyAuthStatus } = useAuthenticator();
	/**
	 * JWT Auth
	 */
	const { user: jwtUser, authStatus: jwtAuthStatus } = useJwtAuth();
	/**
	 * Firebase Auth
	 */
	const { user: firebaseUser, authStatus: firebaseAuthStatus } = useFirebaseAuth();
	/**
	 * isLoading
	 */
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Check if services is in loading state
	 */
	const inProgress = useMemo(
		() =>
			amplifyAuthStatus === "configuring" ||
			jwtAuthStatus === "configuring" ||
			firebaseAuthStatus === "configuring",
		[amplifyAuthStatus, jwtAuthStatus, firebaseAuthStatus]
	);

	/**
	 * Any user is authenticated
	 */
	const authenticated = useMemo(
		() =>
			amplifyAuthStatus === "authenticated" ||
			jwtAuthStatus === "authenticated" ||
			firebaseAuthStatus === "authenticated",
		[amplifyAuthStatus, jwtAuthStatus, firebaseAuthStatus]
	);

	/**
	 * All users are unauthenticated
	 */
	const unAuthenticated = useMemo(
		() =>
			amplifyAuthStatus === "unauthenticated" &&
			jwtAuthStatus === "unauthenticated" &&
			firebaseAuthStatus === "unauthenticated",
		[amplifyAuthStatus, jwtAuthStatus, firebaseAuthStatus]
	);
	/**
	 * Sign Out
	 */
	useEffect(() => {
		if (!inProgress && unAuthenticated) {
			handleSignOut();
		}
	}, [inProgress, authenticated]);
	/**
	 * Loading state is false when all services are done loading
	 */
	useEffect(() => {
		if (!inProgress && !authenticated) {
			setIsLoading(false);
		}
	}, [inProgress, authenticated]);
	/**
	 * Handle sign in
	 */
	const handleSignIn = useCallback((provider, userState) => {
		dispatch(setUser(userState)).then(() => {
			setAuthProvider(provider);
			setIsLoading(false);
		});
	}, []);
	/**
	 * Handle sign out
	 */
	const handleSignOut = useCallback(() => {
		dispatch(resetUser());
		resetAuthProvider();
	}, []);
	/**
	 * Load user data from localStorage on mount (for page refresh scenarios)
	 */
	useEffect(() => {
		// Only load from localStorage if no user is currently authenticated
		// and we have stored user data
		if (!authenticated && hasStoredUserData()) {
			const storedUserData = loadUserFromStorage();
			if (storedUserData) {
				handleSignIn("jwt", storedUserData);
			}
		}
	}, []); // Run only once on mount

	/**
	 * Handle Sign In on load
	 */
	useEffect(() => {
		if (inProgress || !authenticated) {
			return;
		}

		if (amplifyUser) {
			fetchUserAttributes()
				.then((userAttributes) => {
					handleSignIn(
						"amplify",
						UserModel({
							uid: amplifyUser.userId,
							data: {
								displayName: userAttributes?.name,
								email: userAttributes?.email
							},
							role: ["ADMIN"]
						})
					);
				})
				.catch((err) => {
					console.error(err);
				});
		}

		if (jwtUser) {
			handleSignIn("jwt", jwtUser);
		}

		if (firebaseUser) {
			handleSignIn(
				"firebase",
				UserModel({
					uid: firebaseUser.uid,
					data: firebaseUser.data,
					role: ["ADMIN"]
				})
			);
		}
	}, [inProgress, authenticated, amplifyUser, jwtUser, firebaseUser, isLoading]);
	return useMemo(
		() =>
			isLoading ? (
				<FuseSplashScreen />
			) : (
				<BrowserRouter>
					<NotificationProvider>
						<FuseAuthorization userRole={userRole}>{children}</FuseAuthorization>
					</NotificationProvider>
				</BrowserRouter>
			),
		[userRole, children, isLoading]
	);
}

export default Authentication;
