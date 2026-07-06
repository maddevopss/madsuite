import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function getOSPath(): string | null {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return null;
  }

  const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  
  // Method 1: Check if mad-suite-ai-os is directly inside the workspace
  const directPath = path.join(rootPath, "mad-suite-ai-os");
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Method 2: Check sibling directory
  const siblingPath = path.join(rootPath, "..", "mad-suite-ai-os");
  if (fs.existsSync(siblingPath)) {
    return siblingPath;
  }

  return null;
}

export function loadMarkdownFile(relativePath: string): string {
  const osPath = getOSPath();
  if (!osPath) {
    return `[MADSuite OS]: System OS not found at ${relativePath}`;
  }

  const fullPath = path.join(osPath, relativePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, "utf-8");
  }

  return `[MADSuite OS]: File not found: ${relativePath}`;
}

export function getOrchestratorPrompt(): string {
  return loadMarkdownFile("orchestrator.md");
}

export function getAgentPrompt(agentName: string): string {
  return loadMarkdownFile(`agents/${agentName}.agent.md`);
}

export function getProtocol(protocolName: string): string {
  return loadMarkdownFile(`protocols/${protocolName}.md`);
}
