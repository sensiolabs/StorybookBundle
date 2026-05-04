import { resolve } from 'path';
import {
    getBundleConfig,
    getKernelProjectDir,
    getTwigComponentConfiguration,
    getTwigConfiguration,
    TwigComponentConfiguration,
} from './lib/symfony';

type SymfonyOptions = {
    additionalWatchPaths?: string[];
};

export type BuildOptions = {
    twigComponent: TwigComponentConfiguration;
    runtimeDir: string;
    projectDir: string;
    additionalWatchPaths: string[];
};

export const getBuildOptions = async (symfonyOptions: SymfonyOptions): Promise<BuildOptions> => {
    const projectDir = await getKernelProjectDir();
    const twigComponentsConfig = await getTwigComponentConfiguration();
    const twigConfig = await getTwigConfiguration();

    const componentNamespaces: { [p: string]: string[] } = {};

    const twigPaths: string[] = Object.keys(twigConfig.paths).map((key) => resolve(projectDir, key));

    if (twigPaths.length === 0) {
        twigPaths.push(`${projectDir}/templates/`);
    }

    for (const { name_prefix: namePrefix, template_directory: templateDirectory } of Object.values(
        twigComponentsConfig.defaults || {}
    )) {
        componentNamespaces[namePrefix] = twigPaths.map((twigPath) => resolve(twigPath, templateDirectory));
    }

    const anonymousNamespace: string[] = twigPaths.map((twigPath) =>
        resolve(twigPath, twigComponentsConfig['anonymous_template_directory'])
    );

    const runtimeDir = (await getBundleConfig()).runtime_dir;

    return {
        twigComponent: {
            anonymousTemplateDirectory: anonymousNamespace,
            namespaces: componentNamespaces,
        },
        runtimeDir,
        projectDir,
        additionalWatchPaths: symfonyOptions.additionalWatchPaths || [],
    };
};
