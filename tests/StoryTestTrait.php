<?php

namespace Storybook\Tests;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\DomCrawler\Crawler;

trait StoryTestTrait
{
    private function renderStory(KernelBrowser $client, string $story, array $args = []): Crawler
    {
        $uri = \sprintf('_storybook/render/%s', $story);

        return $client->request('POST', $uri, content: json_encode([
            'template' => file_get_contents(__DIR__.'/Fixtures/storybook/stories/'.$story.'.html.twig'),
            'args' => $args,
        ]));
    }
}
