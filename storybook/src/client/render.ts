import { global } from '@storybook/global';

import { dedent } from 'ts-dedent';
import type { ArgsStoryFn, RenderContext } from '@storybook/types';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';
import type { Args, ArgTypes } from './public-types';
import type { FetchStoryHtmlType, SymfonyRenderer } from './types';
import { twig } from '../lib/twig';

const { fetch, Node } = global;

const fetchStoryHtml: FetchStoryHtmlType = async (url, path, params, storyContext, template) => {
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

const createComponent = (name: string, args: Args) => {
    const argsString = Object.entries(args)
        .map(([name, value]) => {
            if (value._sfActionId !== undefined) {
                return `:data-storybook-action="args['${name}']"`;
            }
            return `:${name}="args['${name}']"`;
        })
        .join(' ');

    return twig`
        <twig:${name} ${argsString} />
    `;
};

export const render: ArgsStoryFn<SymfonyRenderer> = (args, context) => {
    const { id, component } = context;

    if (typeof component === 'string') {
        return {
            template: twig(component),
        };
    }

    if (typeof component === 'object') {
        if ('getSource' in component && typeof component.getSource === 'function') {
            return {
                template: component,
            };
        } else if ('name' in component) {
            return {
                template: createComponent(component.name, args),
                components: [component],
            };
        }
    }

    if (typeof component === 'function') {
        return component(args, context);
    }

    console.log(component);
    console.warn(dedent`
    Symfony renderer only supports rendering Twig templates. Either:
    - Create a "render" function in your story export
    - Set the "component" story's property to a string or a template created with the "twig" helper

    Received: ${component}
    `);

    throw new Error(`Unable to render story ${id}`);
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
    const { template } = storyFn();

    const storyArgs = buildStoryArgs(args, argTypes);

    const {
        symfony: { id: storyId, params },
    } = parameters;

    const url = `${window.location.origin}/_storybook/render`;
    const fetchId = storyId || id;
    const storyParams = { ...params, ...storyArgs };
    const element = await fetchStoryHtml(url, fetchId, storyParams, storyContext, template);

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
