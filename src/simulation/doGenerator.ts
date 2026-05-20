import { SimulationUnit } from "./simulationScanner";

export function generateDoFile(unit: SimulationUnit, vhdlFiles: string[], runtimeNs: number): string 
{
    const lines: string[] = [];

    lines.push('transcript on');
    lines.push('');

    lines.push('if {[file exists work]} {');
    lines.push('    vdel -all');
    lines.push('}');
    lines.push('');

    lines.push('vlib work');
    lines.push('');

    
    for (const file of vhdlFiles) {
        lines.push(`vcom ${file}`);
    }
    
    lines.push(`vcom ${unit.file}`);
    lines.push('');
    
    lines.push('file mkdir simulation/waves');
    lines.push('');
    
    const wlfName = `${unit.entity}.wlf`;

    lines.push(`vsim -voptargs=+acc -wlf simulation/waves/${wlfName} work.${unit.entity}`);
    lines.push('');

    lines.push('add wave -r *');
    lines.push('');

    lines.push(`run ${runtimeNs} ns`);
    lines.push('');

    lines.push('wave zoom full');

    return lines.join('\n');
}