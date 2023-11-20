import * as vscode from "vscode";
import {
  handleDocumentOpen,
  handleDocumentChange,
  handleDocumentClose,
  handleDocumentSave,
} from "./events";

export function activate(context: vscode.ExtensionContext) {
  vscode.env.isTelemetryEnabled
    ? console.log('Extension "telemetry" is now active')
    : console.log("telemetry is disabled");

  // subscribe to events
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(handleDocumentOpen),
    vscode.workspace.onDidChangeTextDocument(handleDocumentChange),
    vscode.workspace.onDidCloseTextDocument(handleDocumentClose),
    vscode.workspace.onDidSaveTextDocument(handleDocumentSave),
  );
  vscode.env.isTelemetryEnabled &&
    vscode.workspace.getConfiguration("telemetry").get("documentChange") &&
    vscode.workspace.textDocuments.forEach(handleDocumentOpen);
}

export function deactivate() {}
