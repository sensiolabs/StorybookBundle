import { wrapHtml } from '../../src';
import { mock } from 'vitest-mock-extended';
import { ServerRenderer, StoryContext } from '@storybook/server';
import dedent from 'ts-dedent';
describe('wrapHtml decorator', () => {
    it('wraps fetched HTML', async () => {
        const storyContext = mock<StoryContext<ServerRenderer>>({
            parameters: {
                server: {
                    fetchStoryHtml: () => `<div>Rendered from server</div>`,
                },
            },
        });

        const decorator = wrapHtml(
            (html) => `
            <div class='outer'>
                ${html}
            </div>
       `
        );

        decorator(() => {}, storyContext);

        const result = await storyContext.parameters.server.fetchStoryHtml();

        expect(result).toEqual(dedent`
        <div class='outer'>
            <div>Rendered from server</div>
        </div>
       `);
    });

    it('throws error if no fetchStoryHtml is provided', () => {
        const storyContext = mock<StoryContext<ServerRenderer>>();

        const decorator = wrapHtml(() => '');

        expect(() => {
            decorator(() => {}, storyContext);
        }).toThrow();
    });
});
