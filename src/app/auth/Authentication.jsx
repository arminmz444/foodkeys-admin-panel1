import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import BrowserRouter from '@fuse/core/BrowserRouter';
import FuseAuthorization from '@fuse/core/FuseAuthorization/FuseAuthorization';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen/FuseSplashScreen';
import { resetUser, selectUserRole, setUser } from './user/store/userSlice';
import useAuth from './useAuth';
import useJwtAuth from './services/jwt/useJwtAuth';
import { loadUserFromStorage, hasStoredUserData } from '../store/rehydration';
import NotificationProvider from '../main/apps/notifications/NotificationProvider';

function Authentication(props) {
  const { children } = props;
  const { setAuthProvider, resetAuthProvider } = useAuth();
  const userRole = useAppSelector(selectUserRole);
  const dispatch = useAppDispatch();
  const { user: jwtUser, authStatus: jwtAuthStatus } = useJwtAuth();
  const [isLoading, setIsLoading] = useState(true);

  const inProgress = useMemo(() => jwtAuthStatus === 'configuring', [jwtAuthStatus]);

  const authenticated = useMemo(() => jwtAuthStatus === 'authenticated', [jwtAuthStatus]);

  const unAuthenticated = useMemo(() => jwtAuthStatus === 'unauthenticated', [jwtAuthStatus]);

  useEffect(() => {
    if (!inProgress && unAuthenticated) {
      handleSignOut();
    }
  }, [inProgress, unAuthenticated]);

  useEffect(() => {
    if (!inProgress && !authenticated) {
      setIsLoading(false);
    }
  }, [inProgress, authenticated]);

  const handleSignIn = useCallback((provider, userState) => {
    dispatch(setUser(userState)).then(() => {
      setAuthProvider(provider);
      setIsLoading(false);
    });
  }, [dispatch, setAuthProvider]);

  const handleSignOut = useCallback(() => {
    dispatch(resetUser());
    resetAuthProvider();
  }, [dispatch, resetAuthProvider]);

  useEffect(() => {
    if (!authenticated && hasStoredUserData()) {
      const storedUserData = loadUserFromStorage();
      if (storedUserData) {
        handleSignIn('jwt', storedUserData);
      }
    }
  }, []);

  useEffect(() => {
    if (inProgress || !authenticated) {
      return;
    }

    if (jwtUser) {
      handleSignIn('jwt', jwtUser);
    }
  }, [inProgress, authenticated, jwtUser, handleSignIn]);

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
