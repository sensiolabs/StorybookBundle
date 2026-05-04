import { fileURLToPath } from 'node:url';
import type { PresetProperty, Entry } from 'storybook/internal/types';

const resolveLocalFile = (path: string) => fileURLToPath(import.meta.resolve(path));

export const addons: PresetProperty<'addons'> = [resolveLocalFile('./server/framework-preset.js')];

export const core: PresetProperty<'core'> = async (config, options) => {
    const framework = await options.presets.apply('framework');

    return {
        ...config,
        builder: {
            name: resolveLocalFile('./builders/webpack-builder.js'),
            options: typeof framework === 'string' ? {} : framework.options.builder || {},
        },
    };
};

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (entry: Entry[] = [], options) => {
    const docsEnabled = Object.keys(await options.presets.apply('docs', {}, options)).length > 0;

    return entry
        .concat(resolveLocalFile('./entry-preview.js'))
        .concat(docsEnabled ? [resolveLocalFile('./entry-preview-docs.js')] : []);
};
