export default function TimeIcon({ className = "" }) {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" opacity=".6" />
      <line x1="4" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1" opacity=".4" />
    </svg>
  );
}
