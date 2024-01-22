<?php

namespace Storybook\Controller;

use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Exception\RenderException;
use Storybook\Exception\TemplateNotFoundException;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Error\LoaderError;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StorybookController
{
    public function __construct(
        private readonly Environment $twig,
        private readonly StorybookArgsProcessor $argsProcessor,
    ) {
    }

    public function __invoke(Request $request, string $story): Response
    {
        $request = RequestAttributesHelper::withStorybookAttributes($request, ['story' => $story]);

        $args = $this->argsProcessor->process($request);

        $template = sprintf('@Stories/%s.html.twig', $story);

        try {
            $content = $this->twig->render($template, ['args' => $args]);
        } catch (LoaderError $th) {
            throw new TemplateNotFoundException(sprintf('Unable to find template for story "%s".', $story), $th);
        } catch (Error $th) {
            throw new RenderException(sprintf('Unable to render story "%s".', $story), $th);
        }

        return new Response($content);
    }
}
