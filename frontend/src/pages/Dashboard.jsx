import { useState, useEffect, useRef } from "react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [activeView] = useState("dashboard");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // secondes
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  return (
    <div>
      <h1>Bienvenue sur le tableau de bord</h1>
      <div className={`view ${activeView === "dashboard" ? "active" : ""}`} id="view-dashboard">
        <div className="timer-bar">
          <div className={`timer-status ${isRunning ? "running" : "idle"}`} id="t-dot"></div>
          <input className="timer-input" id="t-desc" placeholder="Sur quoi travaillez-vous ?" />
          <select>
            <option>Client / Projet</option>
            <option>Tremblay & Ass.</option>
            <option>Gagnon inc.</option>
            <option>Martin SENC</option>
          </select>
          <div className="timer-clock" id="t-clock">
            {formatTime(elapsed)}
          </div>
          <button className="timer-play" id="t-btn" onClick={toggleTimer}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              {isRunning ? (
                // Icône pause
                <>
                  <rect x="2" y="1" width="2.5" height="8" fill="var(--color-background-primary)" />
                  <rect x="5.5" y="1" width="2.5" height="8" fill="var(--color-background-primary)" />
                </>
              ) : (
                // Icône play
                <polygon points="2,1 9,5 2,9" fill="var(--color-background-primary)" />
              )}
            </svg>
          </button>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metric-label">Cette semaine</div>
            <div className="metric-value">31h 20</div>
            <div className="metric-sub">+3h vs sem. dernière</div>
          </div>
          <div className="metric">
            <div className="metric-label">Ce mois</div>
            <div className="metric-value">124h</div>
            <div className="metric-sub">Objectif: 160h</div>
          </div>
          <div className="metric">
            <div className="metric-label">Facturable</div>
            <div className="metric-value">89%</div>
            <div className="metric-sub">110h / 124h</div>
          </div>
          <div className="metric">
            <div className="metric-label">À facturer</div>
            <div className="metric-value">4 850 $</div>
            <div className="metric-sub">Taux: 44$/h moy.</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Temps par client — mai 2025</div>
            <div className="client-row">
              <div className="client-dot"></div>
              <span className="client-name">Tremblay & Ass.</span>
              <span className="client-hours">42h</span>
              <div className="client-bar-wrap">
                <div className="client-bar"></div>
              </div>
            </div>
            <div className="client-row">
              <div className="client-dot"></div>
              <span className="client-name">Gagnon inc.</span>
              <span className="client-hours">31h</span>
              <div className="client-bar-wrap">
                <div className="client-bar"></div>
              </div>
            </div>
            <div className="client-row">
              <div className="client-dot"></div>
              <span className="client-name">Martin SENC</span>
              <span className="client-hours">28h</span>
              <div className="client-bar-wrap">
                <div className="client-bar"></div>
              </div>
            </div>
            <div className="client-row">
              <div className="client-dot"></div>
              <span className="client-name">Lavoie et fils</span>
              <span className="client-hours">14h</span>
              <div className="client-bar-wrap">
                <div className="client-bar"></div>
              </div>
            </div>
            <div className="client-row">
              <div className="client-dot"></div>
              <span className="client-name">Autres</span>
              <span className="client-hours">9h</span>
              <div className="client-bar-wrap">
                <div className="client-bar"></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Activité des 7 derniers jours</div>
            <svg viewBox="0 0 260 100" width="100%">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points="18,72 55,48 92,60 129,30 166,52 203,28 240,40"
                fill="none"
                stroke="#1D9E75"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="18,72 55,48 92,60 129,30 166,52 203,28 240,40 240,90 18,90" fill="url(#g)" />
              <text x="18" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                L
              </text>
              <text x="55" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                M
              </text>
              <text x="92" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                M
              </text>
              <text x="129" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                J
              </text>
              <text x="166" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                V
              </text>
              <text x="203" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                S
              </text>
              <text x="240" y="98" fontSize="9" fill="var(--color-text-tertiary)" textAnchor="middle">
                D
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
