import * as vscode from 'vscode';
import { registerBuildCommand } from './commands/build';
import { registerFlashCommand } from './commands/flash';
import { registerSetQuartusPathCommand } from './commands/setPath';
import { setupMaterialIcons } from './ui/setIcon';
import { createStatusBar, updateButtonsVisibility } from './ui/statusBar';
import { registerQsfLint } from './parsers/qsfLint';
import { registerTopLevelPortLint } from './parsers/portLint';
import { registerGenSimulationUnit } from './commands/genDoFile';
import { registerRunSimulationUnit } from './commands/runDoFile';
import { EntityIndexer } from './services/entityIndexer';
import { registerWorkspaceWatchers } from './services/workspaceWatcher';
import { registerLanguageFeatures } from './services/languagesFeatures';
import { registerSemanticTokens } from './services/semanticTokens';
import { registerUiWatchers } from './ui/uiWatcher';
import { registerQsfView } from './services/qsfViewService';


export async function activate(context: vscode.ExtensionContext) 
{
    // Ui
    setupMaterialIcons();
    createStatusBar(context);

    // UI watchers
    registerUiWatchers(context);
    
    // Command
    registerBuildCommand(context);
    registerFlashCommand(context);
    registerSetQuartusPathCommand(context);
    registerGenSimulationUnit(context);
    registerRunSimulationUnit(context);

    // Lint
    registerQsfLint(context);
    registerTopLevelPortLint(context);
    registerSemanticTokens(context);

    // Tree View
    await registerQsfView(context);

    // VHDL indexing
    const indexer = new EntityIndexer();
    await indexer.buildIndex();

    // Workspace listeners
    registerWorkspaceWatchers(context, indexer);

    // Language features
    registerLanguageFeatures(context, indexer);

    updateButtonsVisibility();
}

export function deactivate() {}