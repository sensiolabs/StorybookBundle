import { global } from '@storybook/global';
import { logger } from '@storybook/client-logger';
import { dedent } from 'ts-dedent';
import type { ArgsStoryFn, RenderContext, StoryId } from '@storybook/types';
import { simulatePageLoad, simulateDOMContentLoaded, addons } from '@storybook/preview-api';
import { STORY_ERRORED, STORY_RENDER_PHASE_CHANGED } from '@storybook/core-events';
import type { FetchStoryHtmlType, SymfonyRenderer } from './types';
import { twig } from '../lib/twig';
import { createComponent } from './lib/createComponent';
import { extractErrorTitle } from './lib/extractErrorTitle';
import { buildStoryArgs } from './lib/buildStoryArgs';
import { setupEventCallbacks } from './lib/eventCallbacks';

const { fetch, Node } = global;

class SymfonyRenderingError extends Error {
    constructor(
        public readonly title: string,
        public readonly errorPage: string
    ) {
        super(title);
    }
}

const fetchStoryHtml: FetchStoryHtmlType = async (url, path, params, storyContext, template) => {
    const fetchUrl = new URL(`${url}/${path}`);

    const body = {
        args: { ...storyContext.globals, ...params },
        template: template.getSource(),
    };

    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/html',
        },
        body: JSON.stringify(body),
    });

    const html = await response.text();

    if (!response.ok) {
        const errorTitle = extractErrorTitle(html, response.statusText);
        throw new SymfonyRenderingError(errorTitle, html);
    }

    return html;
};

export const render: ArgsStoryFn<SymfonyRenderer> = (args, context) => {
    const { id, component } = context;
    if (typeof component === 'string') {
        return {
            template: twig(component),
            setup: () => args,
        };
    }

    if (typeof component === 'object') {
        if ('getSource' in component && typeof component.getSource === 'function') {
            return {
                template: component,
                setup: () => args,
            };
        } else if ('name' in component) {
            return {
                template: createComponent(component.name, args),
                components: [component],
                setup: () => args,
            };
        }
    }

    if (typeof component === 'function') {
        return component(args, context);
    }

    logger.warn(dedent`
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
    const { template, setup } = storyFn(storyContext);

    if (typeof setup === 'function') {
        args = setup();
    }

    const storyArgs = buildStoryArgs(args, argTypes);

    const {
        symfony: { id: storyId, params },
    } = parameters;

    const url = `${window.location.origin}/_storybook/render`;
    const fetchId = storyId || id;
    const storyParams = { ...params, ...storyArgs };

    showMain();
    try {
        const element = await fetchStoryHtml(url, fetchId, storyParams, storyContext, template);

        setupEventCallbacks(args, canvasElement);

        if (typeof element === 'string') {
            canvasElement.innerHTML = element;
            configureLiveComponentErrorCatcher(id, canvasElement);
            simulatePageLoad(canvasElement);
        } else if (element instanceof Node) {
            // Don't re-mount the element if it didn't change and neither did the story
            if (canvasElement.firstChild === element && !forceRemount) {
                return;
            }

            canvasElement.innerHTML = '';
            canvasElement.appendChild(element);
            configureLiveComponentErrorCatcher(id, canvasElement);
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
    } catch (err) {
        if (err instanceof SymfonyRenderingError) {
            showSymfonyError(id, canvasElement, err);
        } else {
            throw err;
        }
    }
}

/**
 * Marks story rendered as failed and display Symfony error page in main view.
 */
const showSymfonyError = (storyId: StoryId, canvasElement: HTMLElement, error: SymfonyRenderingError) => {
    const { title, errorPage } = error;
    logger.error(`Error rendering story ${storyId}: ${title}`);
    const channel = addons.getChannel();
    channel.emit(STORY_ERRORED, { title: storyId, description: `Server failed to render story:\n${title}` });
    channel.emit(STORY_RENDER_PHASE_CHANGED, { newPhase: 'errored', storyId });
    canvasElement.innerHTML = errorPage;
    simulatePageLoad(canvasElement);
};

type LiveComponentBackendResponse = {
    getBody(): Promise<string>;
};

type LiveComponent = {
    on(hookName: string, callback: (...args: any[]) => any): void;
};

/**
 * Configure callback for response errors in LiveComponent, so re-render errors are caught and dispatched to Storybook.
 */
const configureLiveComponentErrorCatcher = (storyId: StoryId, canvasElement: HTMLElement) => {
    const liveComponentHosts = canvasElement.querySelectorAll('[data-controller~=live]');
    const errorHandler = async (response: LiveComponentBackendResponse) => {
        const title = extractErrorTitle(await response.getBody());
        logger.error(`Live component failed to re-render in story ${storyId}: ${title}`);
        const channel = addons.getChannel();
        channel.emit(STORY_ERRORED, { title: storyId, description: `Live component failed to re-render:\n${title}` });
    };

    liveComponentHosts.forEach((el) =>
        el.addEventListener('live:connect', () => {
            if ('__component' in el) {
                const component = el.__component as LiveComponent;
                component.on('response:error', errorHandler);
            } else {
                logger.warn(dedent`
                    Failed to configure error handler for LiveComponent. The "__component" property is missing from the element. 
                    It's likely to be an issue with the Symfony Storybook framework. Check the concerned element below:
                    `);
                logger.warn(el);
            }
        })
    );
};
