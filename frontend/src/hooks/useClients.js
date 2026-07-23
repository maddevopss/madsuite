import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/api";
import { updateClient as updateClientAPI } from "../api/clients.api";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { useConfirm } from "./useConfirm";

/**
 * Hook useClients - Optimisé pour MADSuite
 * Gère la synchronisation des clients avec l'API.
 * Conçu pour fonctionner avec AddClientForm (react-hook-form + Zod).
 */
export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(false);
  const { refreshAppData } = useRefresh();
  const { showToast } = useToast();
  const { confirmProps, confirm } = useConfirm();

  // 1. Chargement des clients
  const loadClients = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const response = await api.get("/clients");
      if (!mountedRef.current) return;
      setClients(response.data);
    } catch (err) {
      if (!mountedRef.current) return;
      showToast("Erreur lors du chargement des clients.", "error");
      console.error("Load clients error:", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    mountedRef.current = true;
    loadClients();
    return () => {
      mountedRef.current = false;
    };
  }, [loadClients]);

  // 2. Création d'un client (reçoit les données validées par Zod)
  const createClient = async (clientData) => {
    try {
      await api.post("/clients", clientData);
      showToast("Client créé avec succès.", "success");
      await loadClients();
      refreshAppData(); // Notifie le reste de l'app (ex: sélecteurs de projets)
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la création.";
      showToast(message, "error");
      return false;
    }
  };

  // 3. Mise à jour d'un client
  const updateClient = async (id, clientData) => {
    try {
      await updateClientAPI(id, clientData);
      showToast("Client mis à jour avec succès.", "success");
      await loadClients();
      refreshAppData();
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la modification.";
      showToast(message, "error");
      return false;
    }
  };

  // 4. Suppression avec confirmation
  const deleteClient = async (id, nom) => {
    const ok = await confirm(`Supprimer le client "${nom || id}" ? Cela pourrait affecter les projets associés.`);
    if (!ok) return false;

    try {
      await api.delete(`/clients/${id}`);
      showToast("Client supprimé.", "success");
      await loadClients();
      refreshAppData();
      return true;
    } catch (err) {
      showToast("Erreur lors de la suppression. Vérifiez si des projets sont liés.", "error");
      return false;
    }
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    confirmProps,
    refreshClients: loadClients,
  };
};
