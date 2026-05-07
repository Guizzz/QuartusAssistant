import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import { QuartusLogger } from './quartusLogger';

let buildButton: vscode.StatusBarItem;
let flashButton: vscode.StatusBarItem;
let buildStatus: vscode.StatusBarItem;

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

function createStatusBar(context: vscode.ExtensionContext) {

    buildButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        2
    );

    buildButton.text = "$(symbol-property) Build";
    buildButton.command = "vhdl-assistant.build";
    buildButton.tooltip = "Compile Quartus project";

    flashButton = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        1
    );

    flashButton.text = "$(arrow-down) Flash";
    flashButton.command = "vhdl-assistant.flash";
    flashButton.tooltip = "Program FPGA via JTAG";

    buildStatus = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0
    );

    buildStatus.text = "$(check) Quartus: idle";

    context.subscriptions.push(buildButton, flashButton, buildStatus);
}

async function hasQuartusProject(): Promise<boolean> {
    const files = await vscode.workspace.findFiles('**/*.qpf');
    return files.length > 0;
}

async function updateButtonsVisibility() {
    const hasProject = await hasQuartusProject();

    if (hasProject) {
        buildButton.show();
        flashButton.show();
        buildStatus.show();
    } else {
        buildButton.hide();
        flashButton.hide();
        buildStatus.hide();
    }
}

export function activate(context: vscode.ExtensionContext) {

	// =========================
    // Build compile
    // =========================
    const build = vscode.commands.registerCommand(
        'vhdl-assistant.build',
        async () => {

            buildStatus.text = "$(sync~spin) Building Quartus...";
            buildStatus.tooltip = "Quartus build running";
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

			const logger = new QuartusLogger(output);

            logger.startBuild(projectName);

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
                logger.parseChunk(d.toString());
            });

            proc.stderr.on('data', (d) => {
                logger.parseChunk(d.toString());
            });

            proc.on('close', (code) => {
                logger.finishBuild(code === 0);
                if (code === 0) {
                    buildStatus.text = "$(check) Build OK";
                    buildStatus.tooltip = "Build completed successfully";

                    setTimeout(() => {
                        buildStatus.text = "$(gear) Quartus: idle";
                    }, 3000);

                    vscode.window.showInformationMessage(`Build complete: ${projectName}`);
                } 
                else {
                    buildStatus.text = "$(error) Build failed";
                    buildStatus.tooltip = "Quartus build failed";

                    vscode.window.showErrorMessage(`Build failed: ${projectName}`);
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
            
            buildStatus.text = "$(sync~spin) Flashing Quartus...";
            buildStatus.tooltip = "Quartus flash running";
            const output = vscode.window.createOutputChannel("Quartus");
            output.show();

            const projectName = await getProjectName();
			const projectFolder = await getProjectDir();
			const binPath = getQuartusBin('qprogrammer');
			
            if (!projectName) {
                vscode.window.showErrorMessage("No Quartus .qpf project found");
                return;
            }
			
			if (!projectFolder) {
                vscode.window.showErrorMessage("Error getting project directory path");
                return;
            }

			if (!binPath) {
				vscode.window.showErrorMessage("Quartus path not configured");
				return;
			}
			
			const full_path = path.join(binPath, 'quartus_pgm');

			const firm = "p;output_files/"+ projectName + ".pof";
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
                    buildStatus.text = "$(check) Flash OK";
                    buildStatus.tooltip = "Flash completed successfully";

                    setTimeout(() => {
                        buildStatus.text = "$(gear) Quartus: idle";
                    }, 3000);

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

    createStatusBar(context);

    updateButtonsVisibility();
}

vscode.workspace.onDidChangeWorkspaceFolders(() => {
    updateButtonsVisibility();
});

vscode.workspace.onDidCreateFiles(() => {
    updateButtonsVisibility();
});

vscode.workspace.onDidDeleteFiles(() => {
    updateButtonsVisibility();
});

export function deactivate() {}