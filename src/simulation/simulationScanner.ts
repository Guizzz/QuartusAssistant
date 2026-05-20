import * as vscode from 'vscode';

export interface SimulationUnit
{
    entity: string;
    file: string;
    entityNeeded: string[];
    runTimeNs: number;
}

interface EntityInfo
{
    file: vscode.Uri;
    text: string;
}

export async function scanSimulationUnits(
    folder: vscode.Uri
): Promise<SimulationUnit[]>
{
    const units: SimulationUnit[] = [];

    const files =
        await vscode.workspace.findFiles(
            new vscode.RelativePattern(folder, '**/*.vhd')
        );

    // =========================================
    // ENTITY DATABASE
    // =========================================

    const entityDb = new Map<string, EntityInfo>();

    for (const file of files)
    {
        const data =
            await vscode.workspace.fs.readFile(file);

        const text =
            Buffer.from(data).toString('utf8');

        const entityMatch =
            text.match(/entity\s+(\w+)\s+is/i);

        if (!entityMatch) {
            continue;
        }

        const entity =
            entityMatch[1];

        entityDb.set(entity, {
            file,
            text
        });
    }

    // =========================================
    // PROCESS SIMULATION UNITS
    // =========================================

    for (const [entity, info] of entityDb)
    {
        const text = info.text;

        // -----------------------------------------
        // HEURISTICS
        // -----------------------------------------

        const hasPorts =
            /port\s*\(/i.test(text);

        const hasWaitFor =
            /wait\s+for/i.test(text);

        const hasAssert =
            /assert\s+/i.test(text);

        const hasSimulationArchitecture =
            /architecture\s+sim/i.test(text);

        const isSimulationCandidate =
        (
            !hasPorts ||
            hasWaitFor ||
            hasAssert ||
            hasSimulationArchitecture
        );

        if (!isSimulationCandidate) {
            continue;
        }

        // =========================================
        // RECURSIVE DEPENDENCIES
        // =========================================

        const visited = new Set<string>();

        function resolveDependencies(
            currentEntity: string
        )
        {
            const current =
                entityDb.get(currentEntity);

            if (!current) {
                return;
            }

            const currentPath =
                vscode.workspace.asRelativePath(current.file);

            if (visited.has(currentPath)) {
                return;
            }

            visited.add(currentPath);

            const regex =
                /entity\s+work\.(\w+)/gi;

            const matches =
                current.text.matchAll(regex);

            for (const match of matches)
            {
                const dep =
                    match[1];

                if (dep !== entity)
                {
                    resolveDependencies(dep);
                }
            }
        }

        resolveDependencies(entity);

        // rimuovi la root entity
        visited.delete(entity);

        // =========================================
        // RUNTIME ESTIMATION
        // =========================================

        const waitRegex =
            /wait\s+for\s+(\d+)\s*(ns|us|ms)/gi;

        let totalNs = 0;

        let match: RegExpExecArray | null;

        while ((match = waitRegex.exec(text)) !== null)
        {
            const value =
                parseInt(match[1]);

            const unit =
                match[2].toLowerCase();

            switch (unit)
            {
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
            file: vscode.workspace.asRelativePath(info.file),
            entityNeeded: [...visited],
            runTimeNs: totalNs
        });
    }

    return units;
}