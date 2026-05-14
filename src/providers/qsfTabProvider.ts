import * as vscode from 'vscode';
import { getSettingsFile } from '../quartus/quartusProject';
import { parseQsf } from '../lint/qsfParser';
export class QsfProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private qsfData: any = null;
    private loading = false;

    async loadData() {
        if (this.loading) {return;} // 🔥 evita re-entry
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
        } finally {
            this.loading = false;
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.TreeItem[] {

        if (this.loading) {
            return [new vscode.TreeItem("Loading QSF...")];
        }

        if (!this.qsfData) {
            return [new vscode.TreeItem("No QSF loaded")];
        }
        
        const items: vscode.TreeItem[] = [];

        if (this.qsfData.family) {
            items.push(new vscode.TreeItem(`FAMILY: ${this.qsfData.family}`));
        }

        if (this.qsfData.device) {
            items.push(new vscode.TreeItem(`DEVICE: ${this.qsfData.device}`));
        }

        const pinHeader = new vscode.TreeItem("PIN ASSIGNMENTS");
        pinHeader.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        items.push(pinHeader);

        for (const p of this.qsfData.pins) {
            items.push(new vscode.TreeItem(`${p.signal} → ${p.pin}`));
        }

        return items;
    }
}