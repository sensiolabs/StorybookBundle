import { XMLParser } from 'fast-xml-parser';
import dedent from 'ts-dedent';

export class TwigTemplate {
    constructor(
        private readonly source: string,
        private readonly components: string[]
    ) {
        this.source = source;
    }

    getSource() {
        return this.source;
    }

    toString(): string {
        return this.source;
    }

    getComponents(): string[] {
        return this.components;
    }
}

function parseSubComponents(source: string) {
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
}

export function twig(source: TemplateStringsArray | string, ...values: any[]): TwigTemplate {
    const strings = typeof source === 'string' ? [source] : source;
    const rawSource = String.raw({ raw: strings }, ...values);
    return new TwigTemplate(dedent(rawSource), parseSubComponents(rawSource));
}
