import { ArgTypesEnhancer, DecoratorFunction } from 'storybook/internal/types';
import { SourceType } from 'storybook/internal/docs-tools';
import { S as SymfonyRenderer } from './types-CmOsuV20.js';

declare const decorators: DecoratorFunction<SymfonyRenderer>[];
declare const parameters: {
    docs: {
        story: {
            inline: boolean;
        };
        source: {
            type: SourceType;
            language: string;
            code: undefined;
            excludeDecorators: undefined;
        };
    };
};
declare const argTypesEnhancers: ArgTypesEnhancer[];

export { argTypesEnhancers, decorators, parameters };
