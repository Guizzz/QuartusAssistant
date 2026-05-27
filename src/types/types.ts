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
}

export interface PackageInfo {
    location: vscode.Location;
    symbols: Map<string, vscode.Location>;
}