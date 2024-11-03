<?php

namespace Storybook\Twig;

use Storybook\Mock\ComponentProxyFactory;
use Storybook\Mock\MockedPropertiesProxy;
use Storybook\Twig\NodeVisitor\MockContextNodeVisitor;
use Storybook\Twig\NodeVisitor\SandboxNodeVisitor;
use Storybook\Util\StorybookContextHelper;
use Twig\Extension\AbstractExtension;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class StoryExtension extends AbstractExtension
{
    public function __construct(
        private readonly ComponentProxyFactory $componentProxyFactory,
    ) {
    }

    public function getNodeVisitors(): array
    {
        return [
            new MockContextNodeVisitor(),
            new SandboxNodeVisitor(),
        ];
    }

    public function prepareContext(array &$context): void
    {
        if (false === StorybookContextHelper::hasStorybookContext($context)) {
            return;
        }

        $storybookContext = StorybookContextHelper::getStorybookContext($context);

        if (null === ($componentClass = $storybookContext->componentClass)) {
            // Don't mock anonymous components
            return;
        }

        if (false === $this->componentProxyFactory->componentHasMock($componentClass)) {
            return;
        }

        if (false === ($context['this'] instanceof MockedPropertiesProxy)) {
            $context['this'] = $this->componentProxyFactory->createProxyForStory(
                $componentClass,
                $context['this'],
                $storybookContext->story,
            );
        }

        if (false === ($context['computed'] instanceof MockedPropertiesProxy)) {
            $context['computed'] = $this->componentProxyFactory->createProxyForStory(
                $componentClass,
                $context['computed'],
                $storybookContext->story
            );
        }
    }
}
