<?php

namespace Storybook\Tests\Functional\EventListener;

use Storybook\Tests\StoryTestTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ComponentRenderSubscriberTest extends WebTestCase
{
    use StoryTestTrait;

    /**
     * @dataProvider getStories
     */
    public function testRenderMockedComponent(string $story)
    {
        $client = static::createClient();

        $crawler = $this->renderStory($client, $story);

        $this->assertResponseIsSuccessful();

        $text = $crawler->filter('div')->text();

        $this->assertStringContainsString('Prop1: prop1', $text);
        $this->assertStringContainsString('Prop2: mocked prop2', $text);
        $this->assertStringContainsString('Prop3: mocked prop3', $text);
        $this->assertStringContainsString('Prop4: mocked prop4', $text);
        $this->assertStringContainsString('Prop5: prop5', $text);
        $this->assertStringContainsString('ComputedProp: mocked computedProp', $text);
    }

    public static function getStories(): iterable
    {
        yield 'Function style' => [
            'story' => 'story-with-mocked-component',
        ];

        yield 'Embedded style' => [
            'story' => 'story-with-mocked-component-embedded',
        ];
    }
}
