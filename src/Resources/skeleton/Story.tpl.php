import <?php echo $componentName; ?> from "../templates/<?php echo $template; ?>";
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    component: (args) => ({
        component: {<?php echo $componentName; ?>},
        template: twig`
            <twig:<?php echo $componentName; ?>/>
        `,
    })
}

