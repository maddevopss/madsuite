import * as vscode from "vscode";

export function getPanelHtml(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "panel.js"));

  const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "panel.css"));

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <link href="${cssUri}" rel="stylesheet">
  </head>
  <body>

    <h2>🧠 MADSuite AI Panel</h2>

    <button onclick="send('loop')">Start Loop</button>
    <button onclick="send('hard')">Hard Mode</button>
    <button onclick="send('feature')">Generate Feature</button>
    <button onclick="send('ci')">CI Sim</button>
    <button onclick="send('bugfix')">BugFix</button>

    <script src="${scriptUri}"></script>
  </body>
  </html>
  `;
}
