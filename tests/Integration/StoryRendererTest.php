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

        yield 'variable property' => ['
            {{ unauthorized_var.foo }}
        '];

        yield 'variable method' => ['
            {{ unauthorized_var.bar }}
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
    public function testRenderStoryWithRestrictedContentFromInnerComponentIsOk(string $template)
    {
        self::bootKernel();

        $renderer = static::getContainer()->get('storybook.story_renderer');
        $story = new Story('story', $template, new Args());

        $content = $renderer->render($story);

        $this->assertIsString($content);
    }

    public static function getValidTemplates(): iterable
    {
        yield 'function in component' => ['
            <twig:UnauthorizedFunction />
        '];

        yield 'tag in component' => ['
            <twig:UnauthorizedTag />
        '];

        yield 'filter in component' => ['
            <twig:UnauthorizedFilter />
        '];

        yield 'variable property in component' => ['
            <twig:UnauthorizedVariableProperty />
        '];

        yield 'variable method in component' => ['
            <twig:UnauthorizedVariableMethod />
        '];
    }
}
