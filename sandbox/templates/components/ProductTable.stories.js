import ProductTable from './ProductTable.html.twig';
import {twig} from "@sensiolabs/storybook-symfony-webpack5";

export default {
    component: ProductTable,
};

export const Default = {
}

export const EmbeddedRender = {
    render: () => ({
        components: { ProductTable },
        template: twig`<twig:ProductTable></twig:ProductTable>`,
    }),
}
