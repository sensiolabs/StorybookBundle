import fs from 'node:fs';

class SymfonyPreviewRenderingError extends Error {
    constructor(public readonly errorPage: string) {
        super('Unable to render preview.');
    }
}

export const generateSymfonyPreview = async (server: string) => {
    const fetchUrl = new URL(`${server}/_storybook/preview`);

    const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            Accept: 'text/html',
        },
    });

    const html = await response.text();

    if (!response.ok) {
        throw new SymfonyPreviewRenderingError(html);
    }

    return html;
};

type SymfonyConfiguration = {
    twig_config: SymfonyTwigConfiguration;
    twig_component_config: SymfonyTwigComponentConfiguration;
};

export const getSymfonyConfig = async (storybookCachePath: string): Promise<SymfonyConfiguration> => {
    const filePath = `${storybookCachePath}/symfony_parameters.json`;

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

type SymfonyTwigComponentConfiguration = {
    anonymous_template_directory: string;
    defaults: {
        [p: string]: {
            name_prefix: string;
            template_directory: string;
        };
    };
};

export type TwigComponentConfiguration = {
    anonymousTemplateDirectory: string[];
    namespaces: {
        [p: string]: string[];
    };
};

type SymfonyTwigConfiguration = {
    default_path: string;
    paths: {
        [p: string]: string;
    };
};

export type TwigConfiguration = {
    paths: string[];
};
