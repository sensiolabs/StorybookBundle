# Processing Story Args

Story args are sent as a JSON object in the render request body. They are decoded into an `Args` object and injected into the story template context during rendering. Args processors let you customize those values before the template receives them.

## The Args Object

The `Args` object implements `ArrayAccess`, `Countable`, and `IteratorAggregate`. Entries are indexed by string and can also be managed with object accessors: `get`, `set`, `has`, and `merge`.

## Args Processors

Args processors are services that alter the args extracted from the request:

```php
// src/Storybook/ArgsProcessor/MyArgsProcessor.php

namespace App\Storybook\ArgsProcessor;

use Storybook\ArgsProcessor\ArgsProcessorInterface;
use Storybook\Attributes\AsArgsProcessor;
use Storybook\Args;

/**
 * Defaults arg 'foo' to 'bar' for all stories
 */
#[AsArgsProcessor]
class MyArgsProcessor implements ArgsProcessorInterface
{
    public function __invoke(Args $args): void
    {
        // Use array access syntax.
        $args['foo'] = 'bar';

        // Or use accessors.
        $args->set('foo', 'bar');
    }
}
```

They can also be restricted to a specific subset of stories:

```php
// src/Storybook/ArgsProcessor/MyArgsProcessor.php

namespace App\Storybook\ArgsProcessor;

use Storybook\ArgsProcessor\ArgsProcessorInterface;
use Storybook\Attributes\AsArgsProcessor;
use Storybook\Args;

/**
 * Transforms user's array data to objects
 */
#[AsArgsProcessor(story: 'user-list--story1')]
#[AsArgsProcessor(story: 'user-list--story2')]
class MyArgsProcessor implements ArgsProcessorInterface
{
    public function __invoke(Args $args): void
    {
        foreach ($args['users'] as $key => $user) {
            $args['users'][$key] = new User($user['id'], $user['name']);
        }
    }
}
```

Use `Args::merge()` to configure defaults:

```php
/**
 * Configure default args
 */
#[AsArgsProcessor]
class MyArgsProcessor implements ArgsProcessorInterface
{
    private const DEFAULTS = [
        'foo' => 'bar',
        'baz' => 'qux',
    ];

    public function __invoke(Args $args): void
    {
        // Merge default values without overriding existing values.
        $args->merge(self::DEFAULTS);

        // Merge and override existing values.
        $args->merge(self::DEFAULTS, override: true);
    }
}
```
