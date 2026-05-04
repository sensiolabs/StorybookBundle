import { global } from '@storybook/global';

declare global {
    interface Window {
        STORYBOOK_ENV: 'symfony';
    }
}

const { window: globalWindow } = global;

globalWindow.STORYBOOK_ENV = 'symfony';
