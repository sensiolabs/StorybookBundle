<?php

namespace App\Twig\Components\Storybook;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;

#[AsLiveComponent]
final class Form
{
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public string $value = '';

    #[LiveProp(writable: true)]
    public bool $complete = false;
}
