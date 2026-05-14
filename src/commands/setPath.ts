import * as vscode from 'vscode';

export function registerSetQuartusPathCommand(context: vscode.ExtensionContext)
{
    const command = vscode.commands.registerCommand(
                        'quartus-assistant.setQuartusPath',
                        async () => {

                            const result = await vscode.window.showOpenDialog({
                                                canSelectFolders: true,
                                                canSelectFiles: false,
                                                canSelectMany: false,
                                                openLabel:
                                                    'Select Quartus installation folder'
                                            });

                            if (!result || result.length === 0) {return;}

                            const selectedPath = result[0].fsPath;

                            await vscode.workspace
                                .getConfiguration('maxv')
                                .update(
                                    'quartusPath',
                                    selectedPath,
                                    vscode.ConfigurationTarget.Workspace
                                );

                            vscode.window.showInformationMessage(`Quartus path set: ${selectedPath}`);
                        }
                    );

    context.subscriptions.push(command);
}