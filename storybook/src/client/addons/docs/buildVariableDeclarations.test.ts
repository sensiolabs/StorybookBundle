import { buildVariableDeclarations } from './buildVariableDeclarations';
import dedent from 'ts-dedent';

describe('buildVariableDeclarations', () => {
    it('Declares args', () => {
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

        const res = buildVariableDeclarations(args);

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
        `);
    });

    it('Fold empty objects and arrays', () => {
        const args = {
            prop: 'dummy',
            foo: {},
            bar: [],
        };

        const res = buildVariableDeclarations(args);

        // language=twig
        expect(res).toEqual(dedent`
        {% set prop = 'dummy' %}
        {% set foo = {} %}
        {% set bar = [] %}
        `);
    });

    it('Removes objects and arrays that only contains irrelevant args', () => {
        const args = {
            prop: 'dummy',
            foo: {
                fn: () => {},
            },
            bar: [() => {}],
        };

        const res = buildVariableDeclarations(args);

        // language=twig
        expect(res).toEqual(dedent`
        {% set prop = 'dummy' %}
        `);
    });
});
