import { sanitize } from './sourceSanitizer';
import dedent from 'ts-dedent';

describe('sourceSanitizer', () => {
    it('Removes data-storybook-action attribute', () => {
        const source = dedent`
        <twig:Component :prop="prop" :data-storybook-action="click"/>
        `;

        const sanitized = sanitize(source);

        expect(sanitized).toEqual(dedent`
        <twig:Component :prop="prop"/>
        `);
    });

    it('Turns empty tags into self-closing tags', () => {
        const source = dedent`
        <twig:Component></twig:Component>
        `;

        const sanitized = sanitize(source);

        expect(sanitized).toEqual(dedent`
        <twig:Component/>
        `);
    });
});
