<?php

namespace Storybook\Maker;

use Symfony\Bundle\MakerBundle\Generator;
use Symfony\UX\TwigComponent\ComponentFactory;

class StoryRenderer
{
    public function __construct(
        private Generator $generator,
        private ComponentFactory $componentFactory,
        private string $storiesPath,
    ) {
    }

    public function render(string $componentName): void
    {
        $componentMetadata = $this->componentFactory->metadataFor($componentName);

        $this->generator->generateFile($this->storiesPath.'/'.$componentName.'.stories.js', __DIR__.'/../Resources/skeleton/Story.tpl.php', [
            'componentName' => $componentName,
            'template' => $componentMetadata->getTemplate(),
        ]);

        $this->generator->writeChanges();
    }
}
