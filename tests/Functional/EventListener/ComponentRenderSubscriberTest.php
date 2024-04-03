<?php

namespace Storybook\Tests\Functional\EventListener;

use Storybook\Tests\StoryTestTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ComponentRenderSubscriberTest extends WebTestCase
{
    use StoryTestTrait;

    public function testRenderMockedComponent()
    {
        $client = static::createClient();

        $crawler = $this->renderStory($client, 'story-with-mocked-component');

        $this->assertResponseIsSuccessful();

        $text = $crawler->filter('div')->text();

        $this->assertStringContainsString('Prop1: prop1', $text);
        $this->assertStringContainsString('Prop2: mocked prop2', $text);
        $this->assertStringContainsString('Prop3: mocked prop3', $text);
        $this->assertStringContainsString('Prop4: mocked prop4', $text);
        $this->assertStringContainsString('Prop5: prop5', $text);
        $this->assertStringContainsString('ComputedProp: mocked computedProp', $text);
    }
}
