import LiveComponent from './LiveComponent.html.twig';
import { userEvent, expect, fn, waitFor, within } from '@storybook/test';
import {twig} from "@sensiolabs/storybook-symfony-webpack5";

export default {
    component: LiveComponent,
    args: {
        onClick: fn()
    },
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Input:');
        const output = canvas.getByText('Output:');
        const button = canvas.getByText('Click');

        await userEvent.type(input, 'foobar', {delay: 50});
        await waitFor(() => expect(output).toHaveTextContent('foobar'));

        await userEvent.click(button);
        await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
    }
}

export const Default = {
}

export const EmbeddedRender = {
    render: () => ({
       components: {LiveComponent},
       template: twig`
        <twig:LiveComponent data-storybook-callbacks="{{ onClick }}">
        </twig:LiveComponent>`
    }),
}
