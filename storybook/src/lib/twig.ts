import dedent from 'ts-dedent';

export class TwigTemplate {
    constructor(private readonly source: string) {
        this.source = source;
    }

    getSource() {
        return this.source;
    }

    toString(): string {
        return this.source;
    }
}

export function twig(source: TemplateStringsArray | string, ...values: any[]): TwigTemplate {
    const strings = typeof source === 'string' ? [source] : source;
    const rawSource = String.raw({ raw: strings }, ...values);
    return new TwigTemplate(dedent(rawSource));
}
