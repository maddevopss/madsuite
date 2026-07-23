import { act, renderHook, waitFor } from "@testing-library/react";
import api from "../api/api";
import { useClients } from "../hooks/useClients";

const mockRefreshAppData = jest.fn();
const mockShowToast = jest.fn();
const mockConfirm = jest.fn();

jest.mock("../api/api");
jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshAppData: mockRefreshAppData }),
}));
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock("../hooks/useConfirm", () => ({
  useConfirm: () => ({ confirm: mockConfirm, confirmProps: {} }),
}));

describe("useClients", () => {
  const clients = [
    { id: 1, nom: "Client A" },
    { id: 2, nom: "Client B" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: clients });
    mockConfirm.mockResolvedValue(true);
  });

  test("charge les données métier déjà déballées par Axios", async () => {
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.clients).toEqual(clients));
    expect(api.get).toHaveBeenCalledWith("/clients");
  });

  test("crée puis recharge un client", async () => {
    api.post.mockResolvedValue({ data: { id: 3, nom: "Client C" } });
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.clients).toEqual(clients));

    await act(async () => {
      await result.current.createClient({ nom: "Client C" });
    });

    expect(api.post).toHaveBeenCalledWith("/clients", { nom: "Client C" });
    expect(mockRefreshAppData).toHaveBeenCalled();
  });

   test("met à jour un client avec PUT", async () => {
     api.put.mockResolvedValue({ data: { id: 1, nom: "Client A+" } });
     const { result } = renderHook(() => useClients());
     await waitFor(() => expect(result.current.clients).toEqual(clients));

     await act(async () => {
       await result.current.updateClient(1, { nom: "Client A+" });
     });

     expect(api.put).toHaveBeenCalledWith("/clients/1", { nom: "Client A+" });
     expect(mockRefreshAppData).toHaveBeenCalled();
   });

   test("gère l'erreur lors de la mise à jour d'un client", async () => {
     api.put.mockRejectedValue({ response: { data: { message: "Client non trouvé" } } });
     const { result } = renderHook(() => useClients());
     await waitFor(() => expect(result.current.clients).toEqual(clients));

     await act(async () => {
       const success = await result.current.updateClient(999, { nom: "Client Inexistant" });
       expect(success).toBe(false);
     });

     expect(mockShowToast).toHaveBeenCalledWith("Client non trouvé", "error");
   });

   test("actualise la liste après une mise à jour réussie", async () => {
     api.put.mockResolvedValue({ data: { id: 1, nom: "Client A+" } });
     const { result } = renderHook(() => useClients());
     await waitFor(() => expect(result.current.clients).toEqual(clients));

     await act(async () => {
       await result.current.updateClient(1, { nom: "Client A+" });
     });

     expect(api.get).toHaveBeenCalledWith("/clients");
   });

  test("supprime un client après confirmation", async () => {
    api.delete.mockResolvedValue({ data: null });
    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.clients).toEqual(clients));

    await act(async () => {
      await result.current.deleteClient(1, "Client A");
    });

    expect(api.delete).toHaveBeenCalledWith("/clients/1");
  });
});
