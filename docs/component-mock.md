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
