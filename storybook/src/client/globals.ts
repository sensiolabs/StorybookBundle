import { global } from '@storybook/global';

const { window: globalWindow } = global;

globalWindow.STORYBOOK_ENV = 'symfony';
