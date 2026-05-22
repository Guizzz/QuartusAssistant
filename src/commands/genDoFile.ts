import * as vscode from 'vscode';

import {scanSimulationUnits} from '../simulation/simulationScanner';
import { generateDoFile } from '../simulation/doGenerator';
import { parseQsf } from '../lint/qsfParser';
import { getWorkspace } from '../quartus/quartusProject';

export function registerGenSimulationUnit(context: vscode.ExtensionContext) 
{
    const command = vscode.commands.registerCommand(
            'quartus-assistant.generateDo',
            async () => {

                const workspace = getWorkspace();
                if (!workspace) {return;}

                // -----------------------------
                // SIMULATION UNITS
                // -----------------------------

                const units = await scanSimulationUnits( workspace );

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
                    return; 
                }

                // -----------------------------
                // GENERATE
                // -----------------------------
                
                const doContent =
                    generateDoFile(
                        picked.unit,
                        picked.unit.entityNeeded,
                        picked.unit.runTimeNs
                    );

                const doFile =
                    vscode.Uri.joinPath(
                        workspace,
                        'simulation',
                        picked.unit.entity +'.do'
                    );

                await vscode.workspace.fs.writeFile(
                    doFile,
                    Buffer.from(doContent)
                );

                vscode.window.showInformationMessage( 'questasim.do generated' );
            }
        );

    context.subscriptions.push(command);
}