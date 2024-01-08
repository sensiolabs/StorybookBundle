<?php

if (!file_exists(__DIR__.'/src')) {
    exit(0);
}

return (new PhpCsFixer\Config())
    ->setRules([
        '@PHPUnit75Migration:risky' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,
        'trailing_comma_in_multiline' => ['elements' => ['arrays', 'match', 'parameters']],
    ])
    ->setRiskyAllowed(true)
    ->setFinder(
        PhpCsFixer\Finder::create()
            ->in([__DIR__.'/src', __DIR__.'/tests'])
            ->notPath('#/Fixtures/#')
            ->notPath('#/var/cache/#')
    )
;
