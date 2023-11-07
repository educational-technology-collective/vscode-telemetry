// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

async function publishEvent(event: Object): Promise<void> {
	// Since this request will send JSON data in the body,
	// we need to set the `Content-Type` header to `application/json`
	const headers: Headers = new Headers()
	headers.set('Content-Type', 'application/json')
	// We also need to set the `Accept` header to `application/json`
	// to tell the server that we expect JSON in response
	headers.set('Accept', 'application/json')

	const request = new Request('https://telemetry.mentoracademy.org/telemetry-edtech-labs-si-umich-edu/dev/test-telemetry', {
		// We need to set the `method` to `POST` and assign the headers
		method: 'POST',
		headers: headers,
		// Convert the user object to JSON and pass it as the body
		body: JSON.stringify(event)
	})

	// Send the request and print the response
	return fetch(request)
		.then(res => {
			console.log("got response:", res)
		})
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "telemetry" is now active!');

	// // The command has been defined in the package.json file
	// // Now provide the implementation of the command with registerCommand
	// // The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('telemetry.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from telemetry!');
	// });

	// context.subscriptions.push(disposable);

	vscode.workspace.onDidChangeTextDocument(async (e) => {
		vscode.window.showInformationMessage('onDidChangeTextDocument')

		publishEvent(e)
			.then(() => {
				vscode.window.showInformationMessage("Event Published!")
			})
	})
}

// This method is called when your extension is deactivated
export function deactivate() {}
