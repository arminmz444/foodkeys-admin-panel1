import { useContext } from 'react';
import useJwtAuth from './services/jwt/useJwtAuth';
import { AuthContext } from './AuthenticationProvider';

function useAuth() {
  const context = useContext(AuthContext);
  const { signOut: jwtSignOut, updateUser: jwtUpdateUser } = useJwtAuth();

  if (!context) {
    throw new Error('useAuth must be used within a AuthRouteProvider');
  }

  const signOut = () => {
    jwtSignOut();
  };

  const updateUser = (user) => {
    jwtUpdateUser(user);
  };

  return { ...context, signOut, updateUser };
}

export default useAuth;
