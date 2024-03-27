/* eslint-disable no-underscore-dangle */

import { SNIPPET_RENDERED, SourceType } from '@storybook/docs-tools';
import { addons, useEffect } from '@storybook/preview-api';
import type { DecoratorFunction } from '@storybook/types';

import type { ServerRenderer } from '@storybook/server';
import { prependArgsToStorySource } from './prependArgsToStorySource';
import { sanitize } from './sourceSanitizer';


function skipSourceRender(context: Parameters<DecoratorFunction<ServerRenderer>>[1]) {
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

export const sourceDecorator: DecoratorFunction<ServerRenderer> = (storyFn, context) => {
    const story = storyFn();
    let source: string;
    if (!skipSourceRender(context)) {
        source = context?.parameters?.docs?.source?.originalSource;
    }

    useEffect(() => {
        const { id, unmappedArgs } = context;
        if (source) {
            source = sanitize(source, unmappedArgs);
            source = prependArgsToStorySource(source, unmappedArgs);
            addons.getChannel().emit(SNIPPET_RENDERED, { id, args: unmappedArgs, source: source });
        }
    });

    return story;
};
