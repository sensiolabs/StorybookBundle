<?php

namespace Storybook\Twig\Sandbox\Node;

use Twig\Compiler;
use Twig\Node\BodyNode;

/**
 * Wraps a BodyNode in a safe space.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
// #[YieldReady]
class SafeBodyNode extends BodyNode
{
    public function __construct(BodyNode $body)
    {
        parent::__construct($body->nodes, $body->attributes, $body->lineno, $body->tag);
    }

    public function compile(Compiler $compiler): void
    {
        $compiler
            ->addDebugInfo($this)
            ->write("if (\$alreadySandboxed = \$this->sandbox->isSandboxed()) {\n")
            ->indent()
            ->write("\$this->sandbox->disableSandbox();\n")
            ->outdent()
            ->write("}\n")
        ;

        parent::compile($compiler);

        $compiler->write("if (\$alreadySandboxed) {\n")
            ->indent()
            ->write("\$this->sandbox->enableSandbox();\n")
            ->outdent()
            ->write("}\n")
        ;
    }
}
