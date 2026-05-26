import * as vscode from 'vscode';
import { EntityIndexer } from '../services/entityIndexer';

export class VhdlDefinitionProvider implements vscode.DefinitionProvider 
{
    constructor(private indexer: EntityIndexer) {}

    provideDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Definition> 
    {

        const range = document.getWordRangeAtPosition(position);

        if (!range) {return null;}

        const word = document.getText(range);
        const line = document.lineAt(position.line).text;

        // verifica che sia entity work.xxx
        const regex = /entity\s+work\.(\w+)/i;

        const match = regex.exec(line);

        if (!match) {return null;}

        return this.indexer.getEntityLocation(word);
    }
}