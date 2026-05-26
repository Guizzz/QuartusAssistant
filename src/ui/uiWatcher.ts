import * as vscode from 'vscode';
import {updateButtonsVisibility} from '../ui/statusBar';

export function registerUiWatchers(context: vscode.ExtensionContext) 
{
    const workspaceListener =
        vscode.workspace.onDidChangeWorkspaceFolders(
            updateButtonsVisibility
        );

    const createListener =
        vscode.workspace.onDidCreateFiles(
            updateButtonsVisibility
        );

    const deleteListener =
        vscode.workspace.onDidDeleteFiles(
            updateButtonsVisibility
        );

    context.subscriptions.push(
        workspaceListener,
        createListener,
        deleteListener
    );
}