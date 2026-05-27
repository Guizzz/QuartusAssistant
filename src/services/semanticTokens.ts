import * as vscode from 'vscode';
import { QTokensProvider } from '../providers/semanticTokens/qsfTokensProvider';
import { DoTokenProvider } from '../providers/semanticTokens/doTokenProvider';

export function registerSemanticTokens(context: vscode.ExtensionContext)
{
    const qsfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qsf' },
            new QTokensProvider(),
            QTokensProvider.getLegend()
        );

    const qpfFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'qpf' },
            new QTokensProvider(),
            QTokensProvider.getLegend()
        );

    const doFormatter =
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'questasim-do' },
            new DoTokenProvider(),
            DoTokenProvider.getLegend()
        );

    context.subscriptions.push(
        qsfFormatter,
        qpfFormatter,
        doFormatter
    );
}