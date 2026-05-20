import * as vscode from 'vscode';

import {scanSimulationUnits} from '../simulation/simulationScanner';
import { generateDoFile } from '../simulation/doGenerator';
import { parseQsf } from '../lint/qsfParser';

export function registerSimulationUnit(context: vscode.ExtensionContext) 
{
    const command = vscode.commands.registerCommand(
            'quartus-assistant.generateDo',
            async () => {

                const workspace = vscode.workspace.workspaceFolders?.[0];

                if (!workspace) {
                    vscode.window.showErrorMessage( 'No workspace opened' );
                    return;
                }

                const qsfFiles = await vscode.workspace.findFiles( '**/*.qsf' );

                if (qsfFiles.length === 0) {
                    vscode.window.showErrorMessage( 'No QSF file found' );
                    return;
                }

                await parseQsf(qsfFiles[0]);

                // -----------------------------
                // VHDL FILES
                // -----------------------------

                const vhdlFiles = await vscode.workspace.findFiles( '**/*.vhd' );
                const allFileNames = vhdlFiles.map(file => vscode.workspace.asRelativePath(file));

                // -----------------------------
                // SIMULATION UNITS
                // -----------------------------

                const units = await scanSimulationUnits( workspace.uri );

                if (units.length === 0) {
                    vscode.window.showErrorMessage( 'No simulation unit found' );
                    return;
                }

                // -----------------------------
                // PICK
                // -----------------------------

                const picked =
                    await vscode.window.showQuickPick(
                        units.map(unit => ({
                            label: unit.entity,
                            detail: unit.file,
                            unit
                        })),

                        {
                            placeHolder:
                                'Select simulation entity'
                        }
                    );

                if (!picked) { 
                    vscode.window.showErrorMessage( 'No file picked' );
                    return; }
                

                const projectFiles =
                    allFileNames.filter(
                        file => !file.endsWith(picked.unit.file)
                    );

                // -----------------------------
                // GENERATE
                // -----------------------------

                const doContent =
                    generateDoFile(
                        picked.unit,
                        projectFiles,
                        picked.unit.runTimeNs
                    );

                const doFile =
                    vscode.Uri.joinPath(
                        workspace.uri,
                        'questasim.do'
                    );

                await vscode.workspace.fs.writeFile(
                    doFile,
                    Buffer.from(doContent)
                );

                vscode.window.showInformationMessage(
                    'questasim.do generated'
                );
            }
        );

    context.subscriptions.push(command);
}