import * as vscode from 'vscode';
import { QsfProvider } from '../providers/qsfTabProvider';

export async function registerQsfView(context: vscode.ExtensionContext) 
{
    const tabView = new QsfProvider();
    await tabView.loadData();

    const treeProvider =
        vscode.window.registerTreeDataProvider(
            'quartus-assistant-view',
            tabView
        );

    const saveListener =
        vscode.workspace.onDidSaveTextDocument(
            async (doc) => 
            {
                if (doc.fileName.endsWith('.qsf')) 
                {
                    await tabView.loadData();
                }
            }
        );

    context.subscriptions.push(
        treeProvider,
        saveListener
    );
}