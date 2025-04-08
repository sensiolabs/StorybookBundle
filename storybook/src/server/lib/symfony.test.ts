'use strict';

import { generateSymfonyPreview, getSymfonyConfig } from './symfony';
import { vi } from 'vitest';
import fs from 'node:fs';
import dedent from 'ts-dedent';

describe('Symfony utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateSymfonyPreview', () => {
        it('returns a HTML page for preview', async () => {
            const html = dedent`<!DOCTYPE html>
            <html>
            <head>
            <title>Storybook Preview</title></head>
            <body>
            </body>
            </html>`;

            global.fetch = vi.fn(() => Promise.resolve(new Response(html)));

            const preview = await generateSymfonyPreview('http://localhost:8000');

            expect(preview).toEqual(html);
            expect(fetch).toHaveBeenCalledWith(new URL('http://localhost:8000/_storybook/preview'), {
                method: 'GET',
                headers: {
                    Accept: 'text/html',
                },
            });
        });

        it('throws on fetch failure', async () => {
            global.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 500 })));

            await expect(generateSymfonyPreview('http://localhost:8000')).rejects.toThrow('Unable to render preview.');

            expect(fetch).toHaveBeenCalledWith(new URL('http://localhost:8000/_storybook/preview'), {
                method: 'GET',
                headers: {
                    Accept: 'text/html',
                },
            });
        });
    });

    describe('getSymfonyConfig', () => {
        it('returns a JS object', async () => {
            const storybookCachePath = `${__dirname}/__fixtures__/var/cache/dev/storybook`;

            const symfonyParameters = JSON.parse(
                fs.readFileSync(`${storybookCachePath}/symfony_parameters.json`, 'utf8')
            );

            await expect(getSymfonyConfig(storybookCachePath)).resolves.toEqual(symfonyParameters);
        });
    });
});
