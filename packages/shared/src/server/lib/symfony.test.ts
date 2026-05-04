import { execFile, ExecFileException } from 'child_process';
import { runSymfonyCommand, runSymfonyCommandJson } from './symfony';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    execFile: vi.fn(),
}));

vi.mock('child_process', () => ({
    execFile: mocks.execFile,
    default: {
        execFile: mocks.execFile,
    },
}));

function mockExecFile(error: ExecFileException | null = null, stdout = '', stderr = '') {
    // Vitest mock types don't support signature overload?
    // @ts-ignore
    vi.mocked(execFile).mockImplementation((file: string, args: string[], callback: (...args) => void) => {
        callback(error, stdout, stderr);
        return {};
    });
}

describe('Symfony utils', () => {
    beforeEach(() => {
        vi.mocked(execFile).mockReset();
    });
    describe('runSymfonyCommand', () => {
        it('uses default options', async () => {
            mockExecFile();

            await runSymfonyCommand('command');

            expect(execFile).toHaveBeenCalledWith('php', ['bin/console', 'command', '-v'], expect.any(Function));
        });

        it('with custom options', async () => {
            mockExecFile();

            const options = {
                php: '/usr/bin/php',
                script: 'custom/bin/console',
            };

            await expect(runSymfonyCommand('command', [], options)).resolves.toBe('');

            expect(execFile).toHaveBeenCalledWith(
                '/usr/bin/php',
                ['custom/bin/console', 'command', '-v'],
                expect.any(Function)
            );
        });

        it('rejects on exec failure', async () => {
            mockExecFile({ code: 1, cmd: 'php bin/console command' } as ExecFileException, '');

            await expect(runSymfonyCommand('command')).rejects.toThrow();

            expect(execFile).toHaveBeenCalledWith('php', ['bin/console', 'command', '-v'], expect.any(Function));
        });

        it('accepts input arguments and options', async () => {
            mockExecFile();

            await runSymfonyCommand('command', ['arg1', '-o', '--option=foo']);

            expect(execFile).toHaveBeenCalledWith(
                'php',
                ['bin/console', 'command', 'arg1', '-o', '--option=foo', '-v'],
                expect.any(Function)
            );
        });
    });

    describe('runSymfonyCommandJSON', () => {
        it('returns a JS object', async () => {
            mockExecFile(null, '{ "prop": "value" }');

            const expected = {
                prop: 'value',
            };

            await expect(runSymfonyCommandJson('command')).resolves.toEqual(expected);
        });
    });
});
