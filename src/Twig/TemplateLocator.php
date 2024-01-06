<?php

namespace Storybook\Twig;

use Symfony\Component\Filesystem\Path;

class TemplateLocator
{
    public function __construct(private readonly string $projectDir)
    {
    }

  public function locateTemplate(string $id): string
  {
      // TODO: cache this
      $file = \file_get_contents(Path::join($this->projectDir, 'var/storybook/stories/storiesMap.json'));
      $map = json_decode($file, true);

      return \sprintf('@Stories/%s.html.twig', $map[$id]);
  }
}
