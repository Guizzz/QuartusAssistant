import * as vscode from 'vscode';
import { getProjectName } from '../quartus/quartusProject';
import { runQuartusTask } from '../quartus/quartusRunner';

export function registerFlashCommand(context: vscode.ExtensionContext)
{
    const command = vscode.commands.registerCommand(
                        'quartus-assistant.flash',
                        async () => {

                            const projectName = await getProjectName();

                            if (!projectName) {return;}
                            
                            const output = vscode.window.createOutputChannel('Quartus');

                            await runQuartusTask({
                                command: 'quartus_pgm',
                                tool: 'qprogrammer',
                                args: [
                                    '-m',
                                    'jtag',
                                    '-o',
                                    `p;output_files/${projectName}.pof`
                                ],

                                output: output,
                                statusRunning: 'Flashing...',
                                statusSuccess: 'Flash OK',
                                statusFail: 'Flash failed',

                                successMessage: p =>
                                    `Flash complete: ${p}`,

                                failMessage: p =>
                                    `Flash failed: ${p}`
                            });
                        }
                    );

    context.subscriptions.push(command);
}