<?php

namespace Storybook\Command;

use Storybook\Event\GeneratePreviewEvent;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Twig\Environment;

/**
 * Render the preview template.
 *
 * This command is not intended to be run by users.
 *
 * @internal
 */
#[AsCommand('storybook:generate-preview', hidden: true)]
final class GeneratePreviewCommand extends Command
{
    public function __construct(private readonly Environment $twig, private readonly EventDispatcherInterface $eventDispatcher)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->eventDispatcher->dispatch(new GeneratePreviewEvent());

        $content = $this->twig->render('@Storybook/preview.html.twig');

        $output->writeln($content);

        return self::SUCCESS;
    }
}
