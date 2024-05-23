import { decode } from 'he';

export const extractErrorTitle = (html: string, fallback?: string) => {
    const firstLine = html.split('\n', 1)[0];

    const matches = firstLine.match(/<!--\s*(.*)\s*-->$/);

    if (null === matches || matches.length < 2) {
        return fallback || '';
    }
    return decode(matches[1]);
};
