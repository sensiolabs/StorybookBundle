import { defineConfig } from 'vitest/config';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        root: __dirname,
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});
