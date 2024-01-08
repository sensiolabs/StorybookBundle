<?php

namespace Storybook\Command;

use Symfony\Component\AssetMapper\ImportMap\ImportMapConfigReader;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand('storybook:dump-importmap', hidden: true)]
/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class DumpImportMapCommand extends Command
{
    public function __construct(private readonly ImportMapConfigReader $importMapConfigReader)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        foreach ($this->importMapConfigReader->getEntries() as $entry) {
            $output->writeln(sprintf("import '%s';", $entry->path));
        }

        return self::SUCCESS;
    }
}
