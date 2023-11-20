import { EventData, Exporter, ExporterArgs } from "./types";
import * as vscode from "vscode";
import * as fs from "fs";
import { posix } from "path";

function consoleExporter(data: EventData) {
  console.log(data);
}
async function fileExporter(data: EventData, args: ExporterArgs | undefined) {
  if (args && args.path && vscode.workspace.workspaceFolders) {
    const writeStr = JSON.stringify(data) + ",";
    const writeData = Buffer.from(writeStr, "utf8");

    const folderUri = vscode.workspace.workspaceFolders[0].uri;
    const fileUri = posix.join(folderUri.path, args.path);

    if (fileUri.toString() !== vscode.Uri.parse(data.documentUri).path) {
      try {
        fs.appendFileSync(fileUri, writeData);
        return {
          exporter: args.id || "FileExporter",
          message: "Success",
        };
      } catch (err) {
        console.log(err);
        return {
          exporter: args.id || "FileExporter",
          message: "Failed to write to file",
        };
      }
    }
  }
}
async function remoteExporter(data: EventData, args: ExporterArgs | undefined) {
  if (args && args.url) {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const request = new Request(args.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        data: data,
        params: args.params,
        env: args.env,
      }),
    });
    const response = await fetch(request);

    return {
      exporter: args.id || "RemoteExporter",
      message: {
        status: response.status,
        statusText: response.statusText,
      },
    };
  }
}
export async function publishEvent(data: EventData, exporter: Exporter) {
  if (exporter.type === "console_exporter") consoleExporter(data);
  if (exporter.type === "file_exporter") {
    const response = await fileExporter(data, exporter.args);
    console.log(response);
  }
  if (exporter.type === "remote_exporter") {
    const response = await remoteExporter(data, exporter.args);
    console.log(response);
  }
}
