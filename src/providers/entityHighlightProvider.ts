// src/providers/entityHighlightProvider.ts

import * as vscode from 'vscode';
import { EntityIndexer } from '../services/entityIndexer';

export class EntityHighlightProvider implements vscode.Disposable {

    private decorationType: vscode.TextEditorDecorationType;
    private disposables: vscode.Disposable[] = [];

    constructor(private indexer: EntityIndexer) 
    {
        this.decorationType = vscode.window.createTextEditorDecorationType({color: '#5798e2'});
    }

    activate() 
    {
        // editor change
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(
                () => this.refresh()
            )
        );

        // text change
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(
                () => this.refresh()
            )
        );

        // initial refresh
        this.refresh();
    }

    private refresh() {

        const editor = vscode.window.activeTextEditor;

        if (!editor) {return;}
        if (editor.document.languageId !== 'vhdl') {return;}

        this.update(editor);
    }

    private update(editor: vscode.TextEditor) {

        const text = editor.document.getText();
        const regex = /entity\s+work\.(\w+)/gi;
        const decorations: vscode.DecorationOptions[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {

            const entityName = match[1];

            const location = this.indexer.getEntityLocation( entityName );
            if (!location) {continue;}

            const startOffset = match.index + match[0].lastIndexOf(entityName);
            const start = editor.document.positionAt(startOffset);
            const end = editor.document.positionAt(startOffset + entityName.length);

            decorations.push({
                range: new vscode.Range(start, end)
            });
        }

        editor.setDecorations(
            this.decorationType,
            decorations
        );
    }

    dispose() {

        this.decorationType.dispose();
        for (const d of this.disposables) 
        {
            d.dispose();
        }
    }
}