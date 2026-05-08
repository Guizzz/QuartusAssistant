import * as vscode from 'vscode';

export async function setupMaterialIcons() {
    const config = vscode.workspace.getConfiguration();

    // legge associazioni esistenti
    const current = config.get<Record<string, string>>( 'material-icon-theme.files.associations' ) || {};

    // aggiunge/override
    current['*.qsf'] = 'settings';
    current['*.qpf'] = '3d';

    // salva nelle user settings
    await config.update(
        'material-icon-theme.files.associations',
        current,
        vscode.ConfigurationTarget.Global
    );
}