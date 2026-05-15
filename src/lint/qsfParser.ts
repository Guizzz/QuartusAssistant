import * as vscode from 'vscode';

export async function parseQsf(fileUri: vscode.Uri) 
{
  const content = await vscode.workspace.fs.readFile(fileUri);
  const text = Buffer.from(content).toString('utf-8');

  const lines = text.split(/\r?\n/);

  let family: string | undefined;
  let device: string | undefined;
  let topLevel: string | undefined;
  let outputFolder: string | undefined;
  const pins: { signal: string; pin: string }[] = [];

  for (const line of lines) {

    if(line.trimStart().startsWith("#")) {continue;}

    let match = line.match(/set_global_assignment -name FAMILY "(.+?)"/);
    if (match) {family = match[1];}

    match = line.match(/set_global_assignment -name DEVICE (.+)/);
    if (match) {device = match[1];}
    
    match = line.match(/set_global_assignment -name TOP_LEVEL_ENTITY (.+)/);
    if (match) {topLevel = match[1];}
    
    match = line.match(/set_global_assignment -name PROJECT_OUTPUT_DIRECTORY (.+)/);
    if (match) {outputFolder = match[1];}

    match = line.match(/set_location_assignment (PIN_[A-Z0-9]+) -to (\w+)/);
    if (match) {
      pins.push({ pin: match[1], signal: match[2] });
    }
  }

  return { family, device, topLevel, outputFolder, pins };
}