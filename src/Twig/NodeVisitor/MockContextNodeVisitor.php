<?php

namespace Storybook\Twig\NodeVisitor;

use Storybook\Twig\Node\MockContextNode;
use Twig\Environment;
use Twig\Node\ModuleNode;
use Twig\Node\Node;
use Twig\NodeVisitor\NodeVisitorInterface;

/**
 * Node visitor to inject mock context logic before displaying a module node.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class MockContextNodeVisitor implements NodeVisitorInterface
{
    public function enterNode(Node $node, Environment $env): Node
    {
        return $node;
    }

    public function leaveNode(Node $node, Environment $env): ?Node
    {
        if ($node instanceof ModuleNode && '' !== $node->getSourceContext()->getPath()) {
            $node->setNode('display_start', new Node([new MockContextNode(), $node->getNode('display_start')]));
        }

        return $node;
    }

    public function getPriority(): int
    {
        return 0;
    }
}
