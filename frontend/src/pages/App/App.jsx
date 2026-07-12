import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../Login/Login";
import Dashboard from "../Dashboard";
import Users from "../Users";
import Reports from "../Reports";
import Timesheet from "../Timesheet";
import Clients from "../Clients";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../routes/ProtectedRoute";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/timesheet" element={<Timesheet />} />
              <Route path="/clients" element={<Clients />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}
