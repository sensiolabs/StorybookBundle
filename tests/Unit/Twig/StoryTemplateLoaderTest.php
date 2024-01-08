<?php

namespace Storybook\Tests\Unit\Twig;

use PHPUnit\Framework\TestCase;
use Storybook\Twig\StoryTemplateLoader;

class StoryTemplateLoaderTest extends TestCase
{
    public function testCreateLoader()
    {
        $runtimeDir = __DIR__.'/../../Fixtures/var/storybook';

        $loader = new StoryTemplateLoader($runtimeDir);

        $this->assertNotEmpty($loader->getPaths('Stories'));
    }

    public function testCreateLoaderWithMissingDirectory()
    {
        $runtimeDir = __DIR__.'/some/unknown/path';

        $loader = new StoryTemplateLoader($runtimeDir);

        $this->assertEmpty($loader->getPaths('Stories'));
    }
}
