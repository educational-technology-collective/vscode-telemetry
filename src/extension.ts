import * as vscode from "vscode";
import { producerCollection } from "./producer";
import { ActiveEvent, Exporter } from "./types";

export function activate(context: vscode.ExtensionContext) {
  vscode.env.isTelemetryEnabled
    ? console.log('Extension "telemetry" is now active')
    : console.log("telemetry is disabled");

  console.log(vscode.workspace.getConfiguration("telemetry"));

  const activeEvents: ActiveEvent[] | undefined = vscode.workspace
    .getConfiguration("telemetry")
    .get("activeEvents");
  const exporters: Exporter[] | undefined = vscode.workspace
    .getConfiguration("telemetry")
    .get("exporters");

  const processedExporters =
    activeEvents && activeEvents.length
      ? exporters?.map((e) => {
          if (!e.activeEvents) {
            e.activeEvents = activeEvents;
            return e;
          } else {
            return e;
          }
        })
      : exporters?.filter((e) => e.activeEvents && e.activeEvents.length);
  // Exporters without specifying the corresponding activeEvents will use the global activeEvents configuration.
  // When the global activeEvents configuration is null, exporters that do not have corresponding activeEvents will be ignored.
  console.log(processedExporters);

  processedExporters?.forEach((exporter) => {
    producerCollection.forEach((producer) => {
      if (exporter.activeEvents?.map((o) => o.name).includes(producer.id)) {
        new producer().listen(context, exporter);
      }
    });
  });
}

export function deactivate() {}
