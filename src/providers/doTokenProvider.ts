import * as vscode from 'vscode';

export class DoTokenProvider implements vscode.DocumentSemanticTokensProvider {

    private static legend = new vscode.SemanticTokensLegend(
        [
            'keyword',
            'string',
            'number',
            'comment',
            'function'
        ],
        []
    );

    public static getLegend(): vscode.SemanticTokensLegend {
        return DoTokenProvider.legend;
    }

    private keywords = [
        'vlib',
        'vmap',
        'vcom',
        'vlog',
        'vsim',
        'run',
        'add',
        'wave',
        'force',
        'restart',
        'quit',
        'do',
        'if',
        'while',
        'foreach',
        'proc',
        'set'
    ];

    async provideDocumentSemanticTokens(document: vscode.TextDocument): Promise<vscode.SemanticTokens> 
    {
        const builder = new vscode.SemanticTokensBuilder( DoTokenProvider.legend );

        for (let line = 0; line < document.lineCount; line++) 
        {
            const text = document.lineAt(line).text;

            // commenti #
            const commentMatch = text.match(/#.*/);
            if (commentMatch) 
            {
                const start = commentMatch.index ?? 0;

                builder.push(
                    line,
                    start,
                    commentMatch[0].length,
                    3, // comment
                    0
                );
            }

            // stringhe
            const stringRegex = /"([^"]*)"/g;
            let stringMatch;

            while ((stringMatch = stringRegex.exec(text)) !== null) 
            {
                builder.push(
                    line,
                    stringMatch.index,
                    stringMatch[0].length,
                    1, // string
                    0
                );
            }

            // numeri
            const numberRegex = /\b\d+\b/g;
            let numberMatch;

            while ((numberMatch = numberRegex.exec(text)) !== null) 
            {
                builder.push(
                    line,
                    numberMatch.index,
                    numberMatch[0].length,
                    2, // number
                    0
                );
            }

            // keywords
            for (const keyword of this.keywords) 
            {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                let match;

                while ((match = regex.exec(text)) !== null) 
                {
                    builder.push(
                        line,
                        match.index,
                        keyword.length,
                        0, // keyword
                        0
                    );
                }
            }

            // funzioni/procedure TCL
            const procRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g;
            let procMatch;

            while ((procMatch = procRegex.exec(text)) !== null) 
            {
                builder.push(
                    line,
                    procMatch.index,
                    procMatch[0].length,
                    4, // function
                    0
                );
            }
        }

        return builder.build();
    }
}