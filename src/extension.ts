import * as vscode from "vscode";
import { sendDoc, sendDocChange, sendDocClose } from './handler'

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "telemetry" is now active');
  console.log(`sessionId: ${vscode.env.sessionId}`);

  // vscode.workspace.getConfiguration('telemetry')

  // create megaphone item on the status bar
  let megaphone = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  megaphone.text = `$(megaphone) telemetry extension is activated`;
  vscode.env.isTelemetryEnabled ? megaphone.show() : megaphone.hide();

  // send all text document contents currently known to the editor
  vscode.workspace.textDocuments.forEach((doc) => sendDoc(doc));

  // add listeners for document open and document change
  context.subscriptions.push(
    megaphone,
    vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => sendDoc(doc, megaphone)),
    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => sendDocChange(e, megaphone)),
    vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => sendDocClose(doc, megaphone)),
    vscode.env.onDidChangeTelemetryEnabled((e: boolean) => e ? megaphone.show() : megaphone.hide()),
  );
}

export function deactivate() {}
