import type { ArgTypesEnhancer, DecoratorFunction } from '@storybook/types';
import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';

import { sourceDecorator } from './addons/docs/sourceDecorator';
import type { ServerRenderer } from '@storybook/server';

export const decorators: DecoratorFunction<ServerRenderer>[] = [sourceDecorator];

export const parameters = {
    docs: {
        story: { inline: true },
        source: {
            type: SourceType.DYNAMIC,
            language: 'html',
            code: undefined,
            excludeDecorators: undefined,
        },
    },
};

export const argTypesEnhancers: ArgTypesEnhancer[] = [enhanceArgTypes];
