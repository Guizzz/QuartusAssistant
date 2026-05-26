import { EntitySymbol } from "../types/types";

export function parseEntities(text: string): EntitySymbol[] {

    const entities: EntitySymbol[] = [];
    const regex = /entity\s+(\w+)\s+is/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) 
    {
        entities.push({
            name: match[1],
            offset: match.index
        });
    }

    return entities;
}