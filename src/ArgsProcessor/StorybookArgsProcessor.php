<?php

namespace Storybook\ArgsProcessor;

use Storybook\Args;
use Storybook\Util\RequestAttributesHelper;
use Storybook\Util\StorybookAttributes;
use Symfony\Component\HttpFoundation\Request;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
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
                if (!$processor instanceof ArgsProcessorInterface) {
                    throw new \LogicException(sprintf('Args processor "%s" must implement "%s".', get_debug_type($processor), ArgsProcessorInterface::class));
                }

                $processor($args);
            }
        }

        return $args;
    }

    private function getArgsFromRequest(Request $request): Args
    {
        $args = $request->getPayload()->all()['args'] ?? [];

        return new Args($args);
    }

    private function match(?string $story, StorybookAttributes $storybookAttributes): bool
    {
        return null === $story || $storybookAttributes->story === $story;
    }
}
