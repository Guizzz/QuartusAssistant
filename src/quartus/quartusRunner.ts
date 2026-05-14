import * as vscode from 'vscode';
import * as path from 'path';

import { spawn } from 'child_process';

import { QuartusLogger, quartusOutput } from './quartusLogger';

import {
    getProjectDir,
    getProjectName
} from './quartusProject';

import { getQuartusBin } from './quartusConfig';
import { buildStatus } from '../ui/statusBar';

const logger = new QuartusLogger(quartusOutput);

export interface QuartusTaskOptions 
{
    command: string;
    tool: string;
    args: string[];

    statusRunning: string;
    statusSuccess: string;
    statusFail: string;

    successMessage: (project: string) => string;
    failMessage: (project: string) => string;
}

export async function runQuartusTask(options: QuartusTaskOptions) 
{
    const [projectName, projectDir] = await Promise.all([
        getProjectName(),
        getProjectDir()
    ]);

    if (!projectName || !projectDir) {
        vscode.window.showErrorMessage('No Quartus project found');
        return;
    }

    const binPath = getQuartusBin(options.tool);

    if (!binPath) {
        vscode.window.showErrorMessage('Quartus path not configured');
        return;
    }

    buildStatus.text = `$(sync~spin) ${options.statusRunning}`;
    quartusOutput.show(true);

    const executable = path.join(binPath, options.command);

    logger.startBuild(projectName);

    const proc = spawn(
        executable,
        options.args,
        {
            cwd: projectDir,
            env: {
                ...process.env,
                PATH: `${binPath};${process.env.PATH}`
            }
        }
    );

    proc.stdout.on('data', d => {
        logger.parseChunk(d.toString());
    });

    proc.stderr.on('data', d => {
        logger.parseChunk(d.toString());
    });

    proc.on('close', code => {

        const success = code === 0;
        logger.finishBuild(success);

        if (success) {
            buildStatus.text = `$(check) ${options.statusSuccess}`;
            vscode.window.showInformationMessage(options.successMessage(projectName));
        } else {
            buildStatus.text = `$(error) ${options.statusFail}`;
            vscode.window.showErrorMessage(options.failMessage(projectName));
        }
    });
}