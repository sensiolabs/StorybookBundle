<?php

namespace Storybook\Tests\Functional\Controller;

use Storybook\Tests\StoryTestTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class StorybookControllerTest extends WebTestCase
{
    use StoryTestTrait;

    public function testRenderStory()
    {
        $client = static::createClient();
        $crawler = $this->renderStory($client, 'story', [
            'prop1' => 'Prop1 value',
        ]);

        $this->assertResponseIsSuccessful();

        $this->assertStringContainsString('Prop1: Prop1 value', $crawler->text());
    }

    public function testRenderInvalidStoryThrowsBadRequest()
    {
        $client = static::createClient();
        $this->renderStory($client, 'invalid-story', [
            'prop1' => 'Prop1 value',
        ]);

        $this->assertResponseStatusCodeSame(400);
    }
}
