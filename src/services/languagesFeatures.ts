import * as vscode from 'vscode';

import { EntityIndexer } from './entityIndexer';
import { VhdlDefinitionProvider } from '../providers/definitions/definitionProvider';
import { VhdlHighlightProvider } from '../providers/vhdlHighlightProvider';
import { PinHoverProvider } from '../providers/pinHoverProvider';
import { PinDefinitionProvider } from '../providers/definitions/pinDefinitionProvider';

export function registerLanguageFeatures(context: vscode.ExtensionContext, indexer: EntityIndexer) 
{
    const definitionProvider    = vscode.languages.registerDefinitionProvider(
                                    'vhdl',
                                    new VhdlDefinitionProvider(indexer)
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
        pinDefinitionProvider,
        pinHoverProvider,
        highlightProvider
    );
}