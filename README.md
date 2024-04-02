# Storybook For Symfony

This bundle provides a basic integration for Storybook into a Symfony application using Twig Components.

> DISCLAIMER: \
> This bundle is under active development. Some features may not work as expected and the current documentation may be incomplete.

## Installation

Clone this repo and install the bundle in your project.

Initialize Storybook in your project:

```shell
bin/console storybook:init
```

This will create basic configuration files and add required dependencies to your `package.json`.  

Install new dependencies with: 
```shell
npm install
```

Ensure your Symfony server is running on the same address defined in your `main.ts` configuration file. Then run the Storybook dev server with:

```shell
npm run storybook
```

## Symfony configuration

### CORS

As the Symfony integration relies on the Storybook's server renderer, it makes requests to your Symfony server to render your stories. These requests are cross origins, so you have to configure Symfony to accept them from your Storybook instance.

There is two options to achieve this. You can either configure the Storybook host in the bundle, or use the popular [NelmioCorsBundle](https://symfony.com/bundles/NelmioCorsBundle/current/index.html). 

In the StorybookBundle: 

```yaml
# config/storybook.yaml
storybook: 
  server: http://localhost:6006 # This is the default
```

With NelmioCorsBundle:
```yaml
# config/storybook.yaml
storybook: 
  server: null # Disable CORS management in Storybook Bundle
```

```yaml
# config/nelmio_cors.yaml
nelmio_cors:
  # ...
  paths:
    '^/_storybook': 
      allow_origin: ['http://localhost:6006']
      allow_methods: ['GET']
```

## Customizing the preview iframe

To customize the iframe where your stories are rendered, you can override the preview template provided by the bundle:

```twig
{# templates/bundles/@StorybookBundle/preview.html.twig #}

{% extends '@!Storybook/preview.html.twig' %}

{% block previewHead %}
    {# render additional tags to <head> #}
{% endblock %}

{% block previewBody %}
    {# render additional tags to <body> #}
{% endblock %}
```

The rendered content of these blocks will be injected in the preview iframe, similarly to the [previewHead](https://storybook.js.org/docs/configure/story-rendering#adding-to-head) and [previewBody](https://storybook.js.org/docs/configure/story-rendering#adding-to-body) configurations.

### AssetMapper integration

To use Storybook with a project that uses the [AssetMapper component](https://symfony.com/doc/current/frontend/asset_mapper.html), you need to render your importmap in the preview template: 

```twig
{# templates/bundles/@StorybookBundle/preview.html.twig #}

{% extends '@!Storybook/preview.html.twig' %}

{% block previewHead %}
    {{ importmap('app') }}
{% endblock %}
```

Though, standard HMR will not work properly with AssetMapper. To register additional paths to watch and re-trigger the iframe compilation on change, update your `main.ts|js` configuration:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
    framework: {
        name: "@sensiolabs/storybook-symfony-webpack5",
        options: {
            // ...
            symfony: {
                // 👇 Add more paths to watch
                additionalWatchPaths: [
                    'assets', // Directories
                    'assets/app.js', // Files
                    'assets/**/*.js' // Glob patterns
                ],
            },
        },
    },
};
```

### TailwindBundle integration

If you use [TailwindBundle](https://symfony.com/bundles/TailwindBundle/current/index.html) to manage your CSS, you need to tell Storybook to watch the built CSS file, so the 
preview is refreshed with HMR on change:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
    framework: {
        name: "@sensiolabs/storybook-symfony-webpack5",
        options: {
            // ...
            symfony: {
                additionalWatchPaths: [
                    // ...
                    'var/tailwind/tailwind.built.css'
                ],
            },
        },
    },
};
```

### Live Components integration

To make [Live Components](https://symfony.com/bundles/ux-live-component/current/index.html) work in Storybook, you have to enable proxy for live component requests in the 
Storybook `main.ts|js` configuration:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
    framework: {
        name: "@sensiolabs/storybook-symfony-webpack5",
        options: {
            // ...
            symfony: {
                proxyPaths: [
                    // ...
                    // 👇 This is the live component route prefix usually set in config/routes/ux_live_component.yaml
                    '_components/',
                ],
            },
        },
    },
};
```

Thanks to this configuration, all requests made by live components to re-render themselves will be sent to the 
Symfony dev server.


## Writing stories

Example: 

```js
// stories/Button.stories.js

import { twig } from '@sensiolabs/storybook-symfony-webpack5';

const Button = twig`<twig:Button btnType="{{ args.primary ? 'primary' : 'secondary' }}">{{ args.label }}</twig:Button>`;

export default {
    title: 'Button',
    template: Button
};

export const Primary = {
    args: {
        primary: true,
        label: 'Button',
    },
};

export const Secondary = {
    args: {
        ...Primary.args,
        primary: false
    },
    template: Button, // You can pass a specific template for a story
};

```

## Mocking Twig components

One of the powerful features of Twig components is to use dependency injection to inject services (like Doctrine repositories) and consume them in property getters and other methods. Let's take the [`FeaturedProducts`](https://symfony.com/bundles/ux-twig-component/current/index.html#fetching-services) component from the official documentation:

```php
// src/Twig/Components/FeaturedProducts.php
namespace App\Twig\Components;

use App\Repository\ProductRepository;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent]
class FeaturedProducts
{
    private ProductRepository $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function getProducts(): array
    {
        // an example method that returns an array of Products
        return $this->productRepository->findFeatured();
    }
}
```

```twig
{# templates/components/FeaturedProducts.html.twig #}
<div>
    <h3>Featured Products</h3>

    {% for product in this.products %}
        ...
    {% endfor %}
</div>
```

That's pretty cool, but in your Storybook you probably don't want to use the _real_ `getProducts` implementation, which relies on `ProductRepository`. To bypass the original property resolution, you can create a Component Mock:

```php
// src/Storybook/Mock/FeaturedProductsMock.php

namespace App\Storybook\Mock;

use App\Twig\Components\FeaturedProducts;
use Storybook\Attributes\AsComponentMock;
use Storybook\Attributes\PropertyMock;

#[AsComponentMock(component: FeaturedProducts::class)]
class FeaturedProductsMock
{
    // Mock 'products' property for all stories:
    
    #[PropertyMock] // property argument is optional and defaults to the annotated method name
    public function products()
    {
        return [
            ['id' => 0, 'name' => 'Product 1', 'color' => 'Red'],
            ['id' => 1, 'name' => 'Product 2', 'color' => 'Green'],
        ];   
    }
    
    // Or use different implementations for specific stories:
    
    #[PropertyMock(property: 'products', stories: ['featured-products--story1', 'featured-products--story2'])]
    public function getFewProducts()
    {
        return [
            ['id' => 0, 'name' => 'Product 1', 'color' => 'Red'],
            ['id' => 1, 'name' => 'Product 2', 'color' => 'Green'],
        ];   
    }
    
    #[PropertyMock(property: 'products', stories: 'featured-products--story3')]
    public function getALotOfProducts()
    {
        return [
            ['id' => 0, 'name' => 'Product 1', 'color' => 'Red'],
            ['id' => 1, 'name' => 'Product 2', 'color' => 'Green'],
            // ...
            ['id' => 99, 'name' => 'Product 99', 'color' => 'Blue'],
        ];   
    }    
}
```

As Component Mocks are regular services, you can inject whatever you need, for example to delegate your fixtures management to an external service:

```php
// src/Storybook/Mock/FeaturedProductsMock.php

// ...

#[AsComponentMock(component: FeaturedProducts::class)]
class FeaturedProductsMock
{
    public function __construct(private readonly ProductFixturesProvider $fixturesProvider) 
    {
    }
    
    #[PropertyMock]
    public function products()
    {
        return $this->fixturesProvider->getSomeProducts();
    }    
}
```

If you need to access the original arguments passed to the method, or the original component instance, you can use the 
`MockInvocationContext`:

```php
// src/Storybook/Mock/FeaturedProductsMock.php

// ...

use Storybook\Mock\MockInvocationContext;

#[AsComponentMock(component: FeaturedProducts::class)]
class FeaturedProductsMock
{    
    #[PropertyMock]
    public function products(MockInvocationContext $context)
    {
        $context->component->prop; // Access to the component prop
        $context->originalArgs[0]; // Access to the first argument passed to the method
    }    
}
```


> Note: \
> Mocks will also bypass resolution of [computed properties](https://symfony.com/bundles/ux-twig-component/current/index.html#computed-properties), but be aware that the result will not be cached.

## Processing story args

Story's args are passed a JSON-encoded query parameters to the render request. By default, they are only decoded and injected in the Twig context on template rendering. You can customize these args before they are injected in the context with Args Processors:

```php
// src/Storybook/ArgsProcessor/MyArgsProcessor.php

namespace App\Storybook\ArgsProcessor;

use Storybook\Attributes\AsArgsProcessor;

#[AsArgsProcessor]
class MyArgsProcessor
{
    public function __invoke(array &$args): void
    {
        // Defaults arg 'foo' to 'bar' for all stories 
        $args += ['foo' => 'bar'];
    }
}
```

You can also restrict your processor to a specific subset of stories:

```php
// src/Storybook/ArgsProcessor/MyArgsProcessor.php

namespace App\Storybook\ArgsProcessor;

use Storybook\Attributes\AsArgsProcessor;

#[AsArgsProcessor(story: 'user-list--story1')]
#[AsArgsProcessor(story: 'user-list--story2')]
class MyArgsProcessor
{
    public function __invoke(array &$args): void
    {
        // Transform user's array data to object 
        foreach ($args['users'] as $key => $user) {
            $args['users'][$key] = new User($user['id'], $user['name']);
        } 
    }
}
```

# License

MIT License (MIT): see [LICENSE](./LICENSE).

# References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
