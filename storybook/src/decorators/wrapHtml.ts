import { DecoratorFunction } from '@storybook/types';
import { ServerRenderer } from '@storybook/server';
import dedent from 'ts-dedent';

type HtmlWrapper = (html: string) => string;

export const wrapHtml = (wrapper: HtmlWrapper): DecoratorFunction<ServerRenderer> => {
    return (StoryFn, context) => {
        const { server = {} } = context.parameters;

        if (server.fetchStoryHtml !== undefined) {
            context.parameters.server = {
                ...server,
                fetchStoryHtml: async (...args: any) => {
                    const content = await server.fetchStoryHtml(...args);
                    return dedent(wrapper(content));
                },
            };
        } else {
            throw new Error(dedent`
            Error: the wrapHtml decorator expects a 'fetchStoryHtml' to be defined in parameters.server.
            `);
        }

        return StoryFn();
    };
};
