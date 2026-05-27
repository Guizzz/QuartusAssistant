import * as vscode from 'vscode';
import { parseEntities } from '../parsers/entityParser';
import { PackageInfo } from '../types/types';
import { parsePackages } from '../parsers/packageParser';

export class EntityIndexer {

    private entityMap    = new Map<string, vscode.Location>();
    private fileEntities = new Map<string, string[]>();
    private packageMap   = new Map<string, PackageInfo>();
    private filePackages = new Map<string, string[]>();

    async buildIndex() {

        this.entityMap.clear();
        this.packageMap.clear();
        this.fileEntities.clear();
        this.filePackages.clear();

        const files =  await vscode.workspace.findFiles( '**/*.{vhd,vhdl}' );

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
        const entityNames: string[] = [];

        for (const entity of entities) 
        {
            entityNames.push(entity.name);
            const pos = doc.positionAt(entity.offset);

            const location = new vscode.Location(
                file,
                new vscode.Range(pos, pos)
            );

            this.entityMap.set(entity.name, location);
        }

        this.fileEntities.set(path, entityNames);

        const packages = parsePackages(text);
        const packageNames: string[] = [];

        for (const pkg of packages) {

            packageNames.push(pkg.name);

            const pkgPos = doc.positionAt(pkg.offset);

            const pkgLocation =
                new vscode.Location(
                    file,
                    new vscode.Range(pkgPos, pkgPos)
                );

            const symbols = new Map<string, vscode.Location>();

            for (const symbol of pkg.symbols) 
            {
                const symbolPos = doc.positionAt(symbol.offset);
                const symbolLocation =
                    new vscode.Location(
                        file,
                        new vscode.Range(symbolPos, symbolPos)
                    );

                symbols.set( symbol.name, symbolLocation);
            }

            this.packageMap.set(
                pkg.name,
                {
                    location: pkgLocation,
                    symbols
                }
            );
        }

        this.filePackages.set(
            path,
            packageNames
        );

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
        return [ ...this.entityMap.keys()];
    }

    getPackage(name: string)
    {
        return this.packageMap.get(name);
    }

    hasPackage(name: string) 
    {
        return this.packageMap.has(name);
    }

    getPackageLocation(name: string) 
    {
        return this.packageMap.get(name)?.location;
    }

    getPackageSymbolLocation( packageName: string, symbolName: string ) 
    {
        const pkg = this.packageMap.get(packageName);

        if (!pkg) 
        {
            return undefined;
        }
        
        return pkg.symbols.get(symbolName);
    }

    getAllPackages() 
    {
        return [...this.packageMap.keys()];
    }
}