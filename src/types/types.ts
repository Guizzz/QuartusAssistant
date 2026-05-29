import * as vscode from 'vscode';

export interface PinAssignment {
    signal: string;
    pin: string;
    location: vscode.Location;
}

export interface EntitySymbol {
    name: string;
    offset: number;
}

export interface ParsedPackage {
    name: string;
    offset: number;
    symbols: ParsedPackageSymbol[];
}

export interface ParsedPackageSymbol {
    kind: string;
    name: string;
    offset: number;
    type: string;
}

export interface PackageSymbolInfo {
    location: vscode.Location;
    type: string;
    kind: string;
}

export interface PackageInfo {
    location: vscode.Location;
    symbols: Map<string, PackageSymbolInfo>;
}

export interface ParsedSignalLike
{
    kind: string;
    name: string;
    type: string;
    direction?: string;
    offset: number;
}