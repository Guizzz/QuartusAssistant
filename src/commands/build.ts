import * as vscode from 'vscode';

import { runQuartusTask }
from '../quartus/quartusRunner';
import { getProjectName } from '../quartus/quartusProject';

export function registerBuildCommand(context: vscode.ExtensionContext)
{
    const command = vscode.commands.registerCommand(
                        'quartus-assistant.build',
                        async () => {
                            const projectName = await getProjectName();

                            if (!projectName) {
                                vscode.window.showErrorMessage("No Quartus .qpf project found");
                                return;
                            }
                            
                            await runQuartusTask({
                                command: 'quartus_sh',
                                tool: 'quartus',
                                args: ['--flow', 'compile', projectName],

                                statusRunning: 'Building...',
                                statusSuccess: 'Build OK',
                                statusFail: 'Build failed',

                                successMessage: p =>
                                    `Build complete: ${p}`,

                                failMessage: p =>
                                    `Build failed: ${p}`
                            });
                        }
                    );

    context.subscriptions.push(command);
}