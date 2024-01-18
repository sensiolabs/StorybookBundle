import { exec } from 'child_process';
import dedent from 'ts-dedent';
import * as path from 'path';

type CommandOptions = {
    /**
     * Path to the PHP binary used to execute the command.
     */
    php?: string;

    /**
     * Path to the Symfony Console entrypoint.
     */
    script?: string;
};

const defaultOptions: CommandOptions = {
    php: 'php',
    script: 'bin/console',
};

/**
 * Run a Symfony command.
 */
export const runSymfonyCommand = async (command: string, inputs: string[] = [], options: CommandOptions = {}) => {
    const finalOptions = {
        ...defaultOptions,
        ...options,
    };

    const finalCommand = [finalOptions.php, finalOptions.script, command]
        .concat(inputs)
        .map((part) => `'${part}'`)
        .join(' ');

    return new Promise<string>((resolve, reject) => {
        exec(finalCommand, (error, stdout, stderr) => {
            if (error) {
                reject(
                    new Error(dedent`
                    Symfony console failed with exit status ${error.code}:
                    CMD: ${error.cmd}
                    Output: ${stdout}
                    Error output: ${stderr}
                `)
                );
            }

            resolve(stdout);
        });
    });
};

/**
 * Run a Symfony command with JSON formatted output and get the result as a JS object.
 */
export const runSymfonyCommandJson = async <T = any>(
    command: string,
    inputs: string[] = [],
    options: CommandOptions = {}
): Promise<T> => {
    const result = await runSymfonyCommand(command, [...inputs, '--format=json'], options);
    return JSON.parse(result);
};

export const getKernelProjectDir = async () => {
    return (
        await runSymfonyCommandJson<{ [p: string]: string }>('debug:container', ['--parameter=kernel.project_dir'])
    )['kernel.project_dir'];
};

type SymfonyTwigComponentConfiguration = {
    twig_component: {
        anonymous_template_directory: string;
        defaults: {
            [p: string]: {
                name_prefix: string;
                template_directory: string;
            };
        };
    };
};

export const getTwigComponentConfiguration = async () => {
    return (
        await runSymfonyCommandJson<SymfonyTwigComponentConfiguration>('debug:config', [
            'twig_component',
            '--resolve-env',
        ])
    )['twig_component'];
};

export type TwigComponentConfiguration = {
    anonymousTemplateDirectory: string;
    namespaces: {
        [p: string]: string;
    };
};

/**
 * Attempt to resolve the Twig template path containing sources for the given TwigComponent.
 */
export function resolveTwigComponentFile(componentName: string, config: TwigComponentConfiguration) {
    const nameParts = componentName.split(':');
    const dirParts = nameParts.slice(0, -1);
    const filename = `${nameParts.slice(-1)}.html.twig`;

    const lookupPaths: string[] = [];

    for (const namespace in config.namespaces) {
        if ('' !== namespace && 0 === componentName.indexOf(namespace)) {
            lookupPaths.push(path.join(config.namespaces[namespace], dirParts.slice(1).join('/')));
            break;
        }
    }

    if (config.namespaces[''] !== undefined) {
        lookupPaths.push(path.join(config.namespaces[''], dirParts.join('/')));
    }

    lookupPaths.push(path.join(config.anonymousTemplateDirectory, dirParts.join('/')));

    try {
        return require.resolve(`./${filename}`, { paths: lookupPaths });
    } catch (err) {
        throw new Error(dedent`Unable to find template file for component "${componentName}": ${err}`);
    }
}
