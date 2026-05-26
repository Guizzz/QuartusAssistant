import * as vscode from 'vscode';
import { EntityIndexer } from './entityIndexer';

export function registerWorkspaceWatchers(
    context: vscode.ExtensionContext,
    indexer: EntityIndexer
) {

    const saveListener =
        vscode.workspace.onDidSaveTextDocument(
            async (doc) => {

                if (doc.languageId !== 'vhdl') {
                    return;
                }

                await indexer.indexFile(doc.uri);
            }
        );

    const createListener =
        vscode.workspace.onDidCreateFiles(
            async (event) => {

                for (const file of event.files) {
                    await indexer.indexFile(file);
                }
            }
        );

    const deleteListener =
        vscode.workspace.onDidDeleteFiles(
            async (event) => {

                for (const file of event.files) {
                    indexer.removeFile(file.fsPath);
                }
            }
        );

    context.subscriptions.push(
        saveListener,
        createListener,
        deleteListener
    );
}