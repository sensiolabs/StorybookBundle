<?php

namespace Storybook\Twig\Sandbox;

use Twig\Extension\AbstractExtension;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class StoryExtension extends AbstractExtension
{
    public function getNodeVisitors(): array
    {
        return [new SandboxNodeVisitor()];
    }
}
