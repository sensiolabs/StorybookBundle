'use strict';

import { exec, ChildProcess, ExecException } from 'child_process';
import { resolveTwigComponentFile, runSymfonyCommand, runSymfonyCommandJson } from '../../src/utils/symfony';
import { vi } from 'vitest';

vi.mock('child_process');

function mockExec(error: ExecException = null,  stdout = '', stderr = '')
{
    // Vitest mock types don't support signature overload?
    // @ts-ignore
    vi.mocked(exec).mockImplementation((command: string, callback: (...args) => void) => {
        callback(error, stdout, stderr);
        return new ChildProcess;
    })
}

describe('Symfony utils', () => {
    beforeEach(() => {
       vi.mocked(exec).mockReset();
    });
    describe('runSymfonyCommand', () => {
        it('uses default options', async () => {
            mockExec();

            await runSymfonyCommand('command');

            expect(exec).toHaveBeenCalledWith(`'php' 'bin/console' 'command'`, expect.any(Function));
        });

        it('with custom options', async () => {
            mockExec();

            const options = {
                php: '/usr/bin/php',
                script: 'custom/bin/console'
            };

            await expect(runSymfonyCommand('command', [], options)).resolves.toBe('');

            expect(exec).toHaveBeenCalledWith(`'/usr/bin/php' 'custom/bin/console' 'command'`, expect.any(Function));
        });

        it('rejects on exec failure', async () => {
            mockExec({ code: 1, cmd: `'php' 'bin/console' 'command'` } as ExecException, '');

            await expect(runSymfonyCommand('command')).rejects.toThrow();

            expect(exec).toHaveBeenCalledWith(`'php' 'bin/console' 'command'`, expect.any(Function));
        });

        it('accepts input arguments and options', async () => {
            mockExec();

            await runSymfonyCommand('command', ['arg1', '-o', '--option=foo']);

            expect(exec).toHaveBeenCalledWith(`'php' 'bin/console' 'command' 'arg1' '-o' '--option=foo'`, expect.any(Function));
        });
    });

    describe('runSymfonyCommandJSON', () => {
        it('returns a JS object', async () => {
            mockExec(null, `{ "prop": "value" }`);

            const expected = {
                prop: 'value'
            };

            await expect(runSymfonyCommandJson('command')).resolves.toEqual(expected);
        })
    });

    describe('resolveTwigComponentFile', () => {
        const fixturesDir = `${__dirname}/__fixtures__`;

        const twigComponentConfig = {
            anonymousTemplateDirectory: `${fixturesDir}/anonymous`,
            namespaces: {
                '': `${fixturesDir}/components`,
                'Custom': `${fixturesDir}/custom`
            }
        };

        it('resolves component path without namespace', () => {
            const resolved = resolveTwigComponentFile('Component', twigComponentConfig);

            expect(resolved).toEqual(`${fixturesDir}/components/Component.html.twig`);
        });
        it('resolves component with auto namespace', () => {
            const resolved = resolveTwigComponentFile('Namespace:AutoNamespace', twigComponentConfig);

            expect(resolved).toEqual(`${fixturesDir}/components/Namespace/AutoNamespace.html.twig`);
        });
        it('resolves component with custom namespace', () => {
            const resolved = resolveTwigComponentFile('Custom:CustomNamespace', twigComponentConfig);

            expect(resolved).toEqual(`${fixturesDir}/custom/CustomNamespace.html.twig`);
        });
        it('fallbacks to default namespace', () => {
            const resolved = resolveTwigComponentFile('Custom:NotInCustomNamespace', twigComponentConfig);

            expect(resolved).toEqual(`${fixturesDir}/components/Custom/NotInCustomNamespace.html.twig`);
        });
        it('fallbacks to anonymous component', () => {
            const resolved = resolveTwigComponentFile('Anonymous', twigComponentConfig);

            expect(resolved).toEqual(`${fixturesDir}/anonymous/Anonymous.html.twig`);
        });
    });
});
