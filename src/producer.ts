import * as vscode from "vscode";
import { EventData, Exporter } from "./types";
import { publishEvent } from "./exporters";

let nextId = 1;
let uri2Id: { [key: string]: number } = {};

function updateAndGetId(uri: string) {
  if (!uri2Id.hasOwnProperty(uri)) uri2Id[uri] = nextId++;
  return uri2Id[uri];
}

export class DocumentOpenEventProducer {
  static id: string = "DocumentOpenEvent";

  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    function documentOpenEventHandler(document: vscode.TextDocument) {
      if (!vscode.env.isTelemetryEnabled || document.uri.scheme !== "file") {
        return;
      }
      const id = updateAndGetId(document.uri.toString());

      const event: EventData = {
        eventName: DocumentOpenEventProducer.id,
        eventTime: Date.now(),
        sessionId: vscode.env.sessionId,
        machineId: vscode.env.machineId,
        documentUri: document.uri.toString(),
        documentId: id,
      };

      if (
        exporter.activeEvents?.find(
          (o) => o.name === DocumentOpenEventProducer.id,
        )?.logWholeDocument
      ) {
        event["documentContent"] = document.getText();
      }

      publishEvent(event, exporter);
    }
    vscode.workspace.textDocuments.forEach(documentOpenEventHandler);
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(documentOpenEventHandler),
    );
  }
}

export class DocumentChangeEventProducer {
  static id = "DocumentChangeEvent";

  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(
        (e: vscode.TextDocumentChangeEvent) => {
          if (
            !vscode.env.isTelemetryEnabled ||
            e.document.uri.scheme !== "file"
          ) {
            return;
          }
          const id = updateAndGetId(e.document.uri.toString());
          if (e.contentChanges.length > 0) {
            const event: EventData = {
              eventName: DocumentChangeEventProducer.id,
              eventTime: Date.now(),
              sessionId: vscode.env.sessionId,
              machineId: vscode.env.machineId,
              documentUri: e.document.uri.toString(),
              documentId: id,
              documentChanges: JSON.stringify(e.contentChanges),
            };
            if (
              exporter.activeEvents?.find(
                (o) => o.name === DocumentChangeEventProducer.id,
              )?.logWholeDocument
            ) {
              event["documentContent"] = e.document.getText();
            }
            publishEvent(event, exporter);
          }
        },
      ),
    );
  }
}

export class DocumentCloseEventProducer {
  static id = "DocumentCloseEvent";

  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument(
        (document: vscode.TextDocument) => {
          if (
            !vscode.env.isTelemetryEnabled ||
            document.uri.scheme !== "file"
          ) {
            return;
          }
          const id = updateAndGetId(document.uri.toString());
          const event: EventData = {
            eventName: DocumentCloseEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: document.uri.toString(),
            documentId: id,
          };
          if (
            exporter.activeEvents?.find(
              (o) => o.name === DocumentCloseEventProducer.id,
            )?.logWholeDocument
          ) {
            event["documentContent"] = document.getText();
          }
          publishEvent(event, exporter);
        },
      ),
    );
  }
}

export class DocumentSaveEventProducer {
  static id = "DocumentSaveEvent";

  listen(context: vscode.ExtensionContext, exporter: Exporter) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(
        (document: vscode.TextDocument) => {
          if (
            !vscode.env.isTelemetryEnabled ||
            document.uri.scheme !== "file"
          ) {
            return;
          }
          const id = updateAndGetId(document.uri.toString());
          const event: EventData = {
            eventName: DocumentSaveEventProducer.id,
            eventTime: Date.now(),
            sessionId: vscode.env.sessionId,
            machineId: vscode.env.machineId,
            documentUri: document.uri.toString(),
            documentId: id,
          };
          if (
            exporter.activeEvents?.find(
              (o) => o.name === DocumentSaveEventProducer.id,
            )?.logWholeDocument
          ) {
            event["documentContent"] = document.getText();
          }
          publishEvent(event, exporter);
        },
      ),
    );
  }
}

export const producerCollection = [
  DocumentOpenEventProducer,
  DocumentChangeEventProducer,
  DocumentCloseEventProducer,
  DocumentSaveEventProducer,
];
