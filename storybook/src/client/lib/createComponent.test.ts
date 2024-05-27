import { createComponent } from './createComponent';
import dedent from 'ts-dedent';

describe('createComponent', () => {
    it('creates a component template with props', () => {
        const args = {
            foo: 'bar',
            baz: ['a', 'b'],
        };

        expect(createComponent('Component', args).getSource()).toEqual(dedent`
            <twig:Component :foo="foo" :baz="baz" />
        `);
    });

    it('bind actions in data-storybook-callback attribute', () => {
        const args = {
            click: () => {},
            hover: () => {},
        };

        expect(createComponent('Component', args).getSource()).toEqual(dedent`
            <twig:Component data-storybook-callbacks="{{ _context['click'] }} {{ _context['hover'] }}" />
        `);
    });
});
