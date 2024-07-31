import { TwigComponentConfiguration } from './symfony';
import path from 'path';
import dedent from 'ts-dedent';

export class TwigComponentResolver {
    constructor(private config: TwigComponentConfiguration) {}

    resolveNameFromFile(file: string) {
        const stripDirectory = (file: string, dir: string) => {
            return file.replace(dir, '').replace(/^\//, '').replaceAll('/', ':').replace('.html.twig', '');
        };

        for (const [namespace, twigDirectories] of Object.entries(this.config.namespaces)) {
            const matchingDirectory = twigDirectories.find((dir) => file.startsWith(dir));
            if (matchingDirectory) {
                const trimmedPath = stripDirectory(file, matchingDirectory);
                return namespace ? `${namespace}:${trimmedPath}` : trimmedPath;
            }
        }

        for (const anonymousDir of this.config.anonymousTemplateDirectory) {
            if (file.startsWith(anonymousDir)) {
                return stripDirectory(file, anonymousDir);
            }
        }

        throw new Error(dedent`Unable to determine template name for file "${file}":`);
    }

    resolveFileFromName(name: string) {
        const nameParts = name.split(':');
        const namespace = nameParts.length > 1 ? nameParts[0] : '';
        const dirParts = nameParts.slice(0, -1);
        const filename = `${nameParts.slice(-1)}.html.twig`;

        const lookupPaths: string[] = [];

        if (namespace && this.config.namespaces[namespace]) {
            const namespacePaths = this.config.namespaces[namespace];
            if (namespacePaths.length > 0) {
                lookupPaths.push(path.join(namespacePaths[0], dirParts.slice(1).join('/')));
            }
        }

        if (this.config.namespaces[''] && this.config.namespaces[''].length > 0) {
            lookupPaths.push(path.join(this.config.namespaces[''][0], dirParts.join('/')));
        }

        if (this.config.anonymousTemplateDirectory.length > 0) {
            lookupPaths.push(path.join(this.config.anonymousTemplateDirectory[0], dirParts.join('/')));
        }

        try {
            return require.resolve(`./${filename}`, { paths: lookupPaths });
        } catch (err) {
            throw new Error(dedent`Unable to find template file for component "${name}": ${err}`);
        }
    }
}
