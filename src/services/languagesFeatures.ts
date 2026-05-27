import * as vscode from 'vscode';

import { EntityIndexer } from './entityIndexer';
import { VhdlDefinitionProvider } from '../providers/definitionProvider';
import { VhdlHighlightProvider } from '../providers/vhdlHighlightProvider';

export function registerLanguageFeatures(context: vscode.ExtensionContext, indexer: EntityIndexer) 
{
    const definitionProvider =
        vscode.languages.registerDefinitionProvider(
            { language: 'vhdl' },
            new VhdlDefinitionProvider(indexer)
        );

    const highlightProvider = new VhdlHighlightProvider(indexer);
    highlightProvider.activate();

    context.subscriptions.push(
        definitionProvider,
        highlightProvider
    );
}