import * as vscode from 'vscode';
import { TopLevelPortLint } from '../lint/portLint';
import { DuplicateSignalLinter } from '../lint/duplicateSignalsLint';
import { QsfLint } from '../lint/qsfLint';

export function registerLintFeature(context: vscode.ExtensionContext)
{
    const topLevelPortLint = new TopLevelPortLint(context);
    const duplicateLint = new DuplicateSignalLinter(context);
    const qsfLint = new QsfLint(context);

    context.subscriptions.push(
        topLevelPortLint,
        duplicateLint,
        qsfLint
    );

}