import dedent from 'ts-dedent';

const validArg = (value: any) => typeof value !== 'function';
const isObject = (value: any) => typeof value === 'object' && null !== value && !Array.isArray(value);

const indent = (level: number) => '    '.repeat(level);
const formatValue = (value: any, level: number = 0): string => {
    let formattedValue: string | undefined = undefined;
    if (null === value) {
        formattedValue = 'null';
    }
    if (typeof value === 'string') {
        formattedValue = `'${value}'`;
    }
    if (typeof value === 'number') {
        formattedValue = `${value}`;
    }
    if (typeof value === 'boolean') {
        formattedValue = value ? 'true' : 'false';
    }
    if (isObject(value)) {
        formattedValue = [
            '{',
            Object.entries(value)
                .filter((v) => validArg(v[1]))
                .map(([key, v]) => {
                    return `${indent(level + 1)}'${key}': ${formatValue(v, level + 1)}`;
                })
                .join(',\n'),
            `${indent(level)}}`,
        ].join('\n');
    }
    if (Array.isArray(value)) {
        formattedValue = [
            '[',
            value
                .filter((v) => validArg(v))
                .map((v) => {
                    return `${indent(level + 1)}${formatValue(v, level + 1)}`;
                })
                .join(',\n'),
            `${indent(level)}]`,
        ].join('\n');
    }

    if (formattedValue === undefined) {
        console.error('Unhandled value', value);
        throw new Error(`Unhandled type: ${typeof value}`);
    }
    return `${formattedValue}`;
};

export const prependArgsToStorySource = (source: string, args: any) => {
    const preamble = dedent`
    {% set args = ${formatValue(args)} %}
    `;

    return `${preamble}\n\n${source}`;
};
