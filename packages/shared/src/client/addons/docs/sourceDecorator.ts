import { SNIPPET_RENDERED, SourceType } from 'storybook/internal/docs-tools';
import { logger } from 'storybook/internal/client-logger';
import { addons, useEffect } from 'storybook/preview-api';
import type { DecoratorFunction } from 'storybook/internal/types';

import { buildVariableDeclarations } from './buildVariableDeclarations';
import { sanitize } from './sourceSanitizer';
import type { SymfonyRenderer } from '../../types';

function skipSourceRender(context: Parameters<DecoratorFunction<SymfonyRenderer>>[1]) {
    const sourceParams = context?.parameters.docs?.source;
    const isArgsStory = context?.parameters.__isArgsStory;

    // always render if the user forces it
    if (sourceParams?.type === SourceType.DYNAMIC) {
        return false;
    }

    // never render if the user is forcing the block to render code, or
    // if the user provides code, or if it's not an args story.
    return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}

export const sourceDecorator: DecoratorFunction<SymfonyRenderer> = (storyFn, context) => {
    const story = storyFn();
    const setup = story.setup;

    let source: string | undefined;
    if (!skipSourceRender(context)) {
        source = story.template.getSource();
    }

    useEffect(() => {
        const { id, unmappedArgs } = context;
        if (source) {
            // If there is a setup function we should call it to resolve real args
            const args = setup ? setup() : unmappedArgs;
            const preamble = buildVariableDeclarations(args);
            let sanitizedSource = source;
            try {
                sanitizedSource = sanitize(source);
            } catch (err) {
                logger.warn(`Failed to sanitize Symfony story source. Falling back to the raw source. ERR: ${err}`);
            }

            const renderedSource = `${preamble}\n\n${sanitizedSource}`;

            addons.getChannel().emit(SNIPPET_RENDERED, { id, args: unmappedArgs, source: renderedSource });
        }
    });

    return story;
};
