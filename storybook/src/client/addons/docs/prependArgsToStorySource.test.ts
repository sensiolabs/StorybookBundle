import { prependArgsToStorySource } from './prependArgsToStorySource';
import dedent from 'ts-dedent';

describe('prependArgsToStorySource', () => {
    it('Adds args', () => {
        const source = dedent`
        <twig:Component :prop="prop" />
        `;

        const args = {
            prop: 'foo',
            fnProp: () => {}, // Functions should not be dumped
            objectProp: {
                foo: 'foo',
                bar: {
                    baz: 'baz',
                },
            },
            arrayProp: ['a', 2, null],
        };

        const res = prependArgsToStorySource(source, args);

        // language=twig
        expect(res).toEqual(dedent`
        {% set prop = 'foo' %}
        {% set objectProp = {
            'foo': 'foo',
            'bar': {
                'baz': 'baz'
            }
        } %}
        {% set arrayProp = [
            'a',
            2,
            null
        ] %}

        <twig:Component :prop="prop" />
        `);
    });
});
