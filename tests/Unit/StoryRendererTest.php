<?php

namespace Storybook\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Storybook\Args;
use Storybook\Exception\RenderException;
use Storybook\Exception\UnauthorizedStoryException;
use Storybook\Story;
use Storybook\StoryRenderer;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Sandbox\SecurityError;

class StoryRendererTest extends TestCase
{
    public function testRender()
    {
        $twig = $this->createMock(Environment::class);
        $renderer = new StoryRenderer($twig);

        $twig
            ->expects($this->once())
            ->method('render')
            ->with(
                $this->isType('string'),
                $this->isType('array')
            );

        $story = new Story(
            'story',
            'story.html.twig',
            '',
            new Args()
        );

        $renderer->render($story);
    }

    /**
     * @dataProvider twigErrorProvider
     *
     * @param class-string $expectedException
     */
    public function testExceptions(Error $twigError, string $expectedException)
    {
        $twig = $this->createMock(Environment::class);
        $renderer = new StoryRenderer($twig);

        $twig->expects($this->once())->method('render')
            ->willThrowException($twigError);

        $story = new Story(
            'story',
            'story.html.twig',
            '',
            new Args()
        );

        $this->expectException($expectedException);
        $renderer->render($story);
    }

    public static function twigErrorProvider(): iterable
    {
        yield 'sandbox error' => [
            new SecurityError(''),
            UnauthorizedStoryException::class,
        ];

        yield 'twig error' => [
            new Error(''),
            RenderException::class,
        ];
    }
}
