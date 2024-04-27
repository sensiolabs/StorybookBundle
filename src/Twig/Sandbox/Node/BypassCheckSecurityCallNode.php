<?php

namespace Storybook\Twig\Sandbox\Node;

use Twig\Attribute\YieldReady;
use Twig\Compiler;
use Twig\Node\Node;

/**
 * Disable security check in module having a safe body.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
#[YieldReady]
class BypassCheckSecurityCallNode extends Node
{
    public function compile(Compiler $compiler): void
    {
        $compiler
            ->write("\$this->sandbox = \$this->env->getExtension('\Twig\Extension\SandboxExtension');\n")
        ;
    }
}
