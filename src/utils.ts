import * as cp from 'child_process';
import Clubhouse from 'clubhouse-lib';

export interface ExecResult {
    error: Error | null;
    stdout: string;
    stderr: string;
}

export function exec(command: string, options: cp.ExecOptions) {
    return new Promise<ExecResult>((resolve, reject) => {
        cp.exec(command, options, (error, stdout, stderr) => {
            (error || stderr ? reject: resolve)({ error, stdout, stderr });
        });
    });
}

export function sleep(millis: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, millis);
    });
}

export async function fetchAll(clubhouse: any, first: Promise<any>) {
    const all = [];

    let res = await first;
    all.push(...res.data.items);

}