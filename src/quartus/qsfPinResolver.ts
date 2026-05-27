import * as vscode from 'vscode';

import { parseQsf } from '../parsers/qsfParser';
import { PinAssignment } from '../types/types';
import { getSettingsFile } from './quartusProject';

export async function resolvePin( signalName: string, doc: vscode.Uri ): Promise<PinAssignment | null> 
{
    const qsfFile = await getSettingsFile();
    if (!qsfFile) { return null; }

    const qsf = await parseQsf(qsfFile);
    const pin = qsf.pins.find( p => p.signal.toLowerCase() === signalName.toLowerCase() );

    if (doc.path !== qsf.topLevel?.path.path) {return null;}

    if (!pin) { return null; }

    return {
        signal: pin.signal,
        pin: pin.pin,
        location: pin.location
    };
}