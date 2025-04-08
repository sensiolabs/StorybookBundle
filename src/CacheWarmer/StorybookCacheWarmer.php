<?php

declare(strict_types=1);

namespace Storybook\CacheWarmer;

use Symfony\Component\Config\ConfigCacheFactory;
use Symfony\Component\Config\ConfigCacheFactoryInterface;
use Symfony\Component\Config\ConfigCacheInterface;
use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;

class StorybookCacheWarmer implements CacheWarmerInterface
{
    private ConfigCacheFactory $configCacheFactory;

    public function __construct(
        private readonly ?string $cacheDir,
        private readonly bool $debug,
        private readonly string $projectDir,
        private readonly array $twigConfig,
        private readonly array $twigComponentConfig,
    ) {
    }

    public function isOptional(): bool
    {
        return true;
    }

    public function warmUp(string $cacheDir, ?string $buildDir = null): array
    {
        $this->getConfigCacheFactory()->cache(
            $this->cacheDir.'/symfony_parameters.json',
            function (ConfigCacheInterface $cache) {
                $this->generateSymfonyParameters($cache);
            }
        );

        return [];
    }

    /**
     * Provides the ConfigCache factory implementation, falling back to a
     * default implementation if necessary.
     */
    private function getConfigCacheFactory(): ConfigCacheFactoryInterface
    {
        $this->configCacheFactory ??= new ConfigCacheFactory($this->debug);

        return $this->configCacheFactory;
    }

    private function generateSymfonyParameters(ConfigCacheInterface $cache): void
    {
        $parameters = [
            'twig_config' => [
                'default_path' => $this->twigConfig['default_path'],
                'paths' => $this->twigConfig['paths'],
            ],
            'twig_component_config' => [
                'anonymous_template_directory' => $this->twigComponentConfig['anonymous_template_directory'],
                'defaults' => $this->twigComponentConfig['defaults'],
            ],
        ];

        $cache->write(json_encode($this->stripProjectDirectory($parameters), JSON_PRETTY_PRINT));
    }

    private function stripProjectDirectory(array $array): array
    {
        $sanitizedArray = [];
        foreach ($array as $key => $value) {
            if (is_string($value) && str_starts_with($value, $this->projectDir)) {
                $value = str_replace($this->projectDir, '', $value);
            }

            if (is_string($key) && str_starts_with($key, $this->projectDir)) {
                $key = str_replace($this->projectDir, '', $key);
                $sanitizedArray[$key] = $value;
            } elseif (is_array($value)) {
                $sanitizedArray[$key] = $this->stripProjectDirectory($value);
            } else {
                $sanitizedArray[$key] = $value;
            }

        }

        return $sanitizedArray;
    }
}
