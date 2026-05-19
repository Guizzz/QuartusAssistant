import * as vscode from 'vscode';

export function registerQsfLint(context: vscode.ExtensionContext)
{
    const diagnostics = vscode.languages.createDiagnosticCollection('qsf');
    function lint(document: vscode.TextDocument) 
    {
        if (!document.fileName.endsWith('.qsf')) {return;}

        const diags: vscode.Diagnostic[] = [];

        for (let i = 0; i < document.lineCount; i++) 
        {
            const line = document.lineAt(i).text;

            if (line.includes('  ') && !line.startsWith('#'))
            {
                diags.push(
                    new vscode.Diagnostic(
                        new vscode.Range(
                            i,
                            0,
                            i,
                            line.length
                        ),
                        'Multiple spaces',
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }
        }

        diagnostics.set(document.uri, diags);
    }

    context.subscriptions.push(
        diagnostics,
        vscode.workspace.onDidOpenTextDocument(lint),
        vscode.workspace.onDidChangeTextDocument(e => lint(e.document))
    );
}