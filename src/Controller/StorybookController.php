<?php

namespace Storybook\Controller;

use Storybook\Exception\RenderException;
use Storybook\Exception\TemplateNotFoundException;
use Storybook\Loader\StorybookLoader;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;
use Twig\Error\LoaderError;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class StorybookController
{
    public function __construct(
        private readonly Environment $twig,
        private readonly StorybookLoader $loader,
    ) {
    }

    public function __invoke(Request $request, string $id): Response
    {
        $data = $this->loader->load($id, $request);

        $template = sprintf('@Stories/%s.html.twig', $id);

        try {
            $content = $this->twig->load($template)->render(['args' => $data]);
        } catch (LoaderError $th) {
            throw new TemplateNotFoundException(sprintf('Unable to find template for story "%s".', $id), $th);
        } catch (\Throwable $th) {
            throw new RenderException(sprintf('Unable to render story "%s".', $id), $th);
        }

        return new Response($content);
    }
}
