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
use Twig\Sandbox\SecurityPolicyInterface;

class StoryRendererTest extends TestCase
{
    public function testRender()
    {
        $twig = $this->createMock(Environment::class);
        $policy = $this->createMock(SecurityPolicyInterface::class);
        $renderer = new StoryRenderer($twig, $policy, false);

        $twig
            ->expects($this->once())
            ->method('render')
            ->with(
                $this->isType('string'),
                $this->logicalAnd(
                    $this->isType('array'),
                    $this->arrayHasKey('args'),
                    $this->callback(static fn (array $context) => $context['args'] instanceof Args)
                ),
            );

        $story = new Story(
            'story',
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
        $policy = $this->createMock(SecurityPolicyInterface::class);
        $renderer = new StoryRenderer($twig, $policy, false);

        $twig->expects($this->once())->method('render')
            ->willThrowException($twigError);

        $story = new Story(
            'story',
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
