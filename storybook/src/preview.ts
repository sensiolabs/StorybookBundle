import { Args, PartialStoryFn as StoryFunction } from '@storybook/types';
import { global } from '@storybook/global';
import { FrameworkOptions } from './types';
import { ServerRenderer, StoryContext} from '@storybook/server';
import { setupActions } from './addons/actions';

function getFrameworkOptions() {
    // @ts-ignore
    return global.FRAMEWORK_OPTIONS as FrameworkOptions;
}


/**
 * Copy/pasted from storybook/renderers/server/src/render.ts.
 *
 * So we can wrap the output in decorators.
 */
const fetchStoryHtml = async (url: string, path: string, params: any, storyContext: StoryContext<Args>) => {
    const fetchUrl = new URL(`${url}/${path}`);

    fetchUrl.search = new URLSearchParams({ ...storyContext.globals, ...params }).toString();

    const response = await fetch(fetchUrl);

    return response.text();
};

/**
 * Decorator to set server URL
 */
export const decorators = [
    (StoryFn: StoryFunction<ServerRenderer>, context: StoryContext<ServerRenderer>) => {
        const { server = {} } = context.parameters;

        if (server.url === undefined) {
            server.url = `${getFrameworkOptions().symfony.server}/_storybook/render`;
        }

        server.fetchStoryHtml = fetchStoryHtml;

        context.parameters.server = server;

        return StoryFn();
    },
    setupActions
];
