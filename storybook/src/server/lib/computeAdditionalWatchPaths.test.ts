import { computeAdditionalWatchPaths } from './computeAdditionalWatchPaths';

const fixturesDir = `${__dirname}/__fixtures__/assets`;

describe('computeAdditionalWatchPaths', () => {
    it('resolves single files', () => {
        const watchPaths = computeAdditionalWatchPaths(['foo.js', 'bar/bar.js'], fixturesDir);

        expect(watchPaths).toEqual({
            dirs: [],
            files: [`${fixturesDir}/foo.js`, `${fixturesDir}/bar/bar.js`],
        });
    });

    it('resolves directory', () => {
        const watchPaths = computeAdditionalWatchPaths(['bar'], fixturesDir);

        expect(watchPaths).toEqual({
            dirs: [`${fixturesDir}/bar`],
            files: [],
        });
    });

    describe('glob patterns', () => {
        it('resolves simple glob', () => {
            const watchPaths = computeAdditionalWatchPaths(['*.css'], fixturesDir);

            expect(watchPaths).toEqual({
                dirs: [],
                files: [`${fixturesDir}/foo.css`],
            });
        });

        it('resolves nested globs', () => {
            const watchPaths = computeAdditionalWatchPaths(['**/*.css'], fixturesDir);

            expect(watchPaths).toEqual({
                dirs: [],
                files: [`${fixturesDir}/foo.css`, `${fixturesDir}/bar/baz/baz.css`],
            });
        });
    });
});
