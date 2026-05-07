import { NavLink } from "react-router-dom";
import { DashboardIcon, UserIcon, TimeIcon, ReportsIcon, MobpunchIcon, KmIcon } from "../Icon/idx_icon";
import { useAuth } from "../api/authContext";
import "./components.css";

export default function Sidebar() {
  const { onLogout } = useAuth();
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-name">Gestion du temps</div>
        <div className="logo-sub">Innovation Numérique</div>
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-label">Principal</div>

        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <DashboardIcon className="icon" />
          Tableau de bord
        </NavLink>

        <NavLink to="/timesheet" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <TimeIcon className="icon" />
          Feuilles de temps
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <ReportsIcon className="icon" />
          Rapports
        </NavLink>
      </div>

      <div className="nav-section">
        <div className="nav-label">Gestion</div>

        <NavLink to="/clients" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <UserIcon className="icon" />
          Clients & projets
        </NavLink>
      </div>

      <div className="nav-section">
        <div className="nav-label">Modules futurs</div>

        <div className="nav-item coming-soon">
          <MobpunchIcon className="icon" />
          Punch mobile
          <span className="badge">Bientôt</span>
        </div>

        <div className="nav-item coming-soon">
          <KmIcon className="icon" />
          Calcul km
          <span className="badge">Bientôt</span>
        </div>
      </div>
    </div>
  );
}
