<?php

namespace Storybook\Tests\Unit\Controller;

use PHPUnit\Framework\TestCase;
use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Controller\StorybookController;
use Storybook\Exception\RenderException;
use Storybook\Exception\TemplateNotFoundException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;
use Twig\Error\Error;
use Twig\Error\LoaderError;

class StorybookControllerTest extends TestCase
{
    public function testControllerReturnsResponse()
    {
        $twig = $this->createMock(Environment::class);
        $argsProcessor = new StorybookArgsProcessor();

        $controller = new StorybookController($twig, $argsProcessor);

        $request = new Request();
        $id = 'story-id';

        $twig->expects($this->once())->method('render')
            ->with(sprintf('@Stories/%s.html.twig', $id), $this->arrayHasKey('args'))
            ->willReturn('');

        $response = $controller($request, $id);

        $this->assertInstanceOf(Response::class, $response);
    }

    public function testTemplateNotFoundIsThrownIfTemplateCantBeLoaded()
    {
        $twig = $this->createMock(Environment::class);
        $argsProcessor = new StorybookArgsProcessor();

        $controller = new StorybookController($twig, $argsProcessor);

        $request = new Request();
        $id = 'story-id';

        $twig->expects($this->once())->method('render')
            ->willThrowException(new LoaderError(''));

        $this->expectException(TemplateNotFoundException::class);
        $controller($request, $id);
    }

    public function testRenderExceptionIsThrownIfTemplateCantBeRendered()
    {
        $twig = $this->createMock(Environment::class);
        $argsProcessor = new StorybookArgsProcessor();

        $controller = new StorybookController($twig, $argsProcessor);

        $request = new Request();
        $id = 'story-id';

        $twig->expects($this->once())->method('render')
            ->willThrowException(new Error(''));

        $this->expectException(RenderException::class);
        $controller($request, $id);
    }
}
