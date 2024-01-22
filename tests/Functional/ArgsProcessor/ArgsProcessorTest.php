<?php

namespace Storybook\Tests\Functional\ArgsProcessor;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ArgsProcessorTest extends WebTestCase
{
    public function testCustomArgsProcessorIsCalled()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '_storybook/render/args-processor');

        $this->assertResponseIsSuccessful();

        $this->assertStringContainsString('Prop1: foo', $crawler->filter('div')->text());
    }
}
