import { spawn } from 'child_process';
import dedent from 'ts-dedent';

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
    const finalOptions = {
        ...defaultOptions,
        ...options,
    };

    return [finalOptions.php, finalOptions.script, command]
        .concat([...inputs, '-v'])
        .map((part) => `'${part}'`)
        .join(' ');
};

const execSymfonyCommand = async (
    command: string,
    args: string[]
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { shell: true });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', d => (stdout += d.toString()));
        proc.stderr.on('data', d => (stderr += d.toString()));

        proc.on('close', code => {
            if (code !== 0) {
                reject(
                    new Error(
                        dedent`
            Symfony console failed with exit status ${code}:
            CMD: ${command} ${args.join(' ')}
            Output: ${stdout}
            Error output: ${stderr}
          `
                    )
                );
            } else {
                resolve(stdout);
            }
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
    const args = [
        'bin/console',
        command,
        ...inputs,
        '--format=json',
    ];

    const output = await execSymfonyCommand('php', args);

    try {
        return JSON.parse(output) as T;
    } catch (err) {
        throw new Error(
            dedent`
      Failed to process JSON output for Symfony command.
      CMD: php ${args.join(' ')}
      Raw output: ${output}
    `
        );
    }
};


export const getKernelProjectDir = async () => {
    return (
        await runSymfonyCommandJson<{ [p: string]: string }>('debug:container', ['--parameter=kernel.project_dir'])
    )['kernel.project_dir'];
};

type StorybookBundleConfig = {
    storybook: {
        runtime_dir: string;
    };
};

export const getBundleConfig = async () => {
    return (await runSymfonyCommandJson<StorybookBundleConfig>('debug:config', ['storybook']))['storybook'];
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
    anonymousTemplateDirectory: [string];
    namespaces: {
        [p: string]: [string];
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
    return (await runSymfonyCommandJson<SymfonyTwigConfiguration>('debug:config', ['twig', '--resolve-env']))['twig'];
};

export type TwigConfiguration = {
    paths: string[];
};
