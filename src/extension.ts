import * as vscode from "vscode";
import { writeToInfluxDB } from "./influx";

let nextId = 1;
let uri2Id: { [key: string]: number } = {};

function getId(uri: string) {
  if (!uri2Id.hasOwnProperty(uri)) uri2Id[uri] = nextId++;
  return uri2Id[uri];
}

// send entire text document content & update megaphone
function sendDoc(
  document: vscode.TextDocument,
  megaphone?: vscode.StatusBarItem,
) {
  if (document.uri.scheme === "output") {
    return; // To avoid logging output panel content
  }

  const id = getId(document.uri.toString());
  const doc = document.getText();

  if (megaphone) {
    megaphone.text = `$(megaphone) Document ${id} (${
      document.fileName
    }) Open: ${doc.split("\n")[0]}`;
  }

  writeToInfluxDB("doc", doc, id.toString());
}

// send text document changes & update megaphone
function sendDocChange(
  event: vscode.TextDocumentChangeEvent,
  megaphone: vscode.StatusBarItem,
) {
  if (event.document.uri.scheme === "output") {
    return; // To avoid logging output panel content
  }

  const id = getId(event.document.uri.toString());

  if (event.contentChanges.length === 0) {
    megaphone.text = `$(megaphone) Document ${id} Save`;
    writeToInfluxDB("save", "", id.toString());
  } else {
    // For megaphone
    event.contentChanges.forEach((change) => {
      if (change && change.hasOwnProperty("text")) {
        const { text, range } = change;
        if (range.start.isEqual(range.end)) {
          megaphone.text = `$(megaphone) Document ${id} Add: ${text}`;
        } else if (text === "") {
          megaphone.text = `$(megaphone) Document ${id} Delete`;
        } else {
          megaphone.text = `$(megaphone) Document ${id} Replace: ${text}`;
        }
      }
    });

    // For dashboard
    // To mirror the content of a document using change events use the following
    // approach:
    // - start with the same initial content
    // - apply the 'textDocument/didChange' notifications in the order you
    // 	 receive them.
    // - apply the `TextDocumentContentChangeEvent`s in a single notification
    //   in the order you receive them.
    writeToInfluxDB(
      "docChange",
      JSON.stringify(event.contentChanges),
      id.toString(),
    );
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "telemetry" is now active');
  console.log(`sessionId: ${vscode.env.sessionId}`);

  // create megaphone item on the status bar
  let megaphone = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  megaphone.text = `$(megaphone) telemetry extension is activated`;
  megaphone.show();

  // send all text document contents currently known to the editor
  vscode.workspace.textDocuments.forEach((doc) => sendDoc(doc));

  // add listeners for document open and document change
  context.subscriptions.push(
    megaphone,
    vscode.workspace.onDidOpenTextDocument((doc) => sendDoc(doc, megaphone)),
    vscode.workspace.onDidChangeTextDocument(
      (e: vscode.TextDocumentChangeEvent) => sendDocChange(e, megaphone),
    ),
  );
}

export function deactivate() {}
