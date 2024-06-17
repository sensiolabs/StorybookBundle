<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent]
class ProductTable
{
    public function getProducts(): array
    {
        throw new \LogicException('This method should not be called');
    }
}
