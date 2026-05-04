<?php

namespace Storybook\Controller;

use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Story;
use Storybook\StoryRenderer;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StorybookController
{
    public function __construct(
        private readonly StoryRenderer $storyRenderer,
        private readonly StorybookArgsProcessor $argsProcessor,
        private readonly string $environment = 'dev',
    ) {
    }

    public function __invoke(Request $request, string $story): Response
    {
        if ('prod' === $this->environment) {
            throw new NotFoundHttpException('Storybook rendering is not available in the prod environment.');
        }

        $templateString = $request->getPayload()->get('template');

        if (null === $templateString) {
            throw new BadRequestHttpException('Missing "template" in request body.');
        }

        $templateName = \sprintf('%s.html.twig', hash('xxh128', $templateString));

        $request = RequestAttributesHelper::withStorybookAttributes($request, [
            'story' => $story,
            'template' => $templateName,
        ]);

        $args = $this->argsProcessor->process($request);

        $storyObj = new Story($story, $templateName, $templateString, $args);

        $content = $this->storyRenderer->render($storyObj);

        return new Response($content);
    }
}
