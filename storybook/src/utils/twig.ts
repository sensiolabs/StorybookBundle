import { XMLParser } from 'fast-xml-parser';

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

    // Dummy div tag to handle templates without any tag
    const documentObj = new XMLParser().parse(`<div>${source}</div>`);
    const lookupComponents = (obj: { [p: string]: any }): string[] => {
        return Object.entries(obj).reduce((names, [key, value]) => {
            if (value !== null && typeof value === 'object') {
                names.push(...lookupComponents(value));
            } else if (typeof value === 'string') {
                for (const m of value.matchAll(functionRe)) {
                    // @ts-ignore
                    names.push([...m][1]);
                }
            }
            if (tagRe.test(key)) {
                names.push(key.replace('twig:', ''));
            }
            return names;
        }, [] as string[]);
    };

    return lookupComponents(documentObj).filter((name) => !reservedNames.includes(name));
}

export function twig(source: TemplateStringsArray, ...values: any[]): TwigTemplate {
    const rawSource = String.raw({ raw: source }, ...values);
    return new TwigTemplate(rawSource, parseSubComponents(rawSource));
}
