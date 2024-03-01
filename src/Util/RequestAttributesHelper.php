<?php

namespace Storybook\Util;

use Symfony\Component\HttpFoundation\Request;

/**
 * @static
 *
 * @internal
 */
final class RequestAttributesHelper
{
    public const ATTRIBUTE_NAME = '_storybook';

    public const PROXY_HEADER_NAME = 'X-Storybook-Proxy';

    public static function isStorybookRequest(Request $request): bool
    {
        return $request->attributes->has(self::ATTRIBUTE_NAME);
    }

    /**
     * @throws \InvalidArgumentException if attributes could not be created
     */
    public static function withStorybookAttributes(Request $request, array $attributes): Request
    {
        $request->attributes->set(self::ATTRIBUTE_NAME, StorybookAttributes::from($attributes));

        return $request;
    }

    /**
     * @throws \LogicException if the request doesn't have Storybook attributes
     */
    public static function getStorybookAttributes(Request $request): StorybookAttributes
    {
        $attributes = $request->attributes->get(self::ATTRIBUTE_NAME);
        if (!$attributes instanceof StorybookAttributes) {
            if (!self::isStorybookRequest($request)) {
                $message = sprintf('Request is missing a "%s" attribute.', self::ATTRIBUTE_NAME);
            } else {
                $message = sprintf('Expecting a instance of "%s" in the "%s" request attributes, but found "%s".', StorybookAttributes::class, self::ATTRIBUTE_NAME, get_debug_type($attributes));
            }
            throw new \LogicException($message);
        }

        return $attributes;
    }

    public static function isProxyRequest(Request $request): bool
    {
        return $request->headers->has(self::PROXY_HEADER_NAME);
    }
}
