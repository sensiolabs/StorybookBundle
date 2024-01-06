<?php

namespace Symfony\Component\DependencyInjection\Loader\Configurator;

use Storybook\Command\InitCommand;
use Storybook\Controller\StorybookController;
use Storybook\EventListener\CorsListener;
use Storybook\Loader\StorybookLoader;
use Storybook\Twig\TemplateLocator;

return static function (ContainerConfigurator $container) {
    $container->services()
        ->set('storybook.controller.render_story', StorybookController::class)
          ->args([
              service('twig'),
              service('storybook.loader'),
              service('storybook.twig.template_locator')
          ])
          ->tag('controller.service_arguments')
      ->set('storybook.listener.cors', CorsListener::class)
          ->args([
              service('request_stack'),
              abstract_arg('storybook dev server host'),
          ])
          ->tag('kernel.event_listener')
      ->set('storybook.loader', StorybookLoader::class)
      ->set('storybook.twig.template_locator', TemplateLocator::class)
        ->args([
          param('kernel.project_dir')
        ])
      ->set('storybook.init_command', InitCommand::class)
        ->args([
          service('twig'),
        ])
        ->tag('console.command', ['name' => 'storybook:init'])
    ;
};
