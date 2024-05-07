# Processing Story Args

Story's args are sent as a JSON object in the render request body. They are decoded and transformed into a `Args` object that is injected in the story template context on rendering. You can customize these args before they are injected in the context with Args Processors.

## The Args Object

The `Args` object implements `ArrayAccess`, `Countable` and `IteratorAggregate`. Its entries are indexed by string, and can also be managed using object accessors (`get`, `set`, `has` and `merge`).

## Args Processors

Args Processors are services used to alter the args extracted from the request:

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
        // Using array access syntax:  
        $args['foo'] = 'bar';
        
        // Or using accessors:
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
        // Merge defaults values without override
        $args->merge(self::DEFAULTS);
        
        // Merge and override existing values
        $args->merge(self::DEFAULTS, override: true);
    }
}
```
