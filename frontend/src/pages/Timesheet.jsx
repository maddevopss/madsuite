import { useState } from "react";
import "../styles/timesheet.css";

export default function Timesheet() {
  const [activeView] = useState("timesheet");
  return (
    <div>
      <h1>Feuilles de temps</h1>
      <div className={`view ${activeView === "timesheet" ? "active" : ""}`}
        id="view-timesheet"
      >
        <div className="ts-week">
          <button className="btn">&lt;</button>

          <div className="ts-week-label">Semaine du 28 avril au 4 mai 2025</div>

          <button className="btn">&gt;</button>
        </div>

        <div className="card">
          <div className="ts-entry-head">
            <span></span>
            <span>Description</span>
            <span>Client</span>
            <span>Durée</span>
            <span>Fact.</span>
          </div>

          <div className="ts-entry">
            <div className="ts-dot"></div>
            <span className="ts-desc">Révision états financiers</span>
            <span className="ts-client">Tremblay & Ass.</span>
            <span className="ts-duration">3h 30</span>
            <span className="ts-bill">154 $</span>
          </div>

          <div className="ts-entry">
            <div className="ts-dot"></div>
            <span className="ts-desc">Déclaration TVQ/TPS Q1</span>
            <span className="ts-client">Gagnon inc.</span>
            <span className="ts-duration">2h 15</span>
            <span className="ts-bill">99 $</span>
          </div>

          <div className="ts-entry">
            <div className="ts-dot"></div>
            <span className="ts-desc">Appel client + suivi</span>
            <span className="ts-client">Martin SENC</span>
            <span className="ts-duration">0h 45</span>
            <span className="ts-bill">33 $</span>
          </div>

          <div className="ts-entry">
            <div className="ts-dot"></div>
            <span className="ts-desc">Formation continue</span>
            <span className="ts-client">Interne</span>
            <span className="ts-duration">1h 00</span>
            <span className="ts-bill">—</span>
          </div>

          <div className="ts-entry">
            <div className="ts-dot"></div>
            <span className="ts-desc">Paie employés mai</span>
            <span className="ts-client">Lavoie et fils</span>
            <span className="ts-duration">2h 00</span>
            <span className="ts-bill">88 $</span>
          </div>

          <div className="ts-total">
            <span>Total semaine</span>

            <span>
              9h 30 · <span>374 $</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
