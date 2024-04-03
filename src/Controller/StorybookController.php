<?php

namespace Storybook\Controller;

use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Story;
use Storybook\StoryRenderer;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StorybookController
{
    public function __construct(
        private readonly StoryRenderer $storyRenderer,
        private readonly StorybookArgsProcessor $argsProcessor,
    ) {
    }

    public function __invoke(Request $request, string $story): Response
    {
        $request = RequestAttributesHelper::withStorybookAttributes($request, ['story' => $story]);

        $templateString = $request->getPayload()->get('template');

        if (null === $templateString) {
            throw new BadRequestHttpException('Missing "template" in request body.');
        }

        $args = $this->argsProcessor->process($request);

        $storyObj = new Story($story, $templateString, $args);

        $content = $this->storyRenderer->render($storyObj);

        return new Response($content);
    }
}
