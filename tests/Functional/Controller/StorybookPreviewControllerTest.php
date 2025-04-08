<?php

namespace Storybook\Tests\Functional\Controller;

use Storybook\Tests\StoryTestTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DomCrawler\Crawler;

class StorybookPreviewControllerTest extends WebTestCase
{
    use StoryTestTrait;

    public function testPreview()
    {
        $client = static::createClient();
        $client->request('GET', '_storybook/preview');

        $this->assertResponseIsSuccessful();

        // Check that the preview contains the basic HTML structure
        $this->assertSelectorExists('html');
        $this->assertSelectorExists('head');
        $this->assertSelectorExists('body');
    }
}
