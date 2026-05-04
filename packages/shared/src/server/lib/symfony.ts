import { execFile } from 'child_process';
import type { ExecFileException } from 'child_process';
import { dedent } from 'ts-dedent';

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

const prepareSymfonyCommand = (command: string, inputs: string[] = [], options: CommandOptions = {}) => {
    const finalOptions: Required<CommandOptions> = {
        ...defaultOptions,
        ...options,
    } as Required<CommandOptions>;

    return {
        file: finalOptions.php,
        args: [finalOptions.script, command, ...inputs, '-v'],
    };
};

const execSymfonyCommand = async ({ file, args }: ReturnType<typeof prepareSymfonyCommand>) => {
    return new Promise<string>((resolve, reject) => {
        execFile(file, args, (error: ExecFileException | null, stdout: string, stderr: string) => {
            if (error) {
                return reject(
                    new Error(dedent`
                    Symfony console failed with exit status ${error.code}:
                    CMD: ${[file, ...args].join(' ')}
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
 * Run a Symfony command.
 */
export const runSymfonyCommand = async (command: string, inputs: string[] = [], options: CommandOptions = {}) => {
    const finalCommand = prepareSymfonyCommand(command, inputs, options);

    return execSymfonyCommand(finalCommand);
};

/**
 * Run a Symfony command with JSON formatted output and get the result as a JS object.
 */
export const runSymfonyCommandJson = async <T = any>(
    command: string,
    inputs: string[] = [],
    options: CommandOptions = {}
): Promise<T> => {
    const finalCommand = prepareSymfonyCommand(command, [...inputs, '--format=json'], options);
    const result = await execSymfonyCommand(finalCommand);

    try {
        return JSON.parse(result);
    } catch {
        throw new Error(dedent`
        Failed to process JSON output for Symfony command.
        CMD: ${[finalCommand.file, ...finalCommand.args].join(' ')}
        Raw output: ${result}
        `);
    }
};

export const getKernelProjectDir = async () => {
    const projectDir = (
        await runSymfonyCommandJson<{ [p: string]: string }>('debug:container', ['--parameter=kernel.project_dir'])
    )['kernel.project_dir'];

    if (!projectDir) {
        throw new Error('Missing "kernel.project_dir" in Symfony debug:container output.');
    }

    return projectDir;
};

type StorybookBundleConfig = {
    storybook: {
        runtime_dir: string;
    };
};

export const getBundleConfig = async () => {
    const config = (await runSymfonyCommandJson<StorybookBundleConfig>('debug:config', ['storybook']))['storybook'];
    if (!config) {
        throw new Error('Missing "storybook" in Symfony debug:config output.');
    }

    return config;
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
    const config = (
        await runSymfonyCommandJson<SymfonyTwigComponentConfiguration>('debug:config', [
            'twig_component',
            '--resolve-env',
        ])
    )['twig_component'];

    if (!config) {
        throw new Error('Missing "twig_component" in Symfony debug:config output.');
    }

    return config;
};

export type TwigComponentConfiguration = {
    anonymousTemplateDirectory: string[];
    namespaces: {
        [p: string]: string[];
    };
};

type SymfonyTwigConfiguration = {
    twig: {
        paths: {
            [p: string]: string;
        };
    };
};

export const getTwigConfiguration = async () => {
    const config = (await runSymfonyCommandJson<SymfonyTwigConfiguration>('debug:config', ['twig', '--resolve-env']))[
        'twig'
    ];
    if (!config) {
        throw new Error('Missing "twig" in Symfony debug:config output.');
    }

    return config;
};
