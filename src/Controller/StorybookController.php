<?php

namespace Storybook\Controller;

use Storybook\Exception\RenderException;
use Storybook\Loader\StorybookLoader;
use Storybook\Twig\TemplateLocator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

class StorybookController
{
    public function __construct(private readonly Environment $twig, private readonly StorybookLoader $loader, private readonly TemplateLocator $templateLocator)
    {
    }

    public function __invoke(Request $request, string $id): Response
    {
        $data = $this->loader->load($id, $request);

        $template = $this->templateLocator->locateTemplate($id);

        try {
            $content = $this->twig->load($template)->render(['args' => $data]);
        } catch (\Throwable $th) {
            throw new RenderException('Unable to render story.', $th);
        }

        return new Response($content);
    }
}
