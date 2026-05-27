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
    
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{qsf,do}');
    watcher.onDidCreate(
        async () => {
            await tabView.loadData();
        }
    );
    
    const deleteListener =
        vscode.workspace.onDidDeleteFiles(
            async (docs: vscode.FileDeleteEvent) => 
            {   
                for (const d of docs.files)
                {
                    if (d.path.endsWith('.qsf') || d.path.endsWith('.do'))
                    {
                       await tabView.loadData(); 
                    }
                }
            }
        );

    const saveListener =
        vscode.workspace.onDidSaveTextDocument(
            async (doc) => 
            {
                if (doc.fileName.endsWith('.qsf') || doc.fileName.endsWith('.do')) 
                {
                    await tabView.loadData();
                }
            }
        );

    context.subscriptions.push(
        treeProvider,
        saveListener,
        deleteListener
    );
}