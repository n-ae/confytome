/**
 * Minimal cross-platform clipboard write, no third-party dependencies.
 * Shells out to the OS-native clipboard tool and pipes text via stdin.
 */

import { spawn } from 'node:child_process';

function copyVia(command, args, text) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
      }
    });
    child.stdin.end(text);
  });
}

export async function writeClipboard(text) {
  switch (process.platform) {
  case 'darwin':
    return copyVia('pbcopy', [], text);
  case 'win32':
    return copyVia('clip', [], text);
  default:
    try {
      return await copyVia('xclip', ['-selection', 'clipboard'], text);
    } catch (xclipError) {
      try {
        return await copyVia('xsel', ['--clipboard', '--input'], text);
      } catch {
        throw xclipError;
      }
    }
  }
}
