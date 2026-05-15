import * as vscode from 'vscode';
import { getSettingsFile } from '../quartus/quartusProject';
import { parseQsf } from '../lint/qsfParser';
export class QsfProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private qsfData: any = null;
    private loading = false;

    async loadData() {
        if (this.loading) {return;}
        this.loading = true;

        try {
            const file = await getSettingsFile();

            if (!file) {
                this.qsfData = null;
                this.refresh();
                return;
            }

            this.qsfData = await parseQsf(file);
            this.refresh();
        } 
        finally {
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

            const pinHeader = new vscode.TreeItem(
                "PIN ASSIGNMENTS",
                vscode.TreeItemCollapsibleState.Expanded
            );

            items.push(pinHeader);

            return items;
        }

        if (element.label === "PIN ASSIGNMENTS") 
        {
            return this.qsfData.pins.map((p: any) => {
                const item = new vscode.TreeItem(p.pin);
                item.description = p.signal;
                return item;
            });
        }

        return [];
    }
}