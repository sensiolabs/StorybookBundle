<?php

namespace Storybook;

use Storybook\Exception\RenderException;
use Storybook\Exception\UnauthorizedStoryException;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Loader\ArrayLoader;
use Twig\Loader\ChainLoader;
use Twig\Sandbox\SecurityError;

final class StoryRenderer
{
    public function __construct(
        private readonly Environment $twig,
    ) {
    }

    public function render(Story $story): string
    {
        $storyTemplateName = sprintf('story_%s.html.twig', $story->getId());

        // Name included template with a hash to avoid reusing an already loaded template class
        $templateName = sprintf('%s.html.twig', hash('xxh128', $story->getTemplate()));

        $loader = new ChainLoader([
            new ArrayLoader([
                $templateName => $story->getTemplate(),
                $storyTemplateName => sprintf("{%% sandbox %%} {%%- include '%s' -%%} {%% endsandbox %%}", $templateName),
            ]),
            $originalLoader = $this->twig->getLoader(),
        ]);

        $this->twig->setLoader($loader);

        try {
            return $this->twig->render($storyTemplateName, $story->getArgs()->toArray());
        } catch (SecurityError $th) {
            throw new UnauthorizedStoryException('Story contains unauthorized content', $th);
        } catch (Error $th) {
            throw new RenderException(sprintf('Unable to render story "%s".', $story->getId()), $th);
        } finally {
            // Restore original loader
            $this->twig->setLoader($originalLoader);
        }
    }
}
