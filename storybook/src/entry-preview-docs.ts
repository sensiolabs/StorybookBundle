import type { ArgTypesEnhancer, DecoratorFunction } from '@storybook/types';
import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';

import { sourceDecorator } from './client/addons/docs/sourceDecorator';
import { SymfonyRenderer } from './client';

export const decorators: DecoratorFunction<SymfonyRenderer>[] = [sourceDecorator];

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
