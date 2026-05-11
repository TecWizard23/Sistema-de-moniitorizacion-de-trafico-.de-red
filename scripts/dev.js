import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendScript = path.join(rootDir, 'backend', 'server.js');
const viteScript = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [];

function startProcess(command, args, label) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`);
      stopAll(code);
    }
  });

  children.push(child);
  return child;
}

function stopAll(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

startProcess(process.execPath, [backendScript], 'backend');
startProcess(process.execPath, [viteScript, '--host', '0.0.0.0'], 'frontend');