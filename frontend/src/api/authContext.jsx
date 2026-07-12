import { useState, createContext, useContext, useEffect } from "react";
import authService from "./authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authService.getToken());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [user, setUser] = useState(null);

  // Restaure le token depuis electron-store au premier montage et relance le tracking
  // (l'ancien flujo injectait via executeJavaScript — maintenant React lit via IPC)
  useEffect(() => {
    let cancelled = false;

    const isElectron = !!window?.agentAPI?.restoreToken;

    async function restoreSession() {
      try {
        if (isElectron) {
          const restoredSession = await window.agentAPI.restoreToken();
          const storedToken = typeof restoredSession === "string" ? restoredSession : restoredSession?.token;

          if (storedToken) {
            authService.setToken(storedToken);
            if (!cancelled) {
              setToken(storedToken);
              setUser(typeof restoredSession === "string" ? null : restoredSession?.user || null);
            }
            return;
          }

          // En Electron : pas de refresh "web".
          authService.setToken(null);
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        // Web mode: fallback sur refresh web.
// Web mode : synchroniser d'abord le token mémoire avec l'état React.
const currentToken = authService.getToken();

if (currentToken) {
  if (!cancelled) {
    setToken(currentToken);
  }

  return;
}

const refreshed = await authService.refreshSession();

if (!cancelled) {
  setToken(refreshed.token);
  setUser(refreshed.user || null);
}
      } catch {
        // En mode tests (ou si AuthProvider non présent), on garde un comportement dégradé.
        // Certains tests montent des pages sans wrapper AuthProvider.
        authService.setToken(null);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Electron: synchroniser le token via IPC (sans refresh web)
  useEffect(() => {
    if (!window?.agentAPI) return;

    const isElectron = !!window.agentAPI?.restoreToken;
    if (!isElectron) return;

    const unsubTokenRefreshed = window.agentAPI.onAgentTokenRefreshed?.((payload) => {
      const newToken = payload?.token;
      if (newToken) {
        authService.setToken(newToken);
        setToken(newToken);
      }
      if (payload?.user) {
        setUser(payload.user);
      }
    });

    const unsubAuthExpired = window.agentAPI.onAuthExpired?.(() => {
      authService.setToken(null);
      setToken(null);
      setUser(null);

      if (window.agentAPI?.stopTracking) {
        try {
          window.agentAPI.stopTracking();
        } catch {
          // ignore
        }
      }
    });

    const unsubProtocolAuth = window.agentAPI.onProtocolAuthToken?.(async (payload) => {
      if (payload?.token) {
        try {
          await window.agentAPI.startTracking(payload.token);
          authService.setToken(payload.token);
          window.location.href = '/';
        } catch (err) {
          console.error("Failed to authenticate via protocol token", err);
        }
      }
    });

    return () => {
      try {
        unsubTokenRefreshed?.();
      } catch {
        // ignore
      }
      try {
        unsubAuthExpired?.();
      } catch {
        // ignore
      }
      try {
        unsubProtocolAuth?.();
      } catch {
        // ignore
      }
    };
  }, []);


  useEffect(() => {
    function handleTokenRefreshed(event) {
      const newToken = event?.detail?.token;
      if (!newToken) return;

      setToken(newToken);
      if (event?.detail?.user) {
        setUser(event.detail.user);
      }
    }

    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
  }, []);

  // LOGIN
  const handleLogin = (session) => {
    const newToken = typeof session === "string" ? session : session?.token;
    const newUser = typeof session === "string" ? null : session?.user;

    setToken(newToken);
    authService.setToken(newToken);

    setUser(newUser || null);
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await authService.logout();

      if (window.agentAPI?.stopTracking) {
        await window.agentAPI.stopTracking();
      }
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAuthLoading,
        onLogin: handleLogin,
        onLogout: handleLogout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }

  return context;
}

export default AuthContext;
