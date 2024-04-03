import { setupActionListeners } from './client/addons/actions/decorator';
import { actionLoader } from './client/addons/actions/loader';
import { Decorator } from './client';
export { renderToCanvas } from './client/render';

export const decorators: Decorator[] = [setupActionListeners];

export const loaders = [actionLoader];

export const parameters = {
    renderer: 'symfony' as const,
    server: {
        url: `${window.location.origin}/_storybook/render`,
    },
};
