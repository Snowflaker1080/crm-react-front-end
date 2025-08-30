import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within <AuthProvider>.');
  }
  return ctx;
};

export default useAuth;