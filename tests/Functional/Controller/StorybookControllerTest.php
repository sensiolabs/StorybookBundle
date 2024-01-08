<?php

namespace Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class StorybookControllerTest extends WebTestCase
{
    public function testRenderStory()
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '_storybook/render/story?prop1=Prop1+value');

        $this->assertResponseIsSuccessful();

        $this->assertStringContainsString('Prop1: Prop1 value', $crawler->text());
    }

    public function testUnknownStoryThrowsNotFound()
    {
        $client = static::createClient();
        $client->request('GET', '_storybook/render/unknown');

        $this->assertResponseStatusCodeSame(404, 'Not found stories must return HTTP 404');
    }
}
