import * as vscode from 'vscode';

export const legend = new vscode.SemanticTokensLegend([
  'keyword',
  'parameter',
  'string',
  'comment'
]);

export class QsfTokensProvider implements vscode.DocumentSemanticTokensProvider 
{

  provideDocumentSemanticTokens(document: vscode.TextDocument) 
  {

    const builder = new vscode.SemanticTokensBuilder(legend);

    for (let i = 0; i < document.lineCount; i++) {

      const line = document.lineAt(i).text;

      // commenti
      if (line.trim().startsWith('#')) 
      {
        builder.push(i, 0, line.length, 3);
        continue;
      }

      // keyword principali
      if (line.startsWith('set_global_assignment') ||  line.startsWith('set_location_assignment'))
      {
        const word = line.split(' ')[0];
        builder.push(i, 0, word.length, 0);
      }

      // parametri tipo -name -to
      const paramRegex = /-\w+/g;
      let m;
      while ((m = paramRegex.exec(line))) 
      {
        builder.push(i, m.index, m[0].length, 1);
      }

      // stringhe ""
      const strRegex = /"([^"]+)"/g;
      while ((m = strRegex.exec(line))) 
      {
        builder.push(i, m.index, m[0].length, 2);
      }
    }

    return builder.build();
  }
}