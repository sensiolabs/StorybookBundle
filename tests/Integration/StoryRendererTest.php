<?php

namespace Storybook\Tests\Integration;

use Storybook\Args;
use Storybook\Exception\UnauthorizedStoryException;
use Storybook\Story;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class StoryRendererTest extends KernelTestCase
{
    /**
     * @dataProvider getInvalidTemplates
     */
    public function testRenderStoryWithRestrictedContentThrowsException(string $template)
    {
        self::bootKernel();

        $renderer = static::getContainer()->get('storybook.story_renderer');
        $story = new Story('story', $template, new Args());

        $this->expectException(UnauthorizedStoryException::class);

        $renderer->render($story);
    }

    public static function getInvalidTemplates(): iterable
    {
        yield 'function' => ['
            {{ unauthorized() }}
        '];

        yield 'tag' => ['
            {% unauthorized %}
            {% endunauthorized %}
        '];

        yield 'filter' => ['
            {{ "foo"|unauthorized }}
        '];

        yield 'property' => ['
            {{ dummy_global.unauthorizedProperty }}
        '];

        yield 'property accessor' => ['
            {{ dummy_global.unauthorizedPrivateProperty }}
        '];

        yield 'method' => ['
            {{ dummy_global.unauthorizedMethod }}
        '];

        yield 'unauthorized content before function-style component' => ['
            {{ unauthorized() }}
            {{ component("AnonymousComponent") }}
        '];

        yield 'unauthorized content after function-style component' => ['
            {{ component("AnonymousComponent") }}
            {{ unauthorized() }}
        '];

        yield 'unauthorized content before tag-style component' => ['
            {{ unauthorized() }}
            {% component "AnonymousComponent" %}{% endcomponent %}
        '];

        yield 'unauthorized after before tag-style component' => ['
            {% component "AnonymousComponent" %}{% endcomponent %}
            {{ unauthorized() }}
        '];
    }

    /**
     * @dataProvider getValidTemplates
     */
    public function testRenderStoryWithAllowedContent(string $template, array $args = [])
    {
        self::bootKernel();

        $renderer = static::getContainer()->get('storybook.story_renderer');
        $story = new Story('story', $template, new Args($args));

        $content = $renderer->render($story);

        $this->assertIsString($content);
    }

    public static function getValidTemplates(): iterable
    {
        yield 'access story args' => ['
            {{ args.foo }}
        ', ['foo' => 'bar']];

        yield 'authorized property' => ['
            {{ dummy_global.authorizedProperty }}
        '];

        yield 'authorized property accessor' => ['
            {{ dummy_global.authorizedPrivateProperty }}
        '];

        yield 'authorized method' => ['
            {{ dummy_global.authorizedMethod }}
        '];

        yield 'authorized function' => ['
            {{ authorized() }}
        '];

        yield 'authorized filter' => ['
            {{ "foo"|authorized }}
        '];

        yield 'authorized tag' => ['
            {% authorized %}{% endauthorized %}
        '];

        yield 'unauthorized function in function-style component' => ['
            {{ component("UnauthorizedFunction") }}
        '];

        yield 'unauthorized function in tag-style component' => ['
            {% component "UnauthorizedFunction" %}
            {% endcomponent %}
        '];

        yield 'unauthorized tag in component' => ['
            {{ component("UnauthorizedTag") }}
        '];

        yield 'unauthorized tag in tag-style component' => ['
            {% component "UnauthorizedTag" %}
            {% endcomponent %}
        '];

        yield 'unauthorized filter in function-style component' => ['
            {{ component("UnauthorizedFilter") }}
        '];

        yield 'unauthorized filter in tag-style component' => ['
            {% component "UnauthorizedFilter" %}
            {% endcomponent %}
        '];

        yield 'unauthorized property in function-style component' => ['
            {{ component("UnauthorizedProperty") }}
        '];

        yield 'unauthorized property in tag-style component' => ['
            {% component "UnauthorizedProperty" %}
            {% endcomponent %}
        '];

        yield 'unauthorized method in function-style component' => ['
            {{ component("UnauthorizedMethod") }}
        '];

        yield 'unauthorized method in tag-style component' => ['
            {% component "UnauthorizedMethod" %}
            {% endcomponent %}
        '];
    }

    public function testComponentUsingTrait()
    {
        self::bootKernel();

        $renderer = static::getContainer()->get('storybook.story_renderer');

        $story = new Story('story', '<twig:ComponentUsingTrait />', new Args());

        $content = $renderer->render($story);

        $this->assertEquals('bar', $content);
    }
}
