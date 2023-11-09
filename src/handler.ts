import * as vscode from "vscode";
import { writeToInfluxDB } from "./influx";

let nextId = 1;
let uri2Id: { [key: string]: number } = {};

function getId(uri: string) {
  if (!uri2Id.hasOwnProperty(uri)) uri2Id[uri] = nextId++;
  return uri2Id[uri];
}

// send entire text document content & update megaphone
export function sendDoc(
  document: vscode.TextDocument,
  megaphone?: vscode.StatusBarItem,
) {
  if (!vscode.env.isTelemetryEnabled) return;
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
export function sendDocChange(
  event: vscode.TextDocumentChangeEvent,
  megaphone: vscode.StatusBarItem,
) {
  if (!vscode.env.isTelemetryEnabled) return;
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

// send text document close event & update megaphone
export function sendDocClose(
  document: vscode.TextDocument,
  megaphone: vscode.StatusBarItem,
) {
  if (!vscode.env.isTelemetryEnabled) return;
  if (document.uri.scheme === "output") {
    return; // To avoid logging output panel content
  }
  const id = getId(document.uri.toString());
  megaphone.text = `$(megaphone) Document ${id} Close`;
  writeToInfluxDB("close", "", id.toString());
}
