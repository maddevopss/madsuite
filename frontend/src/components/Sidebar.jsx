import { NavLink } from "react-router-dom";
import { useAuth } from "../api/authContext";
import { env } from "../env";
import "./layout/sidebar.css";

import { AnimatePresence, motion } from "framer-motion";
import {
  AiOutlineDashboard,
  AiOutlineCar,
  AiOutlineBarChart,
  AiOutlineTeam,
  AiOutlineContacts,
  AiOutlineTablet,
  IoSettingsOutline,
  AiOutlineSchedule,
  AiOutlineFundProjectionScreen,
} from "../assets/Icon/idx_icon";
import PageHeader from "./PageHeader";

const showAnimation = {
  hidden: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
  show: {
    opacity: 1,
    width: "auto",
    transition: {
      duration: 0.5,
    },
  },
};

function AnimatedLabel({ children, className }) {
  return (
    <AnimatePresence>
      <motion.div variants={showAnimation} initial="hidden" animate="show" exit="hidden" className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function SidebarNavLink({ to, icon: Icon, label, badge, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
      {Icon && (
        <div className="nav-icon">
          <Icon />
        </div>
      )}
      {label ? <AnimatedLabel className="nav-link-text">{label}</AnimatedLabel> : children}
      {badge ? <span className="sidebar-badge">{badge}</span> : null}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, onLogout } = useAuth();
  const isAdmin = user?.role === "admin";
  // Note: "administrateur" est un alias legacy de "admin" — à unifier côté backend dans une prochaine migration.
  const isAdministrateur = user?.role === "administrateur" || user?.role === "admin";

  return (
    <div className="sidebar">
      <div className="logo">
        <PageHeader title="Gestion du temps" />
        <div className="logo-sub">Innovation Numérique</div>
        <div className="sidebar-user-info">
          <strong>{user?.nom}</strong>
          <span>{user?.role}</span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div className="nav-section">
        <AnimatedLabel className="nav-label">PRINCIPAL</AnimatedLabel>
        <SidebarNavLink to="/dashboard" icon={AiOutlineDashboard} label="Tableau de bord" />
        <SidebarNavLink to="/timesheet" icon={AiOutlineSchedule} label="Feuilles de temps" />
        <SidebarNavLink to="/reports" icon={AiOutlineBarChart} label="Rapport" />
      </div>

      <div className="nav-section">
        <AnimatedLabel className="nav-label">GESTION</AnimatedLabel>
        <SidebarNavLink to="/projets" icon={AiOutlineFundProjectionScreen} label="Projet" />
        <SidebarNavLink to="/clients" icon={AiOutlineContacts} label="Client" />
        <SidebarNavLink to="/estimates" icon={AiOutlineFundProjectionScreen} label="Soumissions" />
        <SidebarNavLink to="/invoices" icon={AiOutlineFundProjectionScreen} label="Facturation" />
        <SidebarNavLink to="/expenses" icon={AiOutlineCar} label="Dépenses & Km" />

        {isAdmin && <SidebarNavLink to="/users" icon={AiOutlineTeam} label="TEAM" />}
        {isAdministrateur && <SidebarNavLink to="/organisations" icon={AiOutlineTeam} label="ORGANISATIONS" />}

        <SidebarNavLink to="/settings" icon={IoSettingsOutline} label="SETTINGS" />
      </div>

      <div className="nav-section">
        <AnimatedLabel className="nav-label">MODULES & INNOVATION</AnimatedLabel>
        {isAdmin && (
          <NavLink to="/innovation" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            <span className="nav-link-text">Innovation IA</span>
          </NavLink>
        )}

        <SidebarNavLink to="/mobilepunch" icon={AiOutlineTablet} label="Mobile Punch" />
        <SidebarNavLink to="/calculkm" icon={AiOutlineCar} label="Calcul Km" />
      </div>
    </div>
  );
}
