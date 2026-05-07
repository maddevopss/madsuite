import api from "./api";

const TOKEN_KEY = "token";

const authService = {
  /**
   * Connecte l'utilisateur et sauvegarde le token
   */
  login: async (email, password) => {
    const response = await api.post("/api/login", { email, password });
    const { token, success, message } = response.data;

    if (!success) throw new Error(message || "Erreur de connexion");
    if (!token) throw new Error("Token manquant du serveur");

    localStorage.setItem(TOKEN_KEY, token);
    return token;
  },

  /**
   * Déconnecte l'utilisateur et supprime le token
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Retourne le token actuel
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
