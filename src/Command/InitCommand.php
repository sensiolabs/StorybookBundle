<?php

namespace Storybook\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Path;
use Twig\Environment;

#[AsCommand(name: 'storybook:init', description: 'Some desc')]
class InitCommand extends Command
{
    public function __construct(private readonly Environment $twig, private readonly string $runtimeDir, private readonly string $previewTemplate)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $content = $this->twig->render($this->previewTemplate);

        $fs = new Filesystem();

        $fs->dumpFile(Path::join($this->runtimeDir, 'preview', 'preview.ejs'), $content);

        $io->success('Content generated');

        return self::SUCCESS;
    }
}
