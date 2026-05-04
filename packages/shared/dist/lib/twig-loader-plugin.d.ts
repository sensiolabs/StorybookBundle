import * as unplugin from 'unplugin';
import { TwigComponentConfiguration } from './symfony.js';

type Options = {
    twigComponentConfiguration: TwigComponentConfiguration;
};
/**
 * Twig template source loader.
 *
 * Generates JS modules to export raw template source and imports required components.
 */
declare const TwigLoaderPlugin: unplugin.UnpluginInstance<Options, boolean>;

export { type Options, TwigLoaderPlugin };
