import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
