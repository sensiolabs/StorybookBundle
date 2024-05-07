<?php

namespace Storybook\Twig;

use Storybook\Twig\Sandbox\SandboxNodeVisitor;
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
