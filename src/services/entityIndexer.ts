// src/services/entityIndexer.ts

import * as vscode from 'vscode';
import { parseEntities } from '../parsers/entityParser';

export class EntityIndexer {

    private entityMap = new Map<string, vscode.Location>();
    private fileEntities = new Map<string, string[]>();

    async buildIndex() 
    {
        this.entityMap.clear();
        this.fileEntities.clear();

        const files = await vscode.workspace.findFiles('**/*.{vhd,vhdl}');

        for (const file of files) 
        {
            await this.indexFile(file);
        }
    }

    async indexFile(file: vscode.Uri) {

        const path = file.fsPath;
        this.removeFile(path);

        const doc = await vscode.workspace.openTextDocument(file);
        const text = doc.getText();
        const entities = parseEntities(text);
        const names: string[] = [];

        for (const entity of entities) 
        {
            names.push(entity.name);
            const pos = doc.positionAt(entity.offset);

            const location = new vscode.Location(
                file,
                new vscode.Range(pos, pos)
            );

            this.entityMap.set(entity.name, location);
        }

        this.fileEntities.set(path, names);
    }

    removeFile(path: string) 
    {
        const entities = this.fileEntities.get(path);

        if (!entities) {return;}

        for (const entity of entities) 
        {
            this.entityMap.delete(entity);
        }

        this.fileEntities.delete(path);
    }

    getEntityLocation(name: string) 
    {
        return this.entityMap.get(name);
    }

    hasEntity(name: string) 
    {
        return this.entityMap.has(name);
    }

    getAllEntities() 
    {
        return [
            ...this.entityMap.keys()
        ];
    }
}