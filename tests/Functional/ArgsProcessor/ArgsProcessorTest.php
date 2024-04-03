<?php

namespace Storybook\Tests\Functional\ArgsProcessor;

use Storybook\Tests\StoryTestTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ArgsProcessorTest extends WebTestCase
{
    use StoryTestTrait;

    public function testCustomArgsProcessorIsCalled()
    {
        $client = static::createClient();
        $client->catchExceptions(false);

        $crawler = $this->renderStory($client, 'args-processor', []);

        $this->assertResponseIsSuccessful();

        $this->assertStringContainsString('Prop1: foo', $crawler->filter('div')->text());
    }
}
