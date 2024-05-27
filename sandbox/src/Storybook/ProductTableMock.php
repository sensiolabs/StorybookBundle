<?php

namespace App\Storybook;

use App\Twig\Components\ProductTable;
use Storybook\Attributes\AsComponentMock;
use Storybook\Attributes\PropertyMock;

#[AsComponentMock(ProductTable::class)]
class ProductTableMock
{
    #[PropertyMock]
    public function products(): array
    {
        return [
            ['name' => 'Product 1', 'color' => 'Silver'],
            ['name' => 'Product 2', 'color' => 'Black'],
            ['name' => 'Product 3', 'color' => 'Green'],
        ];
    }
}
