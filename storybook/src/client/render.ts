import { global } from '@storybook/global';

import { dedent } from 'ts-dedent';
import type { RenderContext } from '@storybook/types';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';
import type { Args, ArgTypes } from './public-types';
import type { FetchStoryHtmlType, SymfonyRenderer } from './types';

const { fetch, Node } = global;

const defaultFetchStoryHtml: FetchStoryHtmlType = async (url, path, params, storyContext, template) => {
    const fetchUrl = new URL(`${url}/${path}`);

    // Modify action args to pass action id instead of the handler
    for (const name in params) {
        if (params[name]._sfActionId !== undefined) {
            params[name] = params[name]._sfActionId;
        }
    }

    const body = {
        args: { ...storyContext.globals, ...params },
        template: template.getSource(),
    };

    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    return response.text();
};

const buildStoryArgs = (args: Args, argTypes: ArgTypes) => {
    const storyArgs = { ...args };

    Object.keys(argTypes).forEach((key: string) => {
        const argType = argTypes[key];
        const { control } = argType;
        const controlType = control && control.type.toLowerCase();
        const argValue = storyArgs[key];
        switch (controlType) {
            case 'date':
                // For cross framework & language support we pick a consistent representation of Dates as strings
                storyArgs[key] = new Date(argValue).toISOString();
                break;
            default:
        }
    });

    return storyArgs;
};

export async function renderToCanvas(
    {
        id,
        title,
        name,
        showMain,
        showError,
        forceRemount,
        storyFn,
        storyContext,
        storyContext: { parameters, args, argTypes },
    }: RenderContext<SymfonyRenderer>,
    canvasElement: SymfonyRenderer['canvasElement']
) {
    const { template } = storyFn(storyContext);

    const storyArgs = buildStoryArgs(args, argTypes);

    const {
        server: { url, fetchStoryHtml = defaultFetchStoryHtml, params },
    } = parameters;

    const storyParams = { ...params, ...storyArgs };

    const element = await fetchStoryHtml(url, id, storyParams, storyContext, template);

    showMain();
    if (typeof element === 'string') {
        canvasElement.innerHTML = element;
        simulatePageLoad(canvasElement);
    } else if (element instanceof Node) {
        // Don't re-mount the element if it didn't change and neither did the story
        if (canvasElement.firstChild === element && !forceRemount) {
            return;
        }

        canvasElement.innerHTML = '';
        canvasElement.appendChild(element);
        simulateDOMContentLoaded();
    } else {
        showError({
            title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${title}".`,
            description: dedent`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `,
        });
    }
}
