<?php

use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

return function (RoutingConfigurator $routes) {
    $routes
        ->add('storybook_render', '/_storybook/render/{story}')
            ->requirements([
                'story' => '.+',
            ])
            ->methods(['POST'])
            ->controller('storybook.controller.render_story')
    ;
};
