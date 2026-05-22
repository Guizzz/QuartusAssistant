import * as vscode from 'vscode';
import { getProjectName, getQuestaFile } from '../quartus/quartusProject';
import path from 'path';
import { spawn } from 'child_process';
import { QuartusLogger, quartusOutput } from '../quartus/quartusLogger';
import { buildStatus } from '../ui/statusBar';

const logger = new QuartusLogger(quartusOutput);

export function registerRunSimulationUnit(context: vscode.ExtensionContext) 
{
    const command = vscode.commands.registerCommand(
                'quartus-assistant.runDo',
                async () => {
                    const workspace = vscode.workspace.workspaceFolders?.[0];
                    
                    if (!workspace) {
                        vscode.window.showErrorMessage( 'No workspace opened' );
                        return;
                    }

                    const workspaceRoot = workspace.uri.fsPath;

                    if (!workspaceRoot) {
                        vscode.window.showErrorMessage("No workspace open");
                        return;
                    }

                    const projectName = await getProjectName();
    
                    const qsfFiles = await getQuestaFile();
    
                    if (qsfFiles.length === 0) {
                        vscode.window.showErrorMessage( 'No .do file found' );
                        return;
                    }

                    const picked =
                        await vscode.window.showQuickPick(
                            qsfFiles.map(unit => ({
                                label: path.basename(unit.fsPath),
                                detail: vscode.workspace.asRelativePath(unit.fsPath),
                                unit
                            })),
                            {
                                placeHolder: 'Select simulation entity'
                            }
                        );
    
                    if (!picked) { 
                        vscode.window.showErrorMessage( 'No file picked' );
                        return; 
                    }

                    quartusOutput.show(true);

                    console.log (picked);
                    console.log("cwd:", workspaceRoot);
                    console.log("file:", picked.unit.fsPath);

                    const proc = spawn(
                        "vsim",
                        ["-gui", "-do", picked.detail],
                        {
                            cwd: workspaceRoot,
                            detached: true,
                            stdio: "ignore"
                        }
                    );

                    proc.unref();

                    proc.on("spawn", () => {
                        logger.appendLine("Simulation started");
                    });
                
                    proc.on('close', code => {
                
                        const success = code === 0;
                
                        if (success) {
                            buildStatus.text = `$(check) Simulation complete`;
                            vscode.window.showInformationMessage(`${projectName}: Simulation complete for ${picked.label}`);
                        } else {
                            buildStatus.text = `$(error) Simulation Error`;
                            vscode.window.showErrorMessage(`${projectName}: Simulation fail for ${picked.label}`);
                        }
                    });

                });
    context.subscriptions.push(command);
}