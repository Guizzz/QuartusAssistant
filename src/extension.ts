import * as vscode from 'vscode';
import { registerBuildCommand } from './commands/build';
import { registerFlashCommand } from './commands/flash';
import { registerSetQuartusPathCommand } from './commands/setPath';

import { setupMaterialIcons } from './ui/setIcon';
import { createStatusBar, updateButtonsVisibility } from './ui/statusBar';
import { QTokensProvider } from './providers/qsfTokensProvider';
import { registerQsfLint } from './lint/qsfLint';
import { QsfProvider } from './providers/qsfTabProvider';
import { DoTokenProvider } from './providers/doTokenProvider';
import { registerTopLevelPortLint } from './lint/portLint';
import { registerSimulationUnit } from './simulation/registerSimulationUnit';


export async function activate(context: vscode.ExtensionContext) {

    setupMaterialIcons();
    createStatusBar(context);
    registerBuildCommand(context);
    registerFlashCommand(context);
    registerSetQuartusPathCommand(context);
    registerSimulationUnit(context);

    registerQsfLint(context);
    registerTopLevelPortLint(context);

    const qsfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qsf' },
            new QTokensProvider(),
            QTokensProvider.getLegend()
        );

    const qpfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qpf' },
            new QTokensProvider(),
            QTokensProvider.getLegend()
        );
    
    const doFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'questasim-do' },
            new DoTokenProvider(),
            DoTokenProvider.getLegend()
        );

    context.subscriptions.push(
        qsfFormatter,
        qpfFormatter,
        doFormatter
    );

    updateButtonsVisibility();

    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(updateButtonsVisibility),
        vscode.workspace.onDidCreateFiles(updateButtonsVisibility),
        vscode.workspace.onDidDeleteFiles(updateButtonsVisibility)
    );

    const tabView = new QsfProvider();
    await tabView.loadData();

    vscode.window.registerTreeDataProvider('quartus-assistant-view', tabView);
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
        if (doc.fileName.endsWith('.qsf')) {
            await tabView.loadData();
        }
    });
}

export function deactivate() {}