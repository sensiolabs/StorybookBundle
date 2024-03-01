<?php

namespace Storybook\Tests\Fixtures;

use Psr\Log\NullLogger;
use Storybook\StorybookBundle;
use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Bundle\TwigBundle\TwigBundle;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;
use Symfony\UX\TwigComponent\TwigComponentBundle;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function registerBundles(): iterable
    {
        yield new FrameworkBundle();
        yield new TwigBundle();
        yield new TwigComponentBundle();
        yield new StorybookBundle();
    }

    protected function configureContainer(ContainerConfigurator $container): void
    {
        $frameworkConfig = [
            'secret' => 'S3CRET',
            'test' => true,
            'router' => ['utf8' => true],
            'secrets' => false,
            'http_method_override' => false,
            'php_errors' => ['log' => true],
            'handle_all_throwables' => true,
        ];

        // AssetMapper configuration
        $frameworkConfig['asset_mapper'] = [
            'importmap_path' => '%kernel.project_dir%/tests/Fixtures/importmap.php',
            'paths' => [
                'assets/',
            ],
        ];

        $container->extension('framework', $frameworkConfig);

        $container->extension('twig', [
            'default_path' => '%kernel.project_dir%/tests/Fixtures/templates',
        ]);

        $container->extension('twig_component', [
            'anonymous_template_directory' => 'components/',
            'defaults' => [
                'Storybook\Tests\Fixtures\Component\\' => 'components/',
            ],
        ]);

        $container->extension('storybook', [
            'runtime_dir' => '%kernel.project_dir%/tests/Fixtures/storybook',
            'server' => 'http://localhost:6006',
        ]);

        $container->services()
            ->defaults()
            ->autowire()
            ->autoconfigure()
            ->load(__NAMESPACE__.'\\', __DIR__)
            // Disable logging errors in the console
            ->set('logger', NullLogger::class)
        ;
    }

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->import('@StorybookBundle/config/routes.php');
    }
}
