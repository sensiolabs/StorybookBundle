<?php

namespace Storybook\Tests\Unit\Twig;

use PHPUnit\Framework\TestCase;
use Storybook\Twig\StorybookRuntimeLoader;

final class StorybookRuntimeLoaderTest extends TestCase
{
    public function testAddRuntime()
    {
        $runtimeLoader = new StorybookRuntimeLoader();

        $runtime = new DummyRuntime();
        $runtimeLoader->addRuntime($runtime);

        self::assertSame($runtime, $runtimeLoader->load(DummyRuntime::class));
    }

    public function testAddingTheSameRuntimeMultipleTimesThrowsException()
    {
        $runtimeLoader = new StorybookRuntimeLoader();

        $runtime = new DummyRuntime();
        $runtimeLoader->addRuntime($runtime);

        $sameRuntime = new DummyRuntime();

        $this->expectException(\InvalidArgumentException::class);
        $runtimeLoader->addRuntime($sameRuntime);
    }
}

final class DummyRuntime
{
}
