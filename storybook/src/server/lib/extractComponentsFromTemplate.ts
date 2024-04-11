import { XMLParser } from 'fast-xml-parser';

export const extractComponentsFromTemplate = (source: string) => {
    const reservedNames = ['block'];
    const tagRe = new RegExp(/twig:[A-Za-z]+(?::[A-Za-z]+)*/);
    const functionRe = new RegExp(/component\(\s*'([A-Za-z]+(?::[A-Za-z]+)*)'\s*(?:,.*)?\)/, 'gs');

    const lookupComponents = (obj: { [p: string]: any }): string[] => {
        return Object.entries(obj).reduce((names, [key, value]) => {
            if (value !== null && typeof value === 'object') {
                names.push(...lookupComponents(value));
            } else if (typeof value === 'string') {
                for (const m of value.matchAll(functionRe)) {
                    names.push([...m][1]);
                }
            }
            if (tagRe.test(key)) {
                names.push(key.replace('twig:', ''));
            }
            return names;
        }, [] as string[]);
    };

    try {
        // Dummy div tag to handle templates without any tag
        const documentObj = new XMLParser().parse(`<div>${source}</div>`);

        return lookupComponents(documentObj).filter((name) => !reservedNames.includes(name));
    } catch (err) {
        throw new Error('Invalid XML.', {
            cause: {
                parserError: err,
                template: source,
            },
        });
    }
};
