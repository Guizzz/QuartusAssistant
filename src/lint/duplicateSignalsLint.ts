import * as vscode from 'vscode';
import { parseSignals } from '../parsers/variableParser';

export class DuplicateSignalLinter
{
    private diagnostics = vscode.languages.createDiagnosticCollection('vhdl');

    constructor(context: vscode.ExtensionContext)
    {
        if (vscode.window.activeTextEditor)
        {
            this.refresh(vscode.window.activeTextEditor.document);
        }
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(doc => this.refresh(doc)),
            vscode.workspace.onDidChangeTextDocument(e => this.refresh(e.document))
        );
    }

    private refresh(document: vscode.TextDocument)
    {
        if (document.languageId !== 'vhdl') {return;}

        const text = document.getText();
        const signals = parseSignals(text);
        const diagnostics: vscode.Diagnostic[] = [];
        const seen = new Map<string, typeof signals[0]>();

        for (const signal of signals)
        {
            const key = signal.name.toLowerCase();
            if (seen.has(key))
            {
                const pos = document.positionAt(signal.offset);
                const range = new vscode.Range(
                    pos,
                    pos.translate(0, signal.name.length)
                );
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Duplicate declaration of '${signal.name}'`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostic.source = 'VHDL Essentials';
                diagnostics.push(diagnostic);
            }
            else
            {
                seen.set(key, signal);
            }
        }
        this.diagnostics.set(document.uri, diagnostics);
    }

    dispose(): void
    {
        this.diagnostics.dispose();
    }
}