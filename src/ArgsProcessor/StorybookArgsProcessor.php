<?php

namespace Storybook\ArgsProcessor;

use Storybook\Util\RequestAttributesHelper;
use Storybook\Util\StorybookAttributes;
use Symfony\Component\HttpFoundation\Request;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StorybookArgsProcessor
{
    /**
     * @var array<array{'story': ?string, 'processor': callable}>
     */
    private array $processors = [];

    public function addProcessor(callable $processor, ?string $story): void
    {
        $this->processors[] = [
            'story' => $story,
            'processor' => $processor,
        ];
    }

    public function process(Request $request): array
    {
        $storybookAttributes = RequestAttributesHelper::getStorybookAttributes($request);

        $args = $request->query->all();

        // Decode JSON args
        foreach ($args as $key => $value) {
            $decoded = json_decode($value, associative: true);
            if (\JSON_ERROR_NONE === json_last_error()) {
                $args[$key] = $decoded;
            }
        }

        foreach ($this->processors as ['story' => $story, 'processor' => $processor]) {
            if ($this->match($story, $storybookAttributes)) {
                $processor($args);
            }
        }

        return $args;
    }

    private function match(?string $story, StorybookAttributes $storybookAttributes): bool
    {
        return null === $story || $storybookAttributes->story === $story;
    }
}
