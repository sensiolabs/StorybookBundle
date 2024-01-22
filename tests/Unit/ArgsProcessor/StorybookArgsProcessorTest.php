<?php

namespace Storybook\Tests\Unit\ArgsProcessor;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;

class StorybookArgsProcessorTest extends TestCase
{
    /**
     * @dataProvider getExtractTests
     */
    public function testExtractRequest(string $queryString, array $expected)
    {
        $request = Request::create('/'.('' !== $queryString ? '?'.$queryString : ''));
        $request = RequestAttributesHelper::withStorybookAttributes($request, ['story' => 'story']);
        $argsProcessor = new StorybookArgsProcessor();

        $data = $argsProcessor->process($request);

        $this->assertSame($expected, $data);
    }

    public function getExtractTests(): iterable
    {
        yield from [
            'no data' => ['', []],
            'scalar data' => ['foo=bar&baz=42', ['foo' => 'bar', 'baz' => 42]],
            'boolean' => ['foo=true&bar=false', ['foo' => true, 'bar' => false]],
            'null' => ['foo=null', ['foo' => null]],
            'array' => ['foo=["a", "b"]', ['foo' => ['a', 'b']]],
            'object' => ['foo={"prop": "value"}', ['foo' => ['prop' => 'value']]],
        ];
    }

    public function testGlobalArgsProcessor()
    {
        $argsProcessor = new StorybookArgsProcessor();
        $processor = $this->createProcessorMock();
        $argsProcessor->addProcessor($processor, null);

        $requests = [
            $this->createRequest('story'),
            $this->createRequest('other-story'),
        ];

        // Ensure processor is executed for each request
        $processor->expects($this->exactly(\count($requests)))->method('__invoke');

        foreach ($requests as $request) {
            $argsProcessor->process($request);
        }
    }

    public function testOriginalDataArePassedInProcessorArgs()
    {
        $argsProcessor = new StorybookArgsProcessor();
        $processor = $this->createProcessorMock();
        $argsProcessor->addProcessor($processor, null);

        $request = $this->createRequest('story', ['foo' => 'bar']);

        $processor->expects($this->once())->method('__invoke')->with(['foo' => 'bar']);
        $argsProcessor->process($request);
    }

    public function testStoryArgsProcessorIsNotExecutedForAnotherStory()
    {
        $argsProcessor = new StorybookArgsProcessor();
        $processor = $this->createProcessorMock();
        $argsProcessor->addProcessor($processor, 'story');

        $processor->expects($this->never())->method('__invoke');

        $request = $this->createRequest('other-story');
        $argsProcessor->process($request);
    }

    public function testStoryArgsProcessorIsExecutedForConfiguredStory()
    {
        $argsProcessor = new StorybookArgsProcessor();
        $processor = $this->createProcessorMock();
        $argsProcessor->addProcessor($processor, 'story');

        $processor->expects($this->once())->method('__invoke');

        $request = $this->createRequest('story');
        $argsProcessor->process($request);
    }

    public function testMultipleProcessorsAreExecutedInOrder()
    {
        $argsProcessor = new StorybookArgsProcessor();
        $argsProcessor->addProcessor(new class() {
            public function __invoke(array &$args): void
            {
                $args += ['foo' => 'first'];
            }
        }, 'story');
        $argsProcessor->addProcessor(new class() {
            public function __invoke(array &$args): void
            {
                $args += ['bar' => 'value'];
            }
        }, null);
        $argsProcessor->addProcessor(new class() {
            public function __invoke(array &$args): void
            {
                if (isset($args['bar'])) {
                    $args['foo'] = 'second';
                }
            }
        }, 'story');

        $request = $this->createRequest('story');

        $this->assertEquals(['bar' => 'value', 'foo' => 'second'], $argsProcessor->process($request));
    }

    private function createRequest(string $story, array $queryParameters = []): Request
    {
        $request = new Request($queryParameters);

        return RequestAttributesHelper::withStorybookAttributes($request, ['story' => $story]);
    }

    private function createProcessorMock(): MockObject|callable
    {
        return $this
            ->getMockBuilder(\stdClass::class)
            ->addMethods(['__invoke'])
            ->getMock();
    }
}
