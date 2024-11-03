<?php

namespace Storybook\Tests\Fixtures\SandboxTest;

use Twig\Node\Node;
use Twig\Token;
use Twig\TokenParser\AbstractTokenParser;

class AuthorizedTagTokenParser extends AbstractTokenParser
{
    public function parse(Token $token): Node
    {
        $stream = $this->parser->getStream();
        $stream->expect(Token::BLOCK_END_TYPE);
        $this->parser->subparse($this->decideBlockEnd(...), true);
        $stream->expect(Token::BLOCK_END_TYPE);

        return new Node();
    }

    public function decideBlockEnd(Token $token): bool
    {
        return $token->test('endauthorized');
    }

    public function getTag(): string
    {
        return 'authorized';
    }
}
