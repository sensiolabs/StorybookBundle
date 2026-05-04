import type { StorybookConfig as StorybookConfigBase } from 'storybook/internal/types';
import type { UserConfig as ViteConfig } from 'vite';

type FrameworkName = '@sensiolabs/storybook-symfony-vite';

type ProxyPaths = string[] | string;

export type SymfonyOptions = {
    /**
     * Symfony server URL.
     */
    server?: string;

    /**
     * Paths to proxy to the Symfony server. This is useful to resolve assets (i.e. with '/assets').
     */
    proxyPaths?: ProxyPaths;

    /**
     * Additional paths to watch during compilation.
     */
    additionalWatchPaths?: string[];
};

export type FrameworkOptions = {
    builder?: Record<string, unknown>;
    symfony: SymfonyOptions;
};

type StorybookConfigFramework = {
    framework:
        | FrameworkName
        | {
              name: FrameworkName;
              options: FrameworkOptions;
          };
    viteFinal?: (config: ViteConfig, options: Record<string, unknown>) => ViteConfig | Promise<ViteConfig>;
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<StorybookConfigBase, keyof StorybookConfigFramework> & StorybookConfigFramework;

export type { ViteConfig };
