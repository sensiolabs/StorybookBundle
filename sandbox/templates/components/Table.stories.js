import Table from './Table.html.twig';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

const dataset = {
    'some': {
        cols: ['Col1', 'Col2'],
        rows: [
            ['aaaa', 'bbbb'],
            ['dddd', 'cccc'],
        ]
    },
    'empty': {
        cols: [],
        rows: [],
    }
};

export default {
    render: (args) => {
        return {
            components: {Table},
            setup: () => ({
                cols: args.dataset.cols,
                rows: args.dataset.rows,
            }),
            template: twig`<twig:Table :rows="rows" :cols="cols"/>`
        }
    },
    argTypes: {
        dataset: {
            control: {type: 'select'},
            options: Object.keys(dataset),
            mapping: dataset
        }
    }
}

export const SomeRows = {
    args: {
        dataset: 'some'
    }
}
