<?php

namespace Storybook\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Storybook\Util\MountedComponentMetadata;
use Symfony\UX\TwigComponent\ComponentAttributes;
use Symfony\UX\TwigComponent\MountedComponent;
use Twig\Runtime\EscaperRuntime;

final class MountedComponentMetadataTest extends TestCase
{
    public function testRemoveExtraMetadata(): void
    {
        $mounted = new MountedComponent('component', new \stdClass(), new ComponentAttributes([], new EscaperRuntime()), [], [
            'hostTemplate' => 'host.html.twig',
            'embeddedTemplateIndex' => 0,
            'keep' => true,
        ]);

        MountedComponentMetadata::remove($mounted, 'hostTemplate', 'embeddedTemplateIndex');

        $this->assertFalse($mounted->hasExtraMetadata('hostTemplate'));
        $this->assertFalse($mounted->hasExtraMetadata('embeddedTemplateIndex'));
        $this->assertTrue($mounted->getExtraMetadata('keep'));
    }
}
