import api from "./api";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";


const authService = {
  // Connecte l'utilisateur et sauvegarde le token.
  // En Electron, on passe par le main process pour que le cookie refresh HTTP-only
  // soit capturé et conservé côté agent. Sinon le refresh desktop casse après expiration.
  login: async (email, password) => {
    const isElectron = !!window.agentAPI?.login;
    let data;

    if (isElectron) {
      data = await window.agentAPI.login({ email, password });
    } else {
      const response = await api.post("/login", { email, password });
      data = response.data;
    }

    const { token, user, success, message } = data || {};

    if (!success) throw new Error(message || "Erreur de connexion");

    // Sécurité : Le token ne doit JAMAIS toucher le localStorage en mode Web
    if (!isElectron) {
      setAccessToken(token); // Uniquement en mémoire (tokenStore.js)
    }
    return { token, user };
  },

  signup: async (organisation_nom, user_nom, email, password) => {
    const response = await api.post("/signup", { organisation_nom, user_nom, email, password });
    const data = response.data;

    const { token, user, success, message } = data || {};

    if (!success) throw new Error(message || "Erreur lors de l'inscription");

    // Sécurité : Le token ne doit JAMAIS toucher le localStorage en mode Web
    if (!window.agentAPI?.login) {
      setAccessToken(token);
    }
    return { token, user };
  },

  // Déconnecte l'utilisateur et supprime le token
  logout: async () => {
    const isElectron = typeof window !== "undefined" && window.agentAPI?.stopTracking;

    try {
      // 1. Appel au backend pour invalider le refresh_token (HttpOnly cookie)
      await api.post("/logout");

      // 2. Si Electron, on demande au main process de vider son store sécurisé
      if (isElectron) await window.agentAPI.stopTracking();
    } catch (err) {
      console.warn("Erreur lors de la déconnexion serveur:", err);
    } finally {
      // 3. Nettoyage systématique des stores locaux (Mémoire + Cache UI)
      clearAccessToken();
    }
  },

  refreshSession: async () => {
    const response = await api.post("/refresh");
    const token = response.data?.token || response.data?.access_token;
    const user = response.data?.user || null;

    if (!token) throw new Error("Token manquant du serveur");

    setAccessToken(token);
    return { token, user };
  },

  // Retourne le token actuel
  getToken: () => {
    return getAccessToken();
  },

  setToken: (token) => {
    setAccessToken(token);
  },

  // Retourne les informations de l'utilisateur connecté
  // Côté frontend, on le considère uniquement comme cache et on vérifie le token d'abord.
  getUser: () => {
    return null;
  },

  // Vérifie si l'utilisateur est connecté
  isAuthenticated: () => {
    // On vérifie uniquement la présence du token en mémoire.
    // Si absent, l'intercepteur dans api.jsx tentera un refresh automatique au besoin.
    return !!getAccessToken();
  },
};

export default authService;
