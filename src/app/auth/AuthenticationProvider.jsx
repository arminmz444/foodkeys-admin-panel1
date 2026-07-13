import { createContext, useCallback, useMemo, useState } from 'react';
import Authentication from './Authentication';
import JwtAuthProvider from './services/jwt/JwtAuthProvider';

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  setAuthProvider: () => {},
  getAuthProvider: () => null,
  resetAuthProvider: () => null,
});

const authProviderLocalStorageKey = 'fuseReactAuthProvider';

function AuthenticationProvider(props) {
  const { children } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getAuthProvider = useCallback(() => {
    return localStorage.getItem(authProviderLocalStorageKey);
  }, []);

  const setAuthProvider = useCallback((authProvider) => {
    if (authProvider) {
      localStorage.setItem(authProviderLocalStorageKey, authProvider);
    }
  }, []);

  const resetAuthProvider = useCallback(() => {
    localStorage.removeItem(authProviderLocalStorageKey);
  }, []);

  const contextValue = useMemo(
    () => ({
      setIsAuthenticated,
      isAuthenticated,
      getAuthProvider,
      setAuthProvider,
      resetAuthProvider,
    }),
    [getAuthProvider, setAuthProvider, resetAuthProvider, setIsAuthenticated, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <JwtAuthProvider>
        <Authentication>{children}</Authentication>
      </JwtAuthProvider>
    </AuthContext.Provider>
  );
}

export default AuthenticationProvider;
