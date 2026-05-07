import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ onLogout }) {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar onLogout={onLogout} />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
