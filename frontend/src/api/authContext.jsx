import { createContext, useContext, useState } from "react";
import authService from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authService.getToken());

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        onLogin: handleLogin,
        onLogout: handleLogout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'auth
 * Usage: const { isAuthenticated, onLogout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}

export default AuthContext;
