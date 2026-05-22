import * as vscode from 'vscode';
import { getQuestaFile, getSettingsFile } from '../quartus/quartusProject';
import { parseQsf, ProjectInfo } from '../lint/qsfParser';
import path from 'path';
export class QsfProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private qsfData: ProjectInfo | undefined;
    private questaFiles : vscode.Uri[] = [];
    private loading = false;

    async loadData() 
    {    
        if (this.loading) {return;}
        this.loading = true;

        try 
        {   
            this.questaFiles = await getQuestaFile();
            const file = await getSettingsFile();

            if (!file) {
                this.qsfData = undefined;
                this.refresh();
                return;
            }

            this.qsfData = await parseQsf(file);
            this.refresh();
        } 
        finally 
        {
            this.loading = false;
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {

        if (this.loading) {
            return [new vscode.TreeItem("Loading QSF...")];
        }

        if (!this.qsfData) {
            return [new vscode.TreeItem("No QSF loaded")];
        }

        if (!element) {

            const items: vscode.TreeItem[] = [];

            if (this.qsfData.family) {
                const familyItem = new vscode.TreeItem("FAMILY");
                familyItem.description = this.qsfData.family;
                familyItem.iconPath = new vscode.ThemeIcon("chip");
                items.push(familyItem);
            }

            if (this.qsfData.device) {
                const deviceItem = new vscode.TreeItem("DEVICE");
                deviceItem.description = this.qsfData.device;
                deviceItem.iconPath = new vscode.ThemeIcon("circuit-board");
                items.push(deviceItem);
            }

            if (this.qsfData.topLevel) {
                const deviceItem = new vscode.TreeItem("TOP LEVEL");
                deviceItem.description = this.qsfData.topLevel.entity;
                deviceItem.iconPath = new vscode.ThemeIcon("home");
                deviceItem.command = {
                    command: "vscode.open",
                    title: "Open File",
                    arguments: [this.qsfData.topLevel.path]
                };
                items.push(deviceItem);
            }

            if (this.qsfData.outputFolder) {
                const deviceItem = new vscode.TreeItem("OUTPUT DIR");
                deviceItem.description = this.qsfData.outputFolder;
                deviceItem.iconPath = new vscode.ThemeIcon("rocket");
                items.push(deviceItem);
            }

            const questaSimScripts = new vscode.TreeItem(
                "Questasim scripts",
                vscode.TreeItemCollapsibleState.Expanded
            );
            questaSimScripts.iconPath = new vscode.ThemeIcon("beaker");
            
            items.push(questaSimScripts);
            
            const pinHeader = new vscode.TreeItem(
                "PIN ASSIGNMENTS",
                vscode.TreeItemCollapsibleState.Expanded
            );
            pinHeader.iconPath = new vscode.ThemeIcon("pin");

            items.push(pinHeader);

            return items;
        }

        if (element.label === "Pin Assignments") 
        {
            return this.qsfData.pins.map((p: any) => {
                const item = new vscode.TreeItem(p.signal);
                item.description = p.pin;
                return item;
            });
        }

        if (element.label === "Questasim scripts") 
        {
            return this.questaFiles.map((uri: vscode.Uri) => {

                const relativePath = vscode.workspace.asRelativePath(uri);

                const item = new vscode.TreeItem(
                    relativePath,
                    vscode.TreeItemCollapsibleState.None
                );

                item.resourceUri = uri;

                item.command = {
                    command: "vscode.open",
                    title: "Open File",
                    arguments: [uri]
                };

                return item;
            });
        }

        return [];
    }
}