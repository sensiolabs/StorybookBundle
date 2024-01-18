<?php

namespace Storybook\Tests\Functional\EventListener;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CorsListenerTest extends WebTestCase
{
    public function testCorsListener()
    {
        $client = static::createClient();

        $client->request('GET', '/_storybook/render/dummy');

        $this->assertResponseHeaderSame('Access-Control-Allow-Origin', 'http://localhost:6006');
    }
}
