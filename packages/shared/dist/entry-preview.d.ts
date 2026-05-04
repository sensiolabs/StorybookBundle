import { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { S as SymfonyRenderer } from './types-CmOsuV20.js';

declare global {
    interface Window {
        STORYBOOK_ENV: 'symfony';
    }
}

declare const render: ArgsStoryFn<SymfonyRenderer>;
declare function renderToCanvas({ id, showMain, storyFn, storyContext, storyContext: { parameters, args, argTypes }, }: RenderContext<SymfonyRenderer>, canvasElement: SymfonyRenderer['canvasElement']): Promise<void>;

declare const parameters: {
    renderer: "symfony";
    symfony: {};
};

export { parameters, render, renderToCanvas };
