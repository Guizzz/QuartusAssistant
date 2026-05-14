import * as vscode from 'vscode';

export async function parseQsf(fileUri: vscode.Uri) 
{
  const content = await vscode.workspace.fs.readFile(fileUri);
  const text = Buffer.from(content).toString('utf-8');

  const lines = text.split(/\r?\n/);

  let family: string | undefined;
  let device: string | undefined;
  const pins: { signal: string; pin: string }[] = [];

  for (const line of lines) {

    if(line.trimStart().startsWith("#")) {continue;}

    let match = line.match(/set_global_assignment -name FAMILY "(.+?)"/);
    if (match) family = match[1];

    match = line.match(/set_global_assignment -name DEVICE (.+)/);
    if (match) device = match[1];

    match = line.match(/set_location_assignment (PIN_[A-Z0-9]+) -to (\w+)/);
    if (match) {
      pins.push({ pin: match[1], signal: match[2] });
    }
  }

  return { family, device, pins };
}