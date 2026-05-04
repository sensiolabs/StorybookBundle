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
/**
 * Run a Symfony command.
 */
declare const runSymfonyCommand: (command: string, inputs?: string[], options?: CommandOptions) => Promise<string>;
/**
 * Run a Symfony command with JSON formatted output and get the result as a JS object.
 */
declare const runSymfonyCommandJson: <T = any>(command: string, inputs?: string[], options?: CommandOptions) => Promise<T>;
declare const getKernelProjectDir: () => Promise<string>;
declare const getBundleConfig: () => Promise<{
    runtime_dir: string;
}>;
declare const getTwigComponentConfiguration: () => Promise<{
    anonymous_template_directory: string;
    defaults: {
        [p: string]: {
            name_prefix: string;
            template_directory: string;
        };
    };
}>;
type TwigComponentConfiguration = {
    anonymousTemplateDirectory: string[];
    namespaces: {
        [p: string]: string[];
    };
};
declare const getTwigConfiguration: () => Promise<{
    paths: {
        [p: string]: string;
    };
}>;

export { type TwigComponentConfiguration, getBundleConfig, getKernelProjectDir, getTwigComponentConfiguration, getTwigConfiguration, runSymfonyCommand, runSymfonyCommandJson };
