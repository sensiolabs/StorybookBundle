/* eslint-disable no-underscore-dangle */

import { SNIPPET_RENDERED, SourceType } from '@storybook/docs-tools';
import { addons, useEffect } from '@storybook/preview-api';
import type { DecoratorFunction } from '@storybook/types';

import { buildVariableDeclarations } from './buildVariableDeclarations';
import { sanitize } from './sourceSanitizer';
import { SymfonyRenderer } from '../../types';

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

    let source: string;
    if (!skipSourceRender(context)) {
        source = story.template.getSource();
    }

    useEffect(() => {
        const { id, unmappedArgs } = context;
        if (source) {
            source = sanitize(source);

            // If there is a setup function we should call it to resolve real args
            const args = setup ? setup() : unmappedArgs;

            const preamble = buildVariableDeclarations(args);

            source = `${preamble}\n\n${source}`;
            addons.getChannel().emit(SNIPPET_RENDERED, { id, args: unmappedArgs, source: source });
        }
    });

    return story;
};
