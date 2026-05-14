import * as vscode from 'vscode';
import { registerBuildCommand } from './commands/build';
import { registerFlashCommand } from './commands/flash';
import { registerSetQuartusPathCommand } from './commands/setPath';

import { setupMaterialIcons } from './ui/setIcon';
import { createStatusBar, updateButtonsVisibility } from './ui/statusBar';
import { legend, QsfTokensProvider } from './providers/qsfTokensProvider';
import { registerQsfLint } from './lint/qsfLint';
import { QsfProvider } from './providers/qsfTabProvider';


export function activate(context: vscode.ExtensionContext) {

    setupMaterialIcons();
    createStatusBar(context);
    registerBuildCommand(context);
    registerFlashCommand(context);
    registerSetQuartusPathCommand(context);

    registerQsfLint(context);

    const qsfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qsf' },
            new QsfTokensProvider(),
            legend
        );

    const qpfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qpf' },
            new QsfTokensProvider(),
            legend
        );

    context.subscriptions.push(
        qsfFormatter,
        qpfFormatter
    );

    updateButtonsVisibility();

    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(updateButtonsVisibility),
        vscode.workspace.onDidCreateFiles(updateButtonsVisibility),
        vscode.workspace.onDidDeleteFiles(updateButtonsVisibility)
    );

    const tabView = new QsfProvider();
    // tabView.loadData();
    vscode.window.registerTreeDataProvider('quartus-assistant-view', tabView);
}

export function deactivate() {}