import { setupActionListeners } from './client/addons/actions/decorator';
import { actionLoader } from './client/addons/actions/loader';
import { Decorator } from './client';
export { render, renderToCanvas } from './client/render';

export const decorators: Decorator[] = [setupActionListeners];

export const loaders = [actionLoader];

export const parameters = {
    renderer: 'symfony' as const,
    symfony: {},
};
