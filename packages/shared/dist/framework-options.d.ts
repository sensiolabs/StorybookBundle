import { TwigComponentConfiguration } from './lib/symfony.js';

type SymfonyOptions = {
    additionalWatchPaths?: string[];
};
type BuildOptions = {
    twigComponent: TwigComponentConfiguration;
    runtimeDir: string;
    projectDir: string;
    additionalWatchPaths: string[];
};
declare const getBuildOptions: (symfonyOptions: SymfonyOptions) => Promise<BuildOptions>;

export { type BuildOptions, getBuildOptions };
