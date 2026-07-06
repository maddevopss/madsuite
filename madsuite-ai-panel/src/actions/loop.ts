import * as vscode from "vscode";
import { getOrchestratorPrompt } from "../utils/osLoader";

export function runLoop() {
  const orchestratorRules = getOrchestratorPrompt();
  console.log("Loaded OS Rules:", orchestratorRules.substring(0, 100) + "...");

  vscode.window.showInformationMessage(`🧠 MADSuite Loop started (OS context loaded: ${orchestratorRules.length} chars)`);

  return {
    status: "running",
    stage: ["plan", "build", "review", "security", "ci"],
    mode: "local-safe",
    osContextLoaded: true
  };
}
