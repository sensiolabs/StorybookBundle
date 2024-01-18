import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        root: __dirname,
        globals: true,
        environment: 'jsdom',
        coverage: {
            reporter: ['text', 'html'],
        },
    }
});
