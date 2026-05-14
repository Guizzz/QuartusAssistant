import * as vscode from 'vscode';
import * as path from 'path';

export async function getProjectFile() 
{
    const files = await vscode.workspace.findFiles('**/*.qpf');
    return files[0];
}

export async function getProjectName(): Promise<string | null> {

    const file = await getProjectFile();

    if (!file) {
        return null;
    }

    return path.basename(file.fsPath, '.qpf');
}

export async function getProjectDir(): Promise<string | null> {

    const file = await getProjectFile();

    if (!file) {
        return null;
    }

    return path.dirname(file.fsPath);
}

export async function hasQuartusProject(): Promise<boolean> 
{
    const file = await getProjectFile();
    return !!file;
}