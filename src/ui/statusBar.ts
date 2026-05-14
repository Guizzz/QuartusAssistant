import * as vscode from 'vscode';
import { hasQuartusProject } from '../quartus/quartusProject';

export let buildButton: vscode.StatusBarItem;
export let flashButton: vscode.StatusBarItem;
export let buildStatus: vscode.StatusBarItem;

export function createStatusBar(context: vscode.ExtensionContext) 
{
    buildButton = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    2
                );

    buildButton.text = "$(symbol-property) Build";

    buildButton.command = 'quartus-assistant.build';

    flashButton = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    1
                );

    flashButton.text = "$(arrow-down) Flash";
    flashButton.command = 'quartus-assistant.flash';

    buildStatus = vscode.window.createStatusBarItem(
                    vscode.StatusBarAlignment.Left,
                    0
                );

    buildStatus.text = "$(gear) Quartus: idle";

    context.subscriptions.push(
        buildButton,
        flashButton,
        buildStatus
    );
}

export async function updateButtonsVisibility() 
{
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