<?php

namespace Storybook;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class Args implements \ArrayAccess, \Countable, \IteratorAggregate
{
    public function __construct(private array $storage = [])
    {
        foreach (array_keys($this->storage) as $key) {
            self::assertKeyIsString($key);
        }
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->offsetExists($key) ? $this[$key] : $default;
    }

    public function set(string $key, mixed $value): void
    {
        $this[$key] = $value;
    }

    public function merge(self|array $args, bool $override = false): void
    {
        foreach ($args as $key => $value) {
            if (!$this->offsetExists($key) || $override) {
                $this->storage[$key] = $value;
            }
        }
    }

    public function has(string $key): bool
    {
        return isset($this[$key]);
    }

    public function offsetExists(mixed $offset): bool
    {
        self::assertKeyIsString($offset);

        return \array_key_exists($offset, $this->storage);
    }

    public function offsetGet(mixed $offset): mixed
    {
        self::assertKeyIsString($offset);

        if (!$this->offsetExists($offset)) {
            throw new \LogicException(sprintf('Undefined key "%s".', $offset));
        }

        return $this->storage[$offset];
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        self::assertKeyIsString($offset);

        $this->storage[$offset] = $value;
    }

    public function offsetUnset(mixed $offset): void
    {
        self::assertKeyIsString($offset);

        unset($this->storage[$offset]);
    }

    public function toArray(): array
    {
        return $this->storage;
    }

    private static function assertKeyIsString($key): void
    {
        if (!\is_string($key)) {
            throw new \InvalidArgumentException(sprintf('Only string keys are allowed in "%s".', self::class));
        }
    }

    public function getIterator(): \Traversable
    {
        yield from $this->storage;
    }

    public function count(): int
    {
        return \count($this->storage);
    }
}
