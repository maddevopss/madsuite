import axios from "axios";
import { env } from "../env";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

const API_URL = env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables pour gérer le rafraîchissement concurrent
let isRefreshing = false;
let failedQueue = [];
const authChannel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth_sync") : null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  clearAccessToken();

  if (typeof window !== "undefined" && window.location) {
    const isAlreadyOnLogin = window.location.pathname === "/login";
    try {
      if (!isAlreadyOnLogin) {
        sessionStorage.setItem("auth_notice", "Votre session a expire. Reconnectez-vous pour continuer.");
      }
      window.dispatchEvent(new CustomEvent("auth:expired"));
    } catch {
      // ignore storage/event errors
    }

    if (env.NODE_ENV !== "test" && !isAlreadyOnLogin) {
      window.location.replace("/login");
    }
  }
};

// Écoute les signaux de session provenant d'autres onglets.
// Règle MADPROOF: ne jamais recevoir ni transmettre de token brut via BroadcastChannel.
if (authChannel) {
  authChannel.onmessage = (event) => {
    const { type, error } = event.data || {};

    if (type === "SESSION_REFRESHED" || type === "SESSION_UPDATED") {
      cachedExpiry = null;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session-updated"));
      }
    } else if (type === "SESSION_REFRESH_ERROR") {
      processQueue(new Error(error || "Session refresh failed"), null);
      isRefreshing = false;
      redirectToLogin();
    } else if (type === "SESSION_CLEARED") {
      processQueue(new Error("Session cleared"), null);
      isRefreshing = false;
      clearAccessToken(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    }
  };
}

// Écoute les mises à jour de jeton pour réinitialiser le cache d'expiration
if (typeof window !== "undefined") {
  window.addEventListener("token:updated", (e) => {
    const newToken = e.detail?.token;
    lastToken = newToken;
    cachedExpiry = null; // Force le recalcul lors du prochain accès
  });
}

// Cache local pour l'expiration
let cachedExpiry = null;
let lastToken = null;

const getExpiryFromToken = (token) => {
  if (!token) return null;
  if (token === lastToken && cachedExpiry) return cachedExpiry;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    lastToken = token;
    cachedExpiry = payload.exp;
    return cachedExpiry;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const exp = getExpiryFromToken(token);
  if (!exp) return false;
  const buffer = 30;
  return exp < Date.now() / 1000 + buffer;
};

// Logique de rafraîchissement centralisée pour éviter le gaspillage
const refreshTokenIfNeeded = async () => {
  const isElectron = typeof window !== "undefined" && window.agentAPI?.refreshToken;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Chemin Electron : Délégation totale au Main Process
    if (isElectron) {
      const refreshData = await window.agentAPI.refreshToken();
      const newToken = refreshData?.token || refreshData?.access_token;
      if (!newToken) throw new Error("Refresh Agent sans nouveau token.");

      setAccessToken(newToken);
      processQueue(null, newToken);
      return newToken;
    }

    // Chemin Web : Utilisation de Web Locks pour coordonner entre les onglets
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request("auth_refresh_lock", async () => {
        try {
          // DOUBLE-CHECK : Un autre onglet a peut-être déjà fini le refresh pendant qu'on attendait le verrou
          const currentToken = getAccessToken();
          if (!isTokenExpired(currentToken)) {
            processQueue(null, currentToken);
            return currentToken;
          }

          const refreshData = await api.post("/refresh").then((res) => res.data);
          const newToken = refreshData?.token || refreshData?.access_token;
          if (!newToken) throw new Error("Refresh sans nouveau token.");

          cachedExpiry = null;
          setAccessToken(newToken);

          // Notifier les autres onglets sans transmettre le token.
          if (authChannel) {
            authChannel.postMessage({ type: "SESSION_REFRESHED" });
          }

          window.dispatchEvent(
            new CustomEvent("auth:token-refreshed", {
              detail: { token: newToken, user: refreshData?.user },
            }),
          );

          processQueue(null, newToken);
          return newToken;
        } catch (err) {
          throw err; // Sera attrapé par le catch global en bas
        }
      });
    }

    // Fallback Web (vieux navigateurs)
    const refreshData = await api.post("/refresh").then((res) => res.data);
    const newToken = refreshData?.token || refreshData?.access_token;
    if (!newToken) throw new Error("Refresh sans nouveau token.");

    cachedExpiry = null;
    setAccessToken(newToken);

    if (authChannel) {
      authChannel.postMessage({ type: "SESSION_REFRESHED" });
    }

    processQueue(null, newToken);
    return newToken;
  } catch (err) {
    if (authChannel && !isElectron) {
      authChannel.postMessage({ type: "SESSION_REFRESH_ERROR", error: err.message });
    }
    processQueue(err, null);
    redirectToLogin();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

// Les cookies httpOnly portent l'auth côté web; on garde seulement la mémoire du token
// pour les transitions de session et les refreshs forcés si nécessaire.
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  // Routes publiques/auth : pas besoin de refresh préventif
  const requestUrl = config?.url || "";
  const isAuthRoute =
    requestUrl.includes("/refresh") ||
    requestUrl.includes("/login") ||
    requestUrl.includes("/signup") ||
    requestUrl.includes("/logout");

  config.headers ||= {};

  if (token && !isAuthRoute) {
    // Si le token est expiré ou va bientôt l'être, on refresh AVANT d'envoyer
    if (isTokenExpired(token)) {
      token = await refreshTokenIfNeeded();
    }
  }

  return config;
});

// Intercepte les 401
api.interceptors.response.use(
  (response) => {
    const body = response?.data;

    // Normalisation pour le reste de l'application (success/data/code)
    if (
      body &&
      typeof body === "object" &&
      typeof body.success === "boolean" &&
      typeof body.code === "string" &&
      Object.prototype.hasOwnProperty.call(body, "data")
    ) {
      return {
        ...response,
        apiResponse: body,
        data: body.data,
      };
    }

    return response;
  },
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    const isUnauthorized = status === 401;
    const isAlreadyOnLogin = typeof window !== "undefined" && window.location && window.location.pathname === "/login";

    if (!isUnauthorized || !originalRequest) return Promise.reject(error);

    // Évite de rafraîchir pendant un refresh ou un logout.
    const originalUrl = originalRequest.url || "";

    if (isAlreadyOnLogin || originalUrl.includes("/refresh") || originalUrl.includes("/logout") || originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Si malgré la prédiction le serveur renvoie 401 (ex: révocation manuelle)
    originalRequest._retry = true;
    try {
      await refreshTokenIfNeeded();
      if (originalRequest.headers) {
        delete originalRequest.headers.Authorization;
        delete originalRequest.headers.authorization;
      }
      return api(originalRequest);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  },
);

// Simple funnel tracking helper (non-blocking) — défini après `api` pour éviter la référence circulaire.
export async function trackFunnelEvent(eventName, metadata = {}) {
  try {
    await api.post("/analytics/track", { event_name: eventName, metadata });
  } catch (e) {
    // ignore tracking errors
  }
}

export default api;
