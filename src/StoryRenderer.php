<?php

namespace Storybook;

use Storybook\Exception\RenderException;
use Storybook\Exception\UnauthorizedStoryException;
use Storybook\Twig\Sandbox\StoryExtension;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Extension\SandboxExtension;
use Twig\Loader\ArrayLoader;
use Twig\Loader\ChainLoader;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityPolicyInterface;

final class StoryRenderer
{
    public function __construct(
        private readonly Environment $twig,
        private readonly SecurityPolicyInterface $securityPolicy,
        private readonly string|bool $cacheDir,
    ) {
    }

    public function render(Story $story): string
    {
        $this->twig->addExtension(new StoryExtension());
        $this->twig->addExtension(new SandboxExtension($this->securityPolicy));

        $storyTemplateName = sprintf('story_%s.html.twig', $story->getId());

        // Name included template with a hash to avoid reusing an already loaded template class
        $templateName = sprintf('%s.html.twig', hash('xxh128', $story->getTemplate()));

        $loader = new ChainLoader([
            new ArrayLoader([
                $templateName => sprintf('%s', $story->getTemplate()),
                $storyTemplateName => sprintf("{%% sandbox %%} {%% include '%s' %%} {%% endsandbox %%}", $templateName),
            ]),
            $originalLoader = $this->twig->getLoader(),
        ]);
        $originalCache = $this->twig->getCache();

        $this->twig->setLoader($loader);

        // Use dedicated cache for storybook rendering, as templates are compiled with custom nodes for sandboxed mode
        $this->twig->setCache($this->cacheDir);

        try {
            return $this->twig->render($storyTemplateName, ['args' => $story->getArgs()]);
        } catch (SecurityError $th) {
            throw new UnauthorizedStoryException('Story contains unauthorized content', $th);
        } catch (Error $th) {
            throw new RenderException(sprintf('Unable to render story "%s".', $story->getId()), $th);
        } finally {
            // Restore original loader and cache
            $this->twig->setLoader($originalLoader);
            $this->twig->setCache($originalCache);
        }
    }
}
