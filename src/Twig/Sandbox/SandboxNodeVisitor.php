<?php

namespace Storybook\Twig\Sandbox;

use Storybook\Twig\Sandbox\Node\BypassCheckSecurityCallNode;
use Storybook\Twig\Sandbox\Node\SafeBodyNode;
use Twig\Environment;
use Twig\Node\CheckSecurityCallNode;
use Twig\Node\CheckSecurityNode;
use Twig\Node\ModuleNode;
use Twig\Node\Node;
use Twig\NodeVisitor\NodeVisitorInterface;

/**
 * Node visitor to disable sandbox in trusted templates, i.e. the ones having a path the server.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class SandboxNodeVisitor implements NodeVisitorInterface
{
    public function enterNode(Node $node, Environment $env): Node
    {
        return $node;
    }

    public function leaveNode(Node $node, Environment $env): ?Node
    {
        if ($node instanceof ModuleNode && '' !== $node->getSourceContext()->getPath()) {
            // Wraps module body in a safe node to disable sandbox before it is displayed and re-enable it after
            $node->setNode('body', new SafeBodyNode($node->getNode('body')));
            $this->bypassSecurity($node);
        }

        return $node;
    }

    private function bypassSecurity(ModuleNode $node): void
    {
        $constructorEnd = $node->getNode('constructor_end');
        foreach ($constructorEnd as $index => $child) {
            if ($child instanceof CheckSecurityCallNode) {
                $constructorEnd->removeNode($index);
                break;
            }
        }

        $node->setNode('constructor_end', new Node([new BypassCheckSecurityCallNode(), $constructorEnd]));

        $classEnd = $node->getNode('class_end');
        foreach ($classEnd as $index => $child) {
            if ($child instanceof CheckSecurityNode) {
                $classEnd->removeNode($index);
                break;
            }
        }
    }

    public function getPriority(): int
    {
        // Must be used AFTER base sandbox visitor
        return 1;
    }
}
