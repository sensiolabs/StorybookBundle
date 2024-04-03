import { PresetProperty, Entry } from '@storybook/types';

export const addons: PresetProperty<'addons'> = [require.resolve('./server/framework-preset')];

export const core: PresetProperty<'core'> = async (config, options) => {
    const framework = await options.presets.apply('framework');

    return {
        ...config,
        builder: {
            name: require.resolve('./builders/webpack-builder'),
            options: typeof framework === 'string' ? {} : framework.options.builder || {},
        },
    };
};

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (entry: Entry[] = [], options) => {
    const docsEnabled = Object.keys(await options.presets.apply('docs', {}, options)).length > 0;

    return entry
        .concat(require.resolve('./entry-preview'))
        .concat(docsEnabled ? [require.resolve('./entry-preview-docs')] : []);
};
