import { useState } from "react";
import "../styles/reports.css";

export default function Reports() {
  const [activeView] = useState("reports");
  return (
    <div>
      <h1>Rapport et statistiques</h1>
      <div className={`view ${activeView === "reports" ? "active" : ""}`} id="view-reports">
        <div className="report-filters">
          <div className="filter-chip active">Ce mois</div>
          <div className="filter-chip">Ce trimestre</div>
          <div className="filter-chip">Cette année</div>
          <div className="filter-chip">Personnalisé</div>
          <div>
            <button className="btn">Exporter CSV</button>
            <button className="btn">Exporter PDF</button>
          </div>
        </div>
        <div className="card">
          <div className="report-head">
            <span>Client</span>
            <span>Heures</span>
            <span>Facturable</span>
            <span>Montant</span>
          </div>
          <div className="report-row">
            <span>Tremblay & Associés</span>
            <span>42h 00</span>
            <span>42h 00</span>
            <span>1 848 $</span>
          </div>
          <div className="report-row">
            <span>Gagnon inc.</span>
            <span>31h 15</span>
            <span>31h 15</span>
            <span>1 375 $</span>
          </div>
          <div className="report-row">
            <span>Martin SENC</span>
            <span>28h 00</span>
            <span>25h 30</span>
            <span>1 122 $</span>
          </div>
          <div className="report-row">
            <span>Lavoie et fils</span>
            <span>14h 00</span>
            <span>14h 00</span>
            <span>616 $</span>
          </div>
          <div className="report-row">
            <span>Interne / Non fact.</span>
            <span>9h 00</span>
            <span>—</span>
            <span>—</span>
          </div>
          <div className="report-total">
            <span>Total mai 2025</span>
            <span>
              124h 15 &nbsp;·&nbsp; <span>4 961 $</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
