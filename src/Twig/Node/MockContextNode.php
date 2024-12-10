<?php

namespace Storybook\Twig\Node;

use Storybook\Twig\StoryExtension;
use Twig\Attribute\YieldReady;
use Twig\Compiler;
use Twig\Node\Node;

/**
 * Mock context array with provided Storybook context helper if available.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
#[YieldReady]
final class MockContextNode extends Node
{
    public function compile(Compiler $compiler): void
    {
        $storybookExtension = $compiler->getVarName();

        $compiler
            ->write('if (isset($context["__storybook"])) {')
            ->raw("\n")
            ->indent()
            ->write(\sprintf('$%s = $this->env->getExtension(', $storybookExtension))
            ->string(StoryExtension::class)
            ->raw(");\n")
            ->write(\sprintf('$%s->prepareContext($context);', $storybookExtension))
            ->raw("\n")
            ->outdent()
            ->write('}')
            ->raw("\n\n")
        ;
    }
}
