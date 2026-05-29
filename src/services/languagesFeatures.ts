import * as vscode from 'vscode';

import { EntityIndexer } from './entityIndexer';
import { VhdlDefinitionProvider } from '../providers/definitions/definitionProvider';
import { VhdlHighlightProvider } from '../providers/vhdlHighlightProvider';
import { PinHoverProvider } from '../providers/hover/pinHoverProvider';
import { PinDefinitionProvider } from '../providers/definitions/pinDefinitionProvider';
import { VarPackHoverProvider } from '../providers/hover/varPackHoverProvider';
import { VarEntityHoverProvider } from '../providers/hover/varEntityHoverProvider';

export function registerLanguageFeatures(context: vscode.ExtensionContext, indexer: EntityIndexer) 
{
    const definitionProvider    = vscode.languages.registerDefinitionProvider(
                                    'vhdl',
                                    new VhdlDefinitionProvider(indexer)
                                );
    
    const varPackHoverProvider  = vscode.languages.registerHoverProvider(
                                    'vhdl',
                                    new VarPackHoverProvider(indexer)
                                );

    const varEntityHoverProvider  = vscode.languages.registerHoverProvider(
                                    'vhdl',
                                    new VarEntityHoverProvider()
                                );

    const pinHoverProvider      = vscode.languages.registerHoverProvider(
                                    'vhdl',
                                    new PinHoverProvider()
                                );
    
    const pinDefinitionProvider = vscode.languages.registerDefinitionProvider(
                                    'vhdl',
                                    new PinDefinitionProvider()
                                );
    

    const highlightProvider = new VhdlHighlightProvider(indexer);
    highlightProvider.activate();

    context.subscriptions.push(
        definitionProvider,
        varPackHoverProvider,
        varEntityHoverProvider,
        pinHoverProvider,
        pinDefinitionProvider,
        highlightProvider
    );
}