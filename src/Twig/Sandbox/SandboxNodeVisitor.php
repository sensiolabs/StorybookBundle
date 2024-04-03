<?php

namespace Storybook\Twig\Sandbox;

use Storybook\Twig\Sandbox\Node\BypassCheckSecurityCallNode;
use Storybook\Twig\Sandbox\Node\SafeNode;
use Twig\Environment;
use Twig\Node\CheckSecurityCallNode;
use Twig\Node\ModuleNode;
use Twig\Node\Node;
use Twig\NodeVisitor\NodeVisitorInterface;

/**
 * Node visitor to disable sandbox in nested modules, but not in the main story module.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class SandboxNodeVisitor implements NodeVisitorInterface
{
    private bool $inTrustedModule = false;
    private int $nestingLevel = 0;

    public function enterNode(Node $node, Environment $env): Node
    {
        if ($node instanceof ModuleNode) {
            if (!$this->inTrustedModule && ++$this->nestingLevel > 2) {
                // Depth > 2 means we are processing a known template
                $this->inTrustedModule = true;
            }
        }

        return $node;
    }

    public function leaveNode(Node $node, Environment $env): ?Node
    {
        if ($node instanceof ModuleNode && $this->inTrustedModule) {
            // Wraps module body in a SafeNode to disable sandbox before it is displayed and re-enable it after
            $node->setNode('body', new SafeNode($node->getNode('body'), $node->getNode('body')->getTemplateLine(), $node->getNodeTag()));
            $this->bypassSecurityCheckCall($node);
        }

        return $node;
    }

    private function bypassSecurityCheckCall(ModuleNode $node): void
    {
        $constructorEnd = $node->getNode('constructor_end');
        foreach ($constructorEnd as $index => $child) {
            if ($child instanceof CheckSecurityCallNode) {
                $constructorEnd->removeNode($index);
                break;
            }
        }

        $node->setNode('constructor_end', new Node([new BypassCheckSecurityCallNode(), $constructorEnd]));
    }

    public function getPriority(): int
    {
        // Must be used AFTER base sandbox visitor
        return 1;
    }
}
