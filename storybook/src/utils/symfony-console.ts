import { exec } from 'child_process';
import dedent from 'ts-dedent';


type CommandOptions = {
    /**
     * Path to the PHP binary used to execute the command.
     */
    php?: string

    /**
     * Path to the Symfony Console entrypoint.
     */
    script?: string
};

const defaultOptions: CommandOptions = {
    php: 'php',
    script: 'bin/console',
};

export const runSymfonyCommand = async (command: string, inputs: string[] = [], options: CommandOptions = {}) =>
{
    const finalOptions = {
        ...defaultOptions,
        options
    };

    const finalCommand = [finalOptions.php, finalOptions.script, command]
        .concat(inputs)
        .map(part => `'${part}'`)
        .join(' ');

    return new Promise<string>((resolve, reject) => {
        exec(finalCommand, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(dedent`
                    Symfony console failed with exit status ${error.code}:
                    CMD: ${error.cmd}
                    Message: ${stderr}
                `));
            }

            resolve(stdout);
        });
    });
};