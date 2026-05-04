import { buildStoryArgs } from './buildStoryArgs';

describe('buildStoryArgs', () => {
    it('converts date controls to ISO strings', () => {
        expect(
            buildStoryArgs(
                { createdAt: 1_700_000_000_000 },
                {
                    createdAt: {
                        control: { type: 'date' },
                    },
                }
            )
        ).toEqual({ createdAt: '2023-11-14T22:13:20.000Z' });
    });

    it('leaves missing and invalid dates unchanged', () => {
        expect(
            buildStoryArgs(
                { invalid: 'not a date' },
                {
                    missing: {
                        control: 'date',
                    },
                    invalid: {
                        control: 'date',
                    },
                }
            )
        ).toEqual({ invalid: 'not a date' });
    });
});
