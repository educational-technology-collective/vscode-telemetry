import * as vscode from "vscode";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { org, token, url } from "./secrets";

const bucket = "vs-dev";
const influxDB = new InfluxDB({ url, token });

export function writeToInfluxDB(
  eventType: string,
  eventInfo: string,
  docId: string,
) {
  const writeApi = influxDB.getWriteApi(org, bucket);
  writeApi.useDefaultTags({ from: "vscode extension" });
  const dataPoint = new Point("telemetry")
    .stringField("eventType", eventType)
    .stringField("eventInfo", eventInfo)
    .tag("sessionId", vscode.env.sessionId)
    .tag("docId", docId);
  writeApi.writePoint(dataPoint);
}
