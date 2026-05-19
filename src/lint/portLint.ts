import * as vscode from 'vscode';
import { parseQsf } from './qsfParser';

export function registerTopLevelPortLint(context: vscode.ExtensionContext)
{
    const diagnostics = vscode.languages.createDiagnosticCollection('vhdl-qsf');

    async function validate(document: vscode.TextDocument)
    {
        if (!document.fileName.endsWith('.vhd')) { return; }

        const text = document.getText();
        const entityMatch = text.match(/entity\s+(\w+)\s+is/i);

        if (!entityMatch) { return; }

        const entityName = entityMatch[1];
        const qsfFiles = await vscode.workspace.findFiles('**/*.qsf');

        if (qsfFiles.length === 0) {return;}

        const qsf = await parseQsf(qsfFiles[0]);

        if ( !qsf.topLevel || qsf.topLevel.toLowerCase() !== entityName.toLowerCase() )
        {
            diagnostics.delete(document.uri);
            return;
        }

        const diags: vscode.Diagnostic[] = [];
        const portBlockMatch = text.match(/port\s*\(([\s\S]*?)\)\s*;/im);

        if (!portBlockMatch) 
        {
            diagnostics.set(document.uri, diags);
            return;
        }

        const portBlock = portBlockMatch[1];
        const portRegex = /(\w+(?:\s*,\s*\w+)*)\s*:\s*(in|out|inout)/gi;
        let match;

        while ((match = portRegex.exec(portBlock)) !== null)
        {
            const names = match[1]
                .split(',')
                .map(s => s.trim());

            for (const name of names)
            {
                // Controlla se esiste assegnazione pin
                const assigned =
                    qsf.pins.some(p =>
                        p.signal === name ||
                        p.signal.startsWith(name + '[')
                    );

                if (!assigned)
                {
                    const absoluteIndex = text.indexOf(match[0]);
                    const start = document.positionAt(absoluteIndex);
                    const end = start.translate(0, name.length);

                    diags.push(
                        new vscode.Diagnostic(
                            new vscode.Range(start, end),
                            `No PIN assignment for '${name}'`,
                            vscode.DiagnosticSeverity.Warning
                        )
                    );
                }
            }
        }

        diagnostics.set(document.uri, diags);
    }

    context.subscriptions.push(
        diagnostics,
        vscode.workspace.onDidOpenTextDocument(validate),
        vscode.workspace.onDidChangeTextDocument(e =>validate(e.document))
    );
}