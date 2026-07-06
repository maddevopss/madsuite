import * as vscode from "vscode";
import { getAgentPrompt } from "../utils/osLoader";

export function runBugFix() {
  const bugfixContext = getAgentPrompt("bugfix");
  console.log(`[MADSuite OS] Bugfix rules loaded: ${bugfixContext.length} chars`);

  vscode.window.showWarningMessage(`🧯 BugFix loop triggered (OS Rules: ${bugfixContext.length} chars)`);

  return {
    analysis: "simulated root cause detection",
    fix: "apply minimal patch",
    risk: "low",
    osContextLoaded: true
  };
}
