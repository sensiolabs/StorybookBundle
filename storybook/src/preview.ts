import { Args } from '@storybook/types';
import { StoryContext} from '@storybook/server';
import { setupActionListeners } from './addons/actions/decorator';
import { actionLoader } from './addons/actions/loader';


/**
 * Copy/pasted from storybook/renderers/server/src/render.ts.
 *
 * So we can wrap the output in decorators.
 */
const fetchStoryHtml = async (url: string, path: string, params: any, storyContext: StoryContext<Args>) => {
    const fetchUrl = new URL(`${url}/${path}`);

    for (const name in params) {
        if (params[name]._sfActionId !== undefined) {
            params[name] = params[name]._sfActionId;
        }
    }
    fetchUrl.search = new URLSearchParams({ ...storyContext.globals, ...params }).toString();

    const response = await fetch(fetchUrl);

    return response.text();
};


export const decorators = [
    setupActionListeners,
];

export const loaders = [actionLoader];

export const parameters = {
    server: {
        url: `${window.location.origin}/_storybook/render`,
        fetchStoryHtml: fetchStoryHtml
    }
}
