import * as vscode from 'vscode'
import { writeToInfluxDB } from './influx'

let nextId = 1
let uri2Id: { [key: string]: number } = {}

function getId(uri: string) {
	if (!uri2Id.hasOwnProperty(uri)) uri2Id[uri] = nextId++
	return uri2Id[uri]
}

function sendDoc(document: vscode.TextDocument, megaphone?: vscode.StatusBarItem) {
	if (document.uri.scheme === 'output') {
		return;
	}
	const uri = document.uri.toString()
	const id = getId(uri)
	const doc = document.getText()

	if (megaphone) {
		megaphone.text = `$(megaphone) Document ${id} (${uri}) Open: ${doc.split('\n')[0]}`
	}

	writeToInfluxDB('doc', doc, id.toString())
}

function sendDocChange(event: vscode.TextDocumentChangeEvent, megaphone: vscode.StatusBarItem) {
	const id = getId(event.document.uri.toString())

	// for dashboard
	// To mirror the content of a document using change events use the following
	// approach:
	// - start with the same initial content
	// - apply the 'textDocument/didChange' notifications in the order you
	// 	 receive them.
	// - apply the `TextDocumentContentChangeEvent`s in a single notification
	//   in the order you receive them.
	writeToInfluxDB('docChange', event.contentChanges.toString(), id.toString())

	// local log, not for dashboard
	if (event.document.uri.scheme === 'output') {
		return; // To avoid logging output panel content
	}
	if (event.contentChanges.length === 0) {
		megaphone.text = (`$(megaphone) Document ${id} Save`)
	}
	event.contentChanges.forEach((change) => {
		if (change && change.hasOwnProperty('text')) {
			const { text, range } = change
			if (range.start.isEqual(range.end)) {
				megaphone.text = `$(megaphone) Document ${id} Add: ${text}`
			} else if (text === '') {
				megaphone.text = `$(megaphone) Document ${id} Delete`
			} else {
				megaphone.text = `$(megaphone) Document ${id} Replace: ${text}`
			}
		}
	})
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "telemetry" is now active')
	console.log(`sessionId: ${vscode.env.sessionId}`)

	// megaphone on status bar
	let megaphone = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	)
	megaphone.text = `$(megaphone) telemetry extension activated`
	megaphone.show()
	context.subscriptions.push(megaphone)

	// send all text documents currently known to the editor
	vscode.workspace.textDocuments.forEach((doc) => sendDoc(doc))

	context.subscriptions.push(
		// text document open listener: send entire text document content & update megaphone
		vscode.workspace.onDidOpenTextDocument((doc) => sendDoc(doc, megaphone)),
		// text document change listener: send change sets & update megaphone
		vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => sendDocChange(e, megaphone))
	)
}

export function deactivate() { }