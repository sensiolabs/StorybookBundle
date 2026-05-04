<?php

namespace Storybook\Tests\Unit\Controller;

use PHPUnit\Framework\TestCase;
use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Controller\StorybookController;
use Storybook\StoryRenderer;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Twig\Environment;
use Twig\Extension\SandboxExtension;
use Twig\Loader\ArrayLoader;
use Twig\Sandbox\SecurityPolicy;

class StorybookControllerTest extends TestCase
{
    public function testControllerReturnsResponse(): void
    {
        $renderer = $this->createRenderer();
        $argsProcessor = new StorybookArgsProcessor();

        $controller = new StorybookController($renderer, $argsProcessor);

        $request = new Request(request: [
            'template' => '',
        ]);

        $id = 'story-id';

        $response = $controller($request, $id);

        $this->assertInstanceOf(Response::class, $response);
    }

    public function testBadRequestIsThrownWhenNoTemplateIsProvided(): void
    {
        $renderer = $this->createRenderer();
        $argsProcessor = new StorybookArgsProcessor();

        $controller = new StorybookController($renderer, $argsProcessor);

        $request = new Request();

        $id = 'story-id';

        $this->expectException(BadRequestHttpException::class);

        $controller($request, $id);
    }

    private function createRenderer(): StoryRenderer
    {
        $twig = $this->createMock(Environment::class);
        $twig->method('getLoader')->willReturn(new ArrayLoader());
        $twig->method('getExtension')->with(SandboxExtension::class)->willReturn(new SandboxExtension(new SecurityPolicy()));

        return new StoryRenderer($twig);
    }
}
