export default function UserIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 26c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="10" r="4" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
      <path d="M24 20c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
