import * as vscode from "vscode";
import { getPanelHtml } from "./panel";
import { runLoop } from "./actions/loop";
import { generateFeature } from "./actions/feature";
import { runBugFix } from "./actions/bugfix";
import { runCISimulation } from "./actions/ci";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("madsuite.openPanel", () => {
    const panel = vscode.window.createWebviewPanel("madsuiteAI", "MADSuite AI Panel", vscode.ViewColumn.One, {
      enableScripts: true,
    });

    panel.webview.html = getPanelHtml(panel.webview, context.extensionUri);

    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "loop":
          runLoop();
          vscode.window.showInformationMessage("🧠 Loop executed");
          break;

        case "hard":
          vscode.window.showWarningMessage("💀 HARD MODE ACTIVATED");
          break;

        case "feature":
          await generateFeature();
          break;

        case "ci":
          const ciResult = runCISimulation();
          vscode.window.showInformationMessage(`🚦 CI: ${ciResult.status}`);
          break;

        case "bugfix":
          const bugfixResult = runBugFix();
          vscode.window.showWarningMessage(`🧯 BugFix: ${bugfixResult.analysis}`);
          break;
      }
    });
  });

  context.subscriptions.push(disposable);
}
