#!/usr/bin/env node
import { spawn } from 'node:child_process';

const userArgs = process.argv.slice(2);
const normalizedArgs = userArgs.flatMap((arg) => {
  if (arg === '--runInBand') {
    console.warn('[vitest] Ignoring unsupported "--runInBand" flag; use --maxWorkers=1 for single-worker runs.');
    return [];
  }

  return [arg];
});

const vitest = spawn('npx', ['vitest', ...normalizedArgs], {
  stdio: 'inherit',
});

vitest.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
