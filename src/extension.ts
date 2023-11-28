import * as vscode from "vscode";
import { producerCollection } from "./producer";
import { ActiveEvent, Exporter } from "./types";

export function activate(context: vscode.ExtensionContext) {
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

  const exporterIds = processedExporters
    ?.map((each) => each.args?.id)
    .filter((e) => e !== undefined);
  vscode.env.isTelemetryEnabled
    ? vscode.window.showInformationMessage(
        `Telemetry data is being logged ${exporterIds?.join(" & ")}.`,
      )
    : console.log("Telemetry extension is disabled");
  vscode.env.onDidChangeTelemetryEnabled((e: boolean) =>
    e
      ? vscode.window.showInformationMessage(
          `Telemetry data is being logged to ${exporterIds?.join(" & ")}.`,
        )
      : vscode.window.showInformationMessage(
          "Telemetry extension is disabled.",
        ),
  );

  processedExporters?.forEach((exporter) => {
    producerCollection.forEach((producer) => {
      if (exporter.activeEvents?.map((o) => o.name).includes(producer.id)) {
        new producer().listen(context, exporter);
      }
    });
  });
}

export function deactivate() {}
