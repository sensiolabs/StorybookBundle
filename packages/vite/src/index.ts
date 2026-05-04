import '../../shared/src/client/globals';
export * from '../../shared/src/public-types';
export * from '../../shared/src/client/index';
export { twig } from '../../shared/src/lib/twig';
export { render, renderToCanvas } from '../../shared/src/client/render';
export type { SymfonyOptions, FrameworkOptions, StorybookConfig } from './types';

export const parameters = {
    renderer: 'symfony' as const,
    symfony: {},
};
