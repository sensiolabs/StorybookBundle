import { buildVariableDeclarations } from './buildVariableDeclarations';
import { dedent } from 'ts-dedent';

describe('buildVariableDeclarations', () => {
    it('Declares args', () => {
        const args = {
            prop: 'foo',
            fnProp: () => {}, // Functions should not be dumped
            undefinedProp: undefined,
            objectProp: {
                foo: 'foo',
                skipped: undefined,
                bar: {
                    baz: 'baz',
                },
            },
            arrayProp: ['a', 2, null, undefined],
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
            baz: {
                nested: {
                    fn: () => {},
                },
            },
        };

        const res = buildVariableDeclarations(args);

        // language=twig
        expect(res).toEqual(dedent`
        {% set prop = 'dummy' %}
        `);
    });

    it('escapes single quotes in strings and object keys', () => {
        const args = {
            label: "it's",
            objectProp: {
                "owner's": "company's",
            },
        };

        const res = buildVariableDeclarations(args);

        // language=twig
        expect(res).toEqual(dedent`
        {% set label = 'it\\'s' %}
        {% set objectProp = {
            'owner\\'s': 'company\\'s'
        } %}
        `);
    });
});
