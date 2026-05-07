import { useState } from "react";
import { UserIcon } from "../Icon/idx_icon";
import "../styles/clients.css";

export default function Clients() {
  const [activeView] = useState("clients");

  const handleBuildModule = () => {
    // sendPrompt est disponible dans le contexte Claude artifact seulement
    // En production, adapter selon le besoin (ex: modal, navigation, etc.)
    console.log("Construire le module Clients & Projets");
  };

  return (
    <div>
      <h1>Gestion des clients</h1>

      <div className={`view ${activeView === "clients" ? "active" : ""}`} id="view-clients">
        <div>
          <UserIcon className="icon" />
          <span>Module clients & projets — prochain sprint</span>
          <button className="btn" onClick={handleBuildModule}>
            Construire ce module ↗
          </button>
        </div>
      </div>
    </div>
  );
}
