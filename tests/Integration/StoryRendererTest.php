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

        yield 'unauthorized content before component' => ['
            {{ unauthorized() }}
            <twig:UnauthorizedFunction />
        '];

        yield 'unauthorized content after component' => ['
            <twig:UnauthorizedFunction />
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

        yield 'unauthorized function in component' => ['
            <twig:UnauthorizedFunction />
        '];

        yield 'unauthorized tag in component' => ['
            <twig:UnauthorizedTag />
        '];

        yield 'unauthorized filter in component' => ['
            <twig:UnauthorizedFilter />
        '];

        yield 'unauthorized property in component' => ['
            <twig:UnauthorizedProperty />
        '];

        yield 'unauthorized method in component' => ['
            <twig:UnauthorizedMethod />
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
