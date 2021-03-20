// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './NodeDependenciesProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let workspaceRoot : string = vscode.workspace.workspaceFolders?.slice(0)[0].uri.path || '';
	vscode.window.registerTreeDataProvider(
		'nodeDependencies',
		new NodeDependenciesProvider(workspaceRoot)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
