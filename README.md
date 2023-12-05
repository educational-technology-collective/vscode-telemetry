# Telemetry

A vscode extension for generating and exporting editor's telemetry data. The intention of this extension is to support data-driven research and design of new coding experiences with large numbers of users, and we use this extension within the educational technology collective lab to improve programming education with learning analytics.

## Configuration
The settings file controls the activated events and data exporters. Either user settings or workspace settings work.

To add a data exporter, users should assign exporter type along with function arguments when configuring `exporters`.

This extension provides 3 default exporters.

- [`console_exporter`](https://github.com/educational-technology-collective/vscode-telemetry/blob/2e25d9a5aee551afb0d53301a0cc2b7c1d76a099/src/exporters.ts#L6), which sends telemetry data to the browser console
- [`file_exporter`](https://github.com/educational-technology-collective/vscode-telemetry/blob/2e25d9a5aee551afb0d53301a0cc2b7c1d76a099/src/exporters.ts#L9), which saves telemetry data to local file
- [`remote_exporter`](https://github.com/educational-technology-collective/vscode-telemetry/blob/2e25d9a5aee551afb0d53301a0cc2b7c1d76a099/src/exporters.ts#L34), which sends telemetry data to a remote http endpoint

See configuration example [here](https://github.com/educational-technology-collective/vscode-telemetry/blob/main/configuration-example/settings.json).

### Syntax

`activateEvents`: An array of active events. Each active event in the array should have the following structure:

```python
{
    'name': # string, event name
    'logWholeDocument': # boolean, whether to export the entire document content when event is triggered
}
```

The extension would only generate and export data for valid event that has an id associated with the event class, and the event name is included in `activeEvents`.
The extension will export the entire notebook content only for valid events when the `logWholeDocument` flag is True.

`exporters`: An array of exporters. Each exporter in the array should have the following structure:

```python
{
    'type': # One of 'console_exporter', 'file_exporter', 'remote_exporter',
    'args': # Optional. Arguments passed to the exporter function.
            # It needs to contain 'path' for file_exporter, 'url' for remote_exporter.
    'activeEvents': # Optional. Exporter's local activeEvents config will override global activeEvents config
}
```

## Links
[A twin extension implemented for JupyterLab](https://github.com/educational-technology-collective/jupyterlab-pioneer)