import { TwigComponentConfiguration } from './symfony.js';

declare class TwigComponentResolver {
    private config;
    constructor(config: TwigComponentConfiguration);
    resolveNameFromFile(file: string): string;
    resolveFileFromName(name: string): string;
}

export { TwigComponentResolver };
