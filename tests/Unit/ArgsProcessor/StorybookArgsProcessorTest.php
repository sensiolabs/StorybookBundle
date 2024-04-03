<?php

namespace Storybook\Tests\Unit\ArgsProcessor;

use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Storybook\Args;
use Storybook\ArgsProcessor\ArgsProcessorInterface;
use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;

class StorybookArgsProcessorTest extends TestCase
{
    /**
     * @dataProvider getExtractTests
     */
    public function testExtractRequest(array $json, array $expected)
    {
        $request = Request::create('/', content: json_encode($json));
        $request = RequestAttributesHelper::withStorybookAttributes($request, ['story' => 'story']);
        $argsProcessor = new StorybookArgsProcessor();

        $data = $argsProcessor->process($request);

        $this->assertSame($expected, $data->toArray());
    }

    public function getExtractTests(): iterable
    {
        yield from [
            'no data' => [[], []],
            'no args' => [['foo' => 'bar'], []],
            'empty args' => [['args' => []], []],
            'some args' => [['args' => ['foo' => 'bar']], ['foo' => 'bar']],
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

        $processor->expects($this->once())->method('__invoke')->with(
            $this->equalTo(new Args(['foo' => 'bar']))
        );

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
        $argsProcessor->addProcessor(new class() implements ArgsProcessorInterface {
            public function __invoke(Args $args): void
            {
                $args->merge(['foo' => 'first']);
            }
        }, 'story');
        $argsProcessor->addProcessor(new class() implements ArgsProcessorInterface {
            public function __invoke(Args $args): void
            {
                $args->merge(['bar' => 'value']);
            }
        }, null);
        $argsProcessor->addProcessor(new class() implements ArgsProcessorInterface {
            public function __invoke(Args $args): void
            {
                if (isset($args['bar'])) {
                    $args['foo'] = 'second';
                }
            }
        }, 'story');

        $request = $this->createRequest('story');

        $this->assertEquals(new Args(['bar' => 'value', 'foo' => 'second']), $argsProcessor->process($request));
    }

    private function createRequest(string $story, array $args = []): Request
    {
        $request = new Request(request: ['args' => $args]);

        return RequestAttributesHelper::withStorybookAttributes($request, ['story' => $story]);
    }

    private function createProcessorMock(): MockObject|ArgsProcessorInterface
    {
        return $this->createMock(ArgsProcessorInterface::class);
    }
}
