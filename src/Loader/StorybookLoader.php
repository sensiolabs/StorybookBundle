<?php

namespace Storybook\Loader;

use Symfony\Component\HttpFoundation\Request;

class StorybookLoader
{
    private array $loaders = [];

    public function addLoader(string $name, callable $loader): void
    {
        if (!isset($this->loaders[$name])) {
            $this->loaders[$name] = [];
        }

        $this->loaders[$name][] = $loader;
    }

    public function load(string $name, Request $request): array
    {
        $data = $request->query->all();

        foreach ($data as $key => $value) {
            $decoded = json_decode($value, associative: true);
            if (\JSON_ERROR_NONE === json_last_error()) {
                $data[$key] = $decoded;
            }
        }

        foreach ($this->loaders[$name] ?? [] as $loader) {
            if (!\is_callable($loader)) {
                throw new \LogicException('Loader must be callable');
            }

            $data = \array_merge($data, $loader());
        }

        return $data;
    }
}
