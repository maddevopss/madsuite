import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import api from "../api/api";
import { useFunnelStatus } from "../hooks/useFunnelStatus";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ActivitySuggestionPopup from "./activity-intelligence/ActivitySuggestionPopup";
import AiCopilot from "./AiCopilot/AiCopilot";
import CognitiveMetricsPanel from "./activity-intelligence/CognitiveMetricsPanel";
import "./layout/appShell.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasClients, hasEstimates, hasInvoices, loading } = useFunnelStatus();

  useEffect(() => {
    // Check onboarding status
    api.get("/onboarding/status").then((res) => {
      if (res.data && res.data.data && res.data.data.completed === false) {
        navigate("/onboarding", { replace: true });
      }
    }).catch(() => {
      // ignore
    });
  }, [navigate]);

  useEffect(() => {
    // Funnel intercept: strict linear flow to first invoice for new users
    if (loading) return;

    const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
    if (isDashboard && !hasInvoices) {
      if (!hasClients) {
        navigate("/clients", { replace: true });
      } else if (!hasEstimates) {
        navigate("/estimates", { replace: true });
      } else {
        navigate("/invoices", { replace: true });
      }
    }
  }, [location.pathname, hasClients, hasEstimates, hasInvoices, loading, navigate]);
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      <ActivitySuggestionPopup />
      <AiCopilot />
      <CognitiveMetricsPanel />
    </div>
  );
}
