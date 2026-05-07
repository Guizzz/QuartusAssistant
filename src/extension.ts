import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';

async function getProjectName(): Promise<string | null> {

    const files = await vscode.workspace.findFiles('**/*.qpf');

    if (files.length === 0) {
        return null;
    }

    return path.basename(files[0].fsPath, '.qpf');
}

async function getProjectDir(): Promise<string | null> {

    const qpfFiles = await vscode.workspace.findFiles('**/*.qpf');

    if (qpfFiles.length === 0) {
        return null;
    }

    const qpfPath = qpfFiles[0].fsPath;

    return path.dirname(qpfPath);
}

function getQuartusBin(tool: string): string | null {

    const config = vscode.workspace.getConfiguration('maxv');
    const quartusPath = config.get<string>('quartusPath');

    if (!quartusPath || quartusPath.trim() === '') {
        return null;
    }

    return path.join(quartusPath, tool , 'bin64');
}

export function activate(context: vscode.ExtensionContext) {

	// =========================
    // Build compile
    // =========================

    const build = vscode.commands.registerCommand(
        'vhdl-assistant.build',
        async () => {

            const output = vscode.window.createOutputChannel("Quartus");
            output.show();

            const projectName = await getProjectName();
			const projectFolder = await getProjectDir();

            if (!projectName) {
                vscode.window.showErrorMessage(
                    "No Quartus .qpf project found"
                );
                return;
            }

			if (!projectFolder) {
                vscode.window.showErrorMessage(
                    "Error getting project directory path"
                );
                return;
            }

			const binPath = getQuartusBin('quartus');

			if (!binPath) {
				vscode.window.showErrorMessage(
					"Quartus path not configured"
				);
				return;
			}
			const full_path = path.join(binPath, 'quartus_sh');

			output.appendLine("Compiling: " + projectName);

            const proc = spawn(
				full_path,
				['--flow', 'compile', projectName],
				{
					cwd: projectFolder,
					env: {
						...process.env,
						PATH: binPath + ';' + process.env.PATH
					}
				}
			);

            proc.stdout.on('data', (d) => {
				var line:string = d.toString();
				if (line.startsWith("report"))
				{
                	output.append(line);
				}
            });

            proc.stderr.on('data', (d) => {
                output.append(d.toString());
            });

            proc.on('close', (code) => {

                if (code === 0) {
                    vscode.window.showInformationMessage(
                        `Build complete: ${projectName}`
                    );
                } else {
                    vscode.window.showErrorMessage(
                        `Build failed: ${projectName}`
                    );
                }
            });
        }
    );

	// =========================
    // Flash program
    // =========================
    const flash = vscode.commands.registerCommand(
        'vhdl-assistant.flash',
        async () => {

            const output = vscode.window.createOutputChannel("Quartus");
            output.show();

            const projectName = await getProjectName();
			const projectFolder = await getProjectDir();
			const binPath = getQuartusBin('qprogrammer');
			
            if (!projectName) {
                vscode.window.showErrorMessage(
                    "No Quartus .qpf project found"
                );
                return;
            }
			
			if (!projectFolder) {
                vscode.window.showErrorMessage(
					"Error getting project directory path"
                );
                return;
            }

			if (!binPath) {
				vscode.window.showErrorMessage(
					"Quartus path not configured"
				);
				return;
			}
			
			const full_path = path.join(binPath, 'quartus_pgm');

			const firm = "p;output_files/"+ projectName +".pof";
			output.appendLine("Flashing: " + projectName);

			//quartus_pgm -m jtag -o "p;output_files/SignalGenerator.pof"

            const proc = spawn(
				full_path,
				['-m', 'jtag', '-o', firm],
				{
					cwd: projectFolder,
					env: {
						...process.env,
						PATH: binPath + ';' + process.env.PATH
					}
				}
			);

            proc.stdout.on('data', (d) => {
				var line:string = d.toString();
                output.append(line);
            });

            proc.stderr.on('data', (d) => {
                output.append(d.toString());
            });

            proc.on('close', (code) => {

                if (code === 0) {
                    vscode.window.showInformationMessage(
                        `Flash complete: ${projectName}`
                    );
                } else {
                    vscode.window.showErrorMessage(
                        `Flash failed: ${projectName}`
                    );
                }
            });
        }
    );

	// =========================
    // SET QUARTUS PATH
    // =========================
    const setPathCmd = vscode.commands.registerCommand(
        'vhdl-assistant.setQuartusPath',
        async () => {

            const result = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                openLabel: 'Select Quartus installation folder'
            });

            if (!result || result.length === 0) {
                return;
            }

            const selectedPath = result[0].fsPath;

            await vscode.workspace.getConfiguration('maxv')
                .update(
                    'quartusPath',
                    selectedPath,
                    vscode.ConfigurationTarget.Workspace
                );

            vscode.window.showInformationMessage(
                `Quartus path set: ${selectedPath}`
            );
        }
    );

    context.subscriptions.push(build);
	context.subscriptions.push(flash);
	context.subscriptions.push(setPathCmd);
}

export function deactivate() {}