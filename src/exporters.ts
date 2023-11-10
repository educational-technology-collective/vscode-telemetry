import { EventData, Exporter, ExporterArgs } from "./types";
import * as vscode from "vscode";

function consoleExporter(data: EventData) {
  console.log(data);
}

// function fileExporter(data: EventData, args: ExporterArgs | undefined) {
//     args && args.path && fs.writeFileSync(args.path, JSON.stringify(data));
// }

async function remoteExporter(data: EventData, args: ExporterArgs | undefined) {
  if (args && args.url) {
    const headers: Headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const request = new Request(args.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
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
export function sendEvent(data: EventData) {
  const exporters = vscode.workspace
    .getConfiguration("telemetry")
    .get("exporters") as Array<Exporter>;
  exporters.forEach(async (exporter: Exporter) => {
    if (exporter.type === "console_exporter") consoleExporter(data);
    // if (exporter.type === 'file_exporter') fileExporter(data, exporter.args)
    if (exporter.type === "remote_exporter") {
      const res = await remoteExporter(data, exporter.args);
      console.log(res);
    }
  });
}
