import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import { QuartusLogger } from './quartusLogger';
import { QsfTokensProvider, legend } from './qsfTokensProvider';

let buildButton: vscode.StatusBarItem;
let flashButton: vscode.StatusBarItem;
let buildStatus: vscode.StatusBarItem;
let diagnostics: vscode.DiagnosticCollection;

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

async function runQuartusTask(options: {
    command: string;
    tool: string;
    args: string[];
    statusRunning: string;
    statusSuccess: string;
    statusFail: string;
    successMessage: (project: string) => string;
    failMessage: (project: string) => string;
    detached?: boolean;
}) {

    const output = vscode.window.createOutputChannel("Quartus");
    const logger = new QuartusLogger(output);

    buildStatus.text = `$(sync~spin) ${options.statusRunning}`;
    buildStatus.tooltip = options.statusRunning;

    output.show();

    const [projectName, projectFolder] = await Promise.all([
        getProjectName(),
        getProjectDir()
    ]);

    if (!projectName)
    {
        vscode.window.showErrorMessage("No Quartus .qpf project found");
        return;
    }

    if (!projectFolder) {
        vscode.window.showErrorMessage("Error getting project directory path");
        return;
    }

    const binPath = getQuartusBin(options.tool);

    if (!binPath) {
        vscode.window.showErrorMessage("Quartus path not configured");
        return;
    }

    const executable = path.join(binPath, options.command);

    logger.startBuild(projectName);

    const proc = spawn(
        executable,
        options.args,
        {
            cwd: projectFolder,
            env: {
                ...process.env,
                PATH: `${binPath};${process.env.PATH}`
            }
        }
    );

    if (options.detached) {

        proc.unref();

        if (options.statusSuccess) {
            buildStatus.text =
                `$(check) ${options.statusSuccess}`;
        }

        if (options.successMessage) {
            vscode.window.showInformationMessage(
                options.successMessage(projectName)
            );
        }

        return;
    }

    proc.stdout.on('data', d => {
        logger.parseChunk(d.toString());
    });

    proc.stderr.on('data', d => {
        logger.parseChunk(d.toString());
    });

    proc.on('error', err => {

        buildStatus.text = "$(error) Spawn failed";

        vscode.window.showErrorMessage(`Failed to start process: ${err.message}`);
    });

    proc.on('close', code => {

        const success = code === 0;

        logger.finishBuild(success);

        if (success) 
        {
            buildStatus.text = `$(check) ${options.statusSuccess}`;
            buildStatus.tooltip = options.statusSuccess;

            vscode.window.showInformationMessage(options.successMessage(projectName));

            setTimeout(() => {
                buildStatus.text = "$(gear) Quartus: idle";
                buildStatus.tooltip = "Idle";
            }, 3000);
        } 
        else 
        {
            buildStatus.text = `$(error) ${options.statusFail}`;
            buildStatus.tooltip = options.statusFail;

            vscode.window.showErrorMessage(options.failMessage(projectName));
        }
    });
}

function lintDocument(document: vscode.TextDocument) {
  const diags: vscode.Diagnostic[] = [];
  if(!document.fileName.endsWith("qsf")) {return;}

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;

    if (line.includes('  ') && !line.startsWith("#")) {
      diags.push(new vscode.Diagnostic(
        new vscode.Range(i, 0, i, line.length),
        'Spazi multipli non necessari',
        vscode.DiagnosticSeverity.Warning
      ));
    }

    if (line.startsWith('set_global_assignment') && !line.includes('-name')) {
      diags.push(new vscode.Diagnostic(
        new vscode.Range(i, 0, i, line.length),
        'Possibile assignment QSF incompleto (manca -name)',
        vscode.DiagnosticSeverity.Error
      ));
    }
  }

  diagnostics.set(document.uri, diags);
}

export function activate(context: vscode.ExtensionContext) {
    
	// =========================
    // Build compile
    // =========================
    const build = vscode.commands.registerCommand(
        'vhdl-assistant.build',
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

                statusRunning: 'Building Quartus...',
                statusSuccess: 'Build OK',
                statusFail: 'Build failed',

                successMessage: p => `Build complete: ${p}`,
                failMessage: p => `Build failed: ${p}`
            });
        }
    );

	// =========================
    // Flash program
    // =========================
    const flash = vscode.commands.registerCommand(
        'vhdl-assistant.flash',
        async () => {

            const projectName = await getProjectName();

            if (!projectName) {
                vscode.window.showErrorMessage(
                    "No Quartus .qpf project found"
                );
                return;
            }

            const firmware = `p;output_files/${projectName}.pof`;


            await runQuartusTask({
                command: 'quartus_pgm',
                tool: 'qprogrammer',
                args: ['-m', 'jtag', '-o', firmware],

                statusRunning: 'Flashing Quartus...',
                statusSuccess: 'Flash OK',
                statusFail: 'Flash failed',

                successMessage: p => `Flash complete: ${p}`,
                failMessage: p => `Flash failed: ${p}`
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

    // =========================
    // .qsf Formatter
    // =========================
    const formatter = vscode.languages.registerDocumentSemanticTokensProvider(
        { language: 'qsf' },
        new QsfTokensProvider(),
        legend
    );

    diagnostics = vscode.languages.createDiagnosticCollection('qsf');

    context.subscriptions.push(diagnostics);
    context.subscriptions.push(formatter);
    context.subscriptions.push(build);
	context.subscriptions.push(flash);
	context.subscriptions.push(setPathCmd);

    createStatusBar(context);

    updateButtonsVisibility();

    context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(lintDocument),
    vscode.workspace.onDidChangeTextDocument(e => lintDocument(e.document))
  );
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