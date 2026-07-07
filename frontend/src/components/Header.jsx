import { memo, useState } from "react";
import logo from "../assets/logo.png";
import { PlayIcon, PauseIcon, BsSun, BsMoon } from "../assets/Icon/idx_icon";
import { useTheme } from "../ThemeContext";
import ActivitySuggestionBadge from "./activity-intelligence/ActivitySuggestionBadge";
import FocusTunnel from "../pages/Dashboard/FocusTunnel";
import AnchorRitualModal from "./AnchorRitualModal";
import CognitiveMirrorModal from "./CognitiveMirrorModal";
import { useHeaderState } from "../hooks/useHeaderState";
import { useNotifications } from "../hooks/useNotifications";
import MobileDrawer from "./MobileDrawer";
import "./layout/header.css";

const ResumeProjectButton = memo(function ResumeProjectButton({ project, onResume }) {
  return (
    <button type="button" className="resume-project" onClick={() => onResume(project)}>
      <span
        className="resume-dot"
        style={{
          background: project.projet_couleur || "var(--color-primary)",
        }}
      />

      <span>
        Reprendre {project.client_nom} / {project.projet_nom}
      </span>
    </button>
  );
});

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { state, actions } = useHeaderState();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
    <header className="header">
      <button
        className="mobile-menu-button"
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={mobileDrawerOpen}
        aria-controls="mobile-drawer"
      >
        ☰
      </button>
      <div
        className="timer-project-dot"
        style={{
          background: state.activeEntry?.projet_couleur,
        }}
      />

      <img src={logo} className="App-logo" alt="logo" />

      <div className="timer-bar">
        {state.isRunning && (
          <div
            className="timer-visual-progress"
            style={{ width: `${state.progressPercent}%` }}
          />
        )}
        <div className={`timer-status ${state.isRunning ? "running" : "idle"}`} />

        {!state.isRunning && state.visibleTodayProjects.length > 0 && (
          <div className="resume-projects">
            {state.visibleTodayProjects.map((p) => (
              <ResumeProjectButton key={p.projet_id} project={p} onResume={actions.resumeProject} />
            ))}
          </div>
        )}

        <input
          className="timer-input"
          placeholder="Mon objectif (ex: 'Écrire 1 phrase', 'Ouvrir Figma') :"
          value={state.description}
          onChange={(e) => actions.setDescription(e.target.value)}
          disabled={state.isRunning}
        />

        {state.isRunning && state.isLongRunning && state.activeTimerWarning && (
          <div className="timer-warning">
            <div className="timer-warning__text">⚠️ {state.activeTimerWarning}</div>

            <button type="button" className="timer-warning__button" onClick={actions.stopActiveTimer}>
              Terminer maintenant
            </button>
          </div>
        )}

        {state.isRunning && state.activeEntry && (
          <div className="timer-note">
            <input
              type="text"
              value={state.note}
              onChange={(e) => actions.setNote(e.target.value)}
              placeholder="Note rapide sur le timer actif..."
              className="timer-note__input"
            />

            <button type="button" className="timer-note__button" onClick={() => actions.updateNote(state.note)}>
              Sauvegarder
            </button>
          </div>
        )}

        <select
          value={state.selectedClient || ""}
          onChange={actions.handleClientChange}
          disabled={state.isRunning}>
          <option value="">Client</option>
          {(state.clients || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>

        <select
          value={state.selectedProjet || ""}
          onChange={actions.handleProjetChange}
          disabled={state.isRunning || !state.selectedClient}>
          <option value="">Projet</option>
          {(state.projetsFiltres || []).map((p) => (
            <option key={p.id || p.projet_id} value={p.id || p.projet_id}>
              {p.projet || p.projet_nom || p.nom}
            </option>
          ))}
        </select>

        {state.activeEntry && (
          <div className="timer-active-project">
            <span>{state.activeEntry.projet_nom}</span>
          </div>
        )}

        <button
          className="timer-play"
          onClick={actions.handlePlayClick}
          style={state.isPulsing ? { animation: 'pulse-primary 2s infinite', boxShadow: '0 0 15px rgba(var(--color-primary-rgb), 0.5)' } : {}}
        >
          {state.isRunning ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="timer-live">
          <span className="timer-live-time">{state.elapsedFormatted}</span>

          {state.isRunning && state.activeEntry && (
            <span className="timer-live-project">
              {state.activeEntry.client_nom} / {state.activeEntry.projet_nom}
            </span>
          )}
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Basculer le thème"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-primary)", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "dark" ? <BsSun size={20} /> : <BsMoon size={20} />}
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", position: "relative" }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{ position: "absolute", top: "100%", right: "0", width: "300px", background: "var(--bg-panel)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 1000, maxHeight: "400px", overflowY: "auto" }}>
              <div style={{ padding: "10px", fontWeight: "bold", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)", borderRadius: "8px 8px 0 0" }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: "15px", textAlign: "center", color: "var(--text-secondary)" }}>Aucune notification</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", opacity: n.is_read ? 0.6 : 1, cursor: n.is_read ? "default" : "pointer" }}
                    onClick={() => { if(!n.is_read) markAsRead(n.id); }}
                  >
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{new Date(n.created_at).toLocaleString('fr-FR')}</div>
                    <div style={{ fontSize: "14px", color: "var(--text-primary)" }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <ActivitySuggestionBadge />

        {state.syncPendingCount > 0 && (
          <div title="Données en attente de synchronisation locale" style={{ color: "var(--color-warning)", fontWeight: "bold", fontSize: "0.85rem", marginLeft: "12px", display: "flex", alignItems: "center", background: "rgba(255,165,0,0.1)", padding: "4px 8px", borderRadius: "8px" }}>
            ☁️ Sync: {state.syncPendingCount} pending
          </div>
        )}

        {state.isRunning && (
          <button
            className="theme-toggle"
            onClick={() => actions.setShowFocusTunnel(true)}
            title="Entrer dans le tunnel"
            style={{ background: "var(--color-danger)", color: "white", borderRadius: "16px", padding: "4px 12px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem", marginLeft: "8px" }}
          >
            🌑 Tunnel
          </button>
        )}
      </div>

      <FocusTunnel show={state.showFocusTunnel} onClose={() => actions.setShowFocusTunnel(false)} />
      <AnchorRitualModal
        show={state.showAnchorRitual}
        onClose={() => actions.setShowAnchorRitual(false)}
        onConfirm={actions.handleAnchorConfirm}
      />
      <CognitiveMirrorModal
        show={state.showCognitiveMirror}
        onClose={() => actions.setShowCognitiveMirror(false)}
        intent={state.mirrorData.intent}
        startTime={state.mirrorData.startTime}
        endTime={state.mirrorData.endTime}
      />
    </header>
    <MobileDrawer
      id="mobile-drawer"
      isOpen={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
    />
    </>
  );
}
