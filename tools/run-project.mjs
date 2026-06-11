import { spawn } from 'node:child_process';

const mode = process.argv[2];

if (!['dev', 'prod'].includes(mode)) {
  console.error('Usage: node tools/run-project.mjs <dev|prod>');
  process.exit(1);
}

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  console.error('The launcher must be started through an npm script.');
  process.exit(1);
}
const processes =
  mode === 'dev'
    ? [
        { name: 'backend', args: ['--prefix', 'backend', 'run', 'dev'] },
        { name: 'frontend', args: ['--prefix', 'frontend', 'run', 'dev'] },
      ]
    : [
        {
          name: 'backend',
          args: ['--prefix', 'backend', 'run', 'start:prod'],
        },
        { name: 'frontend', args: ['--prefix', 'frontend', 'run', 'start'] },
      ];

const children = new Map();
let shuttingDown = false;

function stopProcessTree(child) {
  if (!child.pid || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return;
  }

  child.kill('SIGTERM');
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children.values()) {
    stopProcessTree(child);
  }

  setTimeout(() => process.exit(exitCode), 250).unref();
}

for (const processConfig of processes) {
  const child = spawn(process.execPath, [npmCliPath, ...processConfig.args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    windowsHide: false,
  });

  children.set(processConfig.name, child);

  child.on('error', (error) => {
    console.error(`[${processConfig.name}] Failed to start: ${error.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    console.error(`[${processConfig.name}] exited with ${reason}.`);
    shutdown(code ?? 1);
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
