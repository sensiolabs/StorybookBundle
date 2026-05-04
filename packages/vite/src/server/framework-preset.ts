import { SymfonyOptions } from '../types';
import { TwigLoaderPlugin } from '@sensiolabs/storybook-symfony-shared/server/lib/twig-loader-plugin';
import { PresetProperty } from 'storybook/internal/types';
import { dedent } from 'ts-dedent';
import { runSymfonyCommand } from '@sensiolabs/storybook-symfony-shared/server/lib/symfony';
import { injectPreviewHtml } from '@sensiolabs/storybook-symfony-shared/server/lib/injectPreviewHtml';
import { computeAdditionalWatchPaths } from '@sensiolabs/storybook-symfony-shared/server/lib/computeAdditionalWatchPaths';
import { BuildOptions, getBuildOptions } from '@sensiolabs/storybook-symfony-shared/server/framework-options';
import { logger } from 'storybook/internal/node-logger';
import { sep } from 'node:path';
import type { Plugin, UserConfig } from 'vite';

const createProxyConfig = (symfonyOptions: SymfonyOptions, configType?: string) => {
    if (!symfonyOptions.server) {
        logger.warn(dedent`
        Symfony server proxy is disabled because "framework.options.symfony.server" is not configured.
        `);

        return {};
    }

    const proxyPaths = ['/_storybook/render'];

    if (symfonyOptions.proxyPaths) {
        proxyPaths.push(
            ...(Array.isArray(symfonyOptions.proxyPaths) ? symfonyOptions.proxyPaths : [symfonyOptions.proxyPaths])
        );
    }

    return Object.fromEntries(
        proxyPaths.map((path) => [
            path,
            {
                target: symfonyOptions.server,
                changeOrigin: true,
                secure: configType === 'PRODUCTION',
                headers: {
                    'X-Storybook-Proxy': 'true',
                },
            },
        ])
    );
};

const SymfonyPreviewPlugin = (options: BuildOptions): Plugin => {
    let previewHtml = '';
    let previewHtmlFetched = false;

    const refreshPreviewHtml = async () => {
        previewHtml = await runSymfonyCommand('storybook:generate-preview');
        previewHtmlFetched = true;
    };

    return {
        name: 'storybook-symfony-preview',
        async buildStart() {
            await refreshPreviewHtml();
        },
        configureServer(server) {
            const resolvedWatchPaths = computeAdditionalWatchPaths(options.additionalWatchPaths, options.projectDir);
            const watchPaths = [...resolvedWatchPaths.dirs, ...resolvedWatchPaths.files];
            server.watcher.add(watchPaths);
            server.watcher.on('change', async (path) => {
                const watchedFileChanged = resolvedWatchPaths.files.includes(path);
                const watchedDirChanged = resolvedWatchPaths.dirs.some(
                    (watchPath) => path === watchPath || path.startsWith(`${watchPath}${sep}`)
                );

                if (!watchedFileChanged && !watchedDirChanged) {
                    return;
                }

                try {
                    await refreshPreviewHtml();
                    server.ws.send({ type: 'full-reload' });
                } catch (err) {
                    logger.error(dedent`
                    Failed to regenerate Symfony preview template.
                    ERR: ${err}
                    `);
                }
            });
        },
        async transformIndexHtml(html) {
            try {
                const hasPreviewHeadPlaceholder = html.includes('<!--PREVIEW_HEAD_PLACEHOLDER-->');
                const hasPreviewBodyPlaceholder = html.includes('<!--PREVIEW_BODY_PLACEHOLDER-->');
                if (!hasPreviewHeadPlaceholder && !hasPreviewBodyPlaceholder) {
                    return html;
                }

                if (!previewHtmlFetched) {
                    await refreshPreviewHtml();
                }

                return injectPreviewHtml(previewHtml, html);
            } catch (err) {
                logger.error(dedent`
                Failed to inject Symfony preview template in main iframe.html.
                ERR: ${err}
                `);

                return html;
            }
        },
    };
};

export const viteFinal = async (config: UserConfig, options: any): Promise<UserConfig> => {
    const framework = await options.presets.apply('framework');

    const frameworkOptions = typeof framework === 'string' ? {} : framework.options;

    // This options resolution should be done right before creating the build configuration (i.e. not in options presets).
    const symfonyOptions = await getBuildOptions(frameworkOptions.symfony || {});

    return {
        ...config,
        server: {
            ...config.server,
            proxy: {
                ...config.server?.proxy,
                ...createProxyConfig(frameworkOptions.symfony || {}, options.configType),
            },
        },
        plugins: [
            ...(config.plugins || []),
            SymfonyPreviewPlugin(symfonyOptions),
            TwigLoaderPlugin.vite({
                twigComponentConfiguration: symfonyOptions.twigComponent,
            }),
        ],
    };
};

export const previewHead: PresetProperty<'previewHead'> = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_HEAD_PLACEHOLDER-->
    `;

export const previewBody: PresetProperty<'previewBody'> = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_BODY_PLACEHOLDER-->
    `;
