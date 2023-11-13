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

  // create megaphone item on the status bar
  let megaphone = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  megaphone.text = `$(megaphone) Telemetry extension is activated`;
  vscode.env.isTelemetryEnabled ? megaphone.show() : megaphone.hide();

  // subscribe to events
  context.subscriptions.push(
    vscode.env.onDidChangeTelemetryEnabled((e: boolean) =>
      e ? megaphone.show() : megaphone.hide(),
    ),
    megaphone,
    vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) =>
      handleDocumentOpen(doc, megaphone),
    ),
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => handleDocumentChange(e, megaphone),
    ),
    vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) =>
      handleDocumentClose(doc, megaphone),
    ),
    vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) =>
      handleDocumentSave(doc, megaphone),
    ),
  );
  vscode.env.isTelemetryEnabled &&
    vscode.workspace.getConfiguration("telemetry").get("documentChange") &&
    vscode.workspace.textDocuments.forEach((doc) => handleDocumentOpen(doc));
}

export function deactivate() {}
