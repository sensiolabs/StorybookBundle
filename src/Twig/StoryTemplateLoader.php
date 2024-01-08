<?php

namespace Storybook\Twig;

use Symfony\Component\Filesystem\Path;
use Twig\Loader\FilesystemLoader;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StoryTemplateLoader extends FilesystemLoader
{
    public function __construct(string $runtimeDir)
    {
        $path = Path::join($runtimeDir, 'stories');

        if (is_dir($path)) {
            $this->addPath($path, 'Stories');
        }

        parent::__construct();
    }
}
