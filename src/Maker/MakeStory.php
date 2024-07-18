<?php

namespace Storybook\Maker;

use Symfony\Bundle\MakerBundle\ConsoleStyle;
use Symfony\Bundle\MakerBundle\DependencyBuilder;
use Symfony\Bundle\MakerBundle\Generator;
use Symfony\Bundle\MakerBundle\InputConfiguration;
use Symfony\Bundle\MakerBundle\Maker\AbstractMaker;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Question\Question;

/**
 * @method string getCommandDescription()
 */
class MakeStory extends AbstractMaker
{
    public function __construct(
        private StoryRenderer $storyRenderer,
    ) {
    }

    public static function getCommandName(): string
    {
        return 'make:storybook:story';
    }

    public static function getCommandDescription(): string
    {
        return 'Creates a new Storybook story';
    }

    public function configureCommand(Command $command, InputConfiguration $inputConfig): void
    {
        $command
            ->addArgument('component', InputArgument::OPTIONAL, 'The name of the component you want a story for')
        ;
    }

    public function interact(InputInterface $input, ConsoleStyle $io, Command $command): void
    {
        if (null === $input->getArgument('component')) {
            $question = new Question('What is the name of the component?');
            $question->setValidator(fn ($value) => null !== $value);
            $question->setMaxAttempts(3);
            $input->setArgument('component', $io->askQuestion($question));
        }
    }

    public function generate(InputInterface $input, ConsoleStyle $io, Generator $generator)
    {
        $componentName = $input->getArgument('component');

        $this->storyRenderer->render($componentName);
    }

    public function configureDependencies(DependencyBuilder $dependencies)
    {
    }
}
