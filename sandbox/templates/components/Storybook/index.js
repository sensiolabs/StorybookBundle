import {global as globalThis} from '@storybook/global';

import Button from './Button.html.twig';
import Pre from './Pre.html.twig';
import Form from './Form.html.twig';
import Html from './Html.html.twig';

globalThis.Components = {
    Button,
    Pre,
    Form,
    Html
};
globalThis.storybookRenderer = 'symfony';
