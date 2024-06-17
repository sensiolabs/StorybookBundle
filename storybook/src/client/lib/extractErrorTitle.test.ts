import dedent from 'ts-dedent';
import { extractErrorTitle } from './extractErrorTitle';

describe('extractErrorTitle', () => {
    const testTitle = (html: string, fallback: string | undefined, expected: string) => {
        const title = extractErrorTitle(html, fallback);
        expect(title).toEqual(expected);
    };

    it('works with single line', () => {
        const html = `<!-- Error message-->`;

        testTitle(html, undefined, 'Error message');
    });

    it('works with multi line', () => {
        const html = dedent`
        <!-- Error message-->
        <div>foo</div>
        `;

        testTitle(html, undefined, 'Error message');
    });

    it('decodes HTML entities', () => {
        const html = '<!-- Some &#x22;text&#x22; using &#x3C;special&#x3E; &#x27;chars&#x27; like &#x26;-->';

        testTitle(html, undefined, `Some "text" using <special> 'chars' like &`);
    });

    it('fallbacks to response status text', () => {
        const html = `<div>foo</div>`;

        const statusText = 'Internal Server Error';
        testTitle(html, statusText, statusText);
    });

    it('skip comments not in the first line', () => {
        const html = dedent`
        <div>foo</div>
        <!-- Error message-->
        `;

        const statusText = 'Internal Server Error';
        testTitle(html, statusText, statusText);
    });

    it('returns empty string when no status text is available', () => {
        testTitle('', undefined, '');
    });
});
