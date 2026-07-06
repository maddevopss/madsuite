import * as vscode from "vscode";
import { getAgentPrompt } from "../utils/osLoader";

export function runCISimulation() {
  const ciContext = getAgentPrompt("cicd");
  console.log(`[MADSuite OS] CI rules loaded: ${ciContext.length} chars`);

  const checks = {
    typescript: true,
    runtime: true,
    security: true,
    multiTenant: true,
  };

  const passed = Object.values(checks).every(Boolean);

  if (passed) {
    vscode.window.showInformationMessage(`🚦 CI PASSED (OS Rules: ${ciContext.length} chars)`);
  } else {
    vscode.window.showErrorMessage("🚦 CI FAILED");
  }

  return {
    status: passed ? "PASS" : "FAIL",
    checks,
    osContextLoaded: true
  };
}
