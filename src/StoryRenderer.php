<?php

namespace Storybook;

use Storybook\Exception\RenderException;
use Storybook\Exception\UnauthorizedStoryException;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Extension\SandboxExtension;
use Twig\Loader\ArrayLoader;
use Twig\Loader\ChainLoader;
use Twig\Sandbox\SecurityError;

/**
 * @internal
 */
final class StoryRenderer
{
    public function __construct(
        private readonly Environment $twig,
    ) {
    }

    public function render(Story $story): string
    {
        $loader = new ChainLoader([
            new ArrayLoader([
                $story->getTemplateName() => $story->getTemplate(),
            ]),
            $originalLoader = $this->twig->getLoader(),
        ]);

        try {
            $this->twig->setLoader($loader);
            $sandbox = $this->twig->getExtension(SandboxExtension::class);
            $wasSandboxed = $sandbox->isSandboxed();
            $sandbox->enableSandbox();

            return $this->twig->render($story->getTemplateName(), $story->getArgs()->toArray());
        } catch (SecurityError $th) {
            // SecurityError can actually be raised
            throw new UnauthorizedStoryException('Story contains unauthorized content', $th);
        } catch (Error $th) {
            throw new RenderException(\sprintf('Story render failed: %s', $th->getMessage()), $th);
        } finally {
            if (isset($sandbox, $wasSandboxed) && !$wasSandboxed) {
                $sandbox->disableSandbox();
            }

            // Restore original loader
            $this->twig->setLoader($originalLoader);
        }
    }
}
