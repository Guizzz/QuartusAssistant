import * as vscode from 'vscode';
import * as path from 'path';

export function getQuartusBin(tool: string): string | null {

    const config = vscode.workspace.getConfiguration('maxv');
    const quartusPath = config.get<string>('quartusPath');

    if (!quartusPath) {return null;}

    return path.join(quartusPath, tool, 'bin64');
}