import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/global.css";
import "./components/layout/header.css";
import "./components/layout/mobile-responsive.css";

import App from "./pages/App";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./api/authContext";
import { TimerProvider } from "./TimerContext";
import { RefreshProvider } from "./RefreshContext";
import { ToastProvider } from "./ToastContext";
import { ActivitySuggestionProvider } from "./components/activity-intelligence/ActivitySuggestionContext";
import { ThemeProvider } from "./ThemeContext";
import { ModulesProvider } from "./hooks/useModules";
import { CognitiveStateProvider } from "./context/CognitiveStateProvider";

const queryClient = new QueryClient();

// CSP injection
(() => {
  try {
    const raw = import.meta.env.VITE_API_URL || "/api";
    const isRelative = raw.startsWith("/");
    const apiOrigin = isRelative ? "" : new URL(raw).origin;

    const connectSrc = apiOrigin ? `'self' ${apiOrigin}` : "'self'";

    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src ${connectSrc};`;
    document.head.insertBefore(meta, document.head.firstChild);
  } catch {}
})();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ModulesProvider>
                <RefreshProvider>
                  <ToastProvider>
                    <TimerProvider>
                      <ActivitySuggestionProvider>
                        <CognitiveStateProvider>
                          <App />
                        </CognitiveStateProvider>
                      </ActivitySuggestionProvider>
                    </TimerProvider>
                  </ToastProvider>
                </RefreshProvider>
              </ModulesProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
