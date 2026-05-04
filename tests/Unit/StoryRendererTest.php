<?php

namespace Storybook\Tests\Unit;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Storybook\Args;
use Storybook\Exception\RenderException;
use Storybook\Exception\UnauthorizedStoryException;
use Storybook\Story;
use Storybook\StoryRenderer;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Extension\SandboxExtension;
use Twig\Loader\ArrayLoader;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityPolicy;

class StoryRendererTest extends TestCase
{
    public function testRender(): void
    {
        $twig = $this->createTwig();
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
    public function testExceptions(Error $twigError, string $expectedException): void
    {
        $twig = $this->createTwig();
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

    /**
     * @return \Generator<string, array{Error, class-string<RenderException>|class-string<UnauthorizedStoryException>}>
     */
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

    /**
     * @return Environment&MockObject
     */
    private function createTwig(): Environment
    {
        $twig = $this->createMock(Environment::class);
        $twig->method('getLoader')->willReturn(new ArrayLoader());
        $twig->method('getExtension')->with(SandboxExtension::class)->willReturn(new SandboxExtension(new SecurityPolicy()));

        return $twig;
    }
}
