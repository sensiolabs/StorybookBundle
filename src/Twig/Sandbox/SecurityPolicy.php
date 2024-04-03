<?php

namespace Storybook\Twig\Sandbox;

use Twig\Markup;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Sandbox\SecurityNotAllowedMethodError;
use Twig\Sandbox\SecurityNotAllowedPropertyError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityPolicyInterface;
use Twig\Template;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class SecurityPolicy implements SecurityPolicyInterface
{
    public const WILDCARD = '*';

    public function __construct(
        private readonly array $deniedFunctions = [],
        private readonly array $deniedFilters = [],
        private readonly array $deniedTags = [],
        private readonly array $deniedProperties = [],
        private readonly array $deniedMethods = [],
    ) {
    }

    public function checkSecurity($tags, $filters, $functions): void
    {
        foreach ($tags as $tag) {
            if (\in_array($tag, $this->deniedTags)) {
                throw new SecurityNotAllowedTagError(sprintf('Tag "%s" is not allowed.', $tag), $tag);
            }
        }

        foreach ($filters as $filter) {
            if (\in_array($filter, $this->deniedFilters)) {
                throw new SecurityNotAllowedFilterError(sprintf('Filter "%s" is not allowed.', $filter), $filter);
            }
        }
        foreach ($functions as $function) {
            if (\in_array($function, $this->deniedFunctions)) {
                throw new SecurityNotAllowedFunctionError(sprintf('Function "%s" is not allowed.', $function), $function);
            }
        }
    }

    public function checkMethodAllowed($obj, $method): void
    {
        if ($obj instanceof Template || $obj instanceof Markup) {
            return;
        }
        $method = strtr($method, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz');
        foreach ($this->deniedMethods as $class => $methods) {
            if ($obj instanceof $class) {
                if (!empty(array_intersect([$method, self::WILDCARD], $methods))) {
                    $class = $obj::class;
                    throw new SecurityNotAllowedMethodError(sprintf('Calling "%s" method on a "%s" object is not allowed.', $method, $class), $class, $method);
                }
            }
        }
    }

    public function checkPropertyAllowed($obj, $property): void
    {
        foreach ($this->deniedProperties as $class => $properties) {
            if ($obj instanceof $class) {
                if (!empty(array_intersect([$property, self::WILDCARD], $properties))) {
                    $class = $obj::class;
                    throw new SecurityNotAllowedPropertyError(sprintf('Calling "%s" property on a "%s" object is not allowed.', $property, $class), $class, $property);
                }
            }
        }
    }
}
