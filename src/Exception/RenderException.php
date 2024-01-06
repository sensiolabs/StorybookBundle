<?php

namespace Storybook\Exception;

class RenderException extends \RuntimeException implements ExceptionInterface
{
    public function __construct(string $message = "", ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
    }
}
