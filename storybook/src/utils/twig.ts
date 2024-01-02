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

export function twig(source: TemplateStringsArray, ...values: any[]): TwigTemplate
{
    return new TwigTemplate(String.raw({ raw: source }, ...values));
}
