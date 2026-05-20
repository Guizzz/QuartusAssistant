import * as vscode from 'vscode';
import * as path from 'path';

export interface SimulationUnit {
    entity: string;
    file: string;
    runTimeNs: number;
}

export async function scanSimulationUnits( folder: vscode.Uri ): Promise<SimulationUnit[]> 
{
    const units: SimulationUnit[] = [];

    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.vhd'));

    for (const file of files) {

        const data = await vscode.workspace.fs.readFile(file);
        const text = Buffer.from(data).toString('utf8');

        const entityMatch =
            text.match(/entity\s+(\w+)\s+is/i);

        if (!entityMatch) {
            continue;
        }

        const entity = entityMatch[1];

        // -----------------------------------------
        // HEURISTICS
        // -----------------------------------------

        const hasPorts =
            /port\s*\(/i.test(text);

        const hasWaitFor =
            /wait\s+for/i.test(text);

        const hasAssert =
            /assert\s+/i.test(text);

        const hasEntityInstantiation =
            /entity\s+work\./i.test(text);

        const hasSimulationArchitecture =
            /architecture\s+sim/i.test(text);

        const isSimulationCandidate =
            (
                !hasPorts ||
                hasWaitFor ||
                hasAssert ||
                hasEntityInstantiation ||
                hasSimulationArchitecture
            );

        if (!isSimulationCandidate) {
            continue;
        }

        // -----------------------------------------
        // RUNTIME ESTIMATION
        // -----------------------------------------

        const waitRegex =
            /wait\s+for\s+(\d+)\s*(ns|us|ms)/gi;

        let totalNs = 0;

        let match: RegExpExecArray | null;

        while ((match = waitRegex.exec(text)) !== null) {

            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();

            switch (unit) {

                case 'ns':
                    totalNs += value;
                    break;

                case 'us':
                    totalNs += value * 1000;
                    break;

                case 'ms':
                    totalNs += value * 1_000_000;
                    break;
            }
        }

        if (totalNs === 0) {
            totalNs = 1000;
        }

        totalNs += 100;

        units.push({
            entity,
            file: vscode.workspace.asRelativePath(file),
            runTimeNs: totalNs
        });
    }

    return units;
}