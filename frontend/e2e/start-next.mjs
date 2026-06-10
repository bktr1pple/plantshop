import { spawn } from 'node:child_process';
import path from 'node:path';

const frontendPort = process.env.FRONTEND_PORT ?? '3200';
const nextCli = path.join(
  process.cwd(),
  'node_modules',
  'next',
  'dist',
  'bin',
  'next',
);

function runNext(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextCli, ...args], {
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `next ${args.join(' ')} exited with ${signal ?? `code ${code ?? 1}`}`,
        ),
      );
    });
  });
}

try {
  await runNext(['build']);
} catch (error) {
  console.error(error);
  process.exit(1);
}

const server = spawn(process.execPath, [nextCli, 'start', '-p', frontendPort], {
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
});

let isShuttingDown = false;
const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  server.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal) {
    process.exit(0);
  }

  process.exit(code ?? 0);
});
