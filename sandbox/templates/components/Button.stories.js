import Button from './Button.html.twig';
import { fn, expect, userEvent, waitFor, within } from '@storybook/test';

const variants = ['primary', 'secondary'];
const sizes = ['sm', 'md', 'lg'];
export default {
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        backgroundColor: { control: 'color' },
        label: { control: 'text' },
        onClick: { action: 'onClick' },
        variant: {
            control: {type: 'select'},
            options: Object.values(variants),
        },
        size: {
            control: { type: 'select' },
            options: Object.values(sizes),
        },
    },
    args: { onClick: fn() },
}

export const Primary = {
    args: {
        variant: 'primary',
        label: 'Button'
    }
}

export const Secondary = {
    args: {
        ...Primary.args,
        variant: 'secondary'
    }
}

export const Large= {
    args: {
        size: 'lg',
        label: 'Button',
    },
};

export const Small= {
    args: {
        size: 'sm',
        label: 'Button',
    },
};

export const OnClick = {
    args: {
        ...Primary.args,
    },
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
        await waitFor(() => expect(args.onClick).toHaveBeenCalledOnce());
    }
}
