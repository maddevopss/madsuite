const vscode = acquireVsCodeApi();

function send(command) {
  vscode.postMessage({ command });
}
