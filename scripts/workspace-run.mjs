import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const script = process.argv[2];

if (!script) {
    console.error('Usage: node scripts/workspace-run.mjs <script>');
    process.exit(1);
}

const userAgent = process.env.npm_config_user_agent || '';
const packageManager = userAgent.startsWith('bun/')
    ? 'bun'
    : userAgent.startsWith('yarn/')
      ? 'yarn'
      : userAgent.startsWith('pnpm/')
        ? 'pnpm'
        : 'npm';

const command = packageManager;
const args = ['run', script];
const packages = ['packages/shared', 'packages/vite', 'packages/webpack'];

for (const packagePath of packages) {
    if (!existsSync(join(packagePath, 'package.json'))) {
        continue;
    }

    console.log(`\n> ${packageManager} ${script} (${packagePath})`);
    const result = spawnSync(command, args, {
        cwd: packagePath,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}
