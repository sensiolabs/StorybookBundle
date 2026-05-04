<?php

namespace Storybook\ArgsProcessor;

use Storybook\Args;
use Storybook\Util\RequestAttributesHelper;
use Storybook\Util\StorybookAttributes;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class StorybookArgsProcessor
{
    /**
     * @var array<array{'story': ?string, 'processor': ArgsProcessorInterface}>
     */
    private array $processors = [];

    public function addProcessor(ArgsProcessorInterface $processor, ?string $story): void
    {
        $this->processors[] = [
            'story' => $story,
            'processor' => $processor,
        ];
    }

    public function process(Request $request): Args
    {
        $storybookAttributes = RequestAttributesHelper::getStorybookAttributes($request);

        $args = $this->getArgsFromRequest($request);

        foreach ($this->processors as ['story' => $story, 'processor' => $processor]) {
            if ($this->match($story, $storybookAttributes)) {
                $processor($args);
            }
        }

        return $args;
    }

    private function getArgsFromRequest(Request $request): Args
    {
        $payload = $request->getPayload()->all();
        $args = $payload['args'] ?? [];

        if (!\is_array($args)) {
            throw new BadRequestHttpException('The "args" request body field must be an object.');
        }

        return new Args($args);
    }

    private function match(?string $story, StorybookAttributes $storybookAttributes): bool
    {
        return null === $story || $storybookAttributes->story === $story;
    }
}
