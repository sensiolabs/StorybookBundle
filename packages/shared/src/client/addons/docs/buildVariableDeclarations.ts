import { logger } from 'storybook/internal/client-logger';

const validArg = (value: any) => typeof value !== 'function' && value !== undefined;

const isObject = (value: any) => typeof value === 'object' && null !== value && !Array.isArray(value);

const indent = (level: number) => '    '.repeat(level);

const escapeTwigString = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const formatValue = (value: any, level: number = 0): string | false => {
    if (null === value) {
        return 'null';
    } else if (typeof value === 'string') {
        return `'${escapeTwigString(value)}'`;
    } else if (typeof value === 'number') {
        return `${value}`;
    } else if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    } else if (isObject(value)) {
        if (Object.keys(value).length === 0) {
            // Keep empty object
            return '{}';
        }
        const objectDefinition = Object.entries(value)
            .filter((v) => validArg(v[1]))
            .flatMap(([key, v]) => {
                const formatted = formatValue(v, level + 1);

                return false === formatted ? [] : [`${indent(level + 1)}'${escapeTwigString(key)}': ${formatted}`];
            });
        if (objectDefinition.length === 0) {
            // Object contained keys but were removed because not relevant, return false to skip
            return false;
        }

        return ['{', objectDefinition.join(',\n'), `${indent(level)}}`].join('\n');
    } else if (Array.isArray(value)) {
        if (value.length === 0) {
            // Keep empty arrays
            return '[]';
        }
        const arrayDefinition = value
            .filter((v) => validArg(v))
            .flatMap((v) => {
                const formatted = formatValue(v, level + 1);

                return false === formatted ? [] : [`${indent(level + 1)}${formatted}`];
            });
        if (arrayDefinition.length === 0) {
            // Array contained keys but were removed because not relevant, return false to skip
            return false;
        }

        return ['[', arrayDefinition.join(',\n'), `${indent(level)}]`].join('\n');
    } else {
        logger.error('Unhandled value', value);
        throw new Error(`Unhandled type: ${typeof value}`);
    }
};

export const buildVariableDeclarations = (args: any) => {
    const varDeclarations = Object.entries(args)
        .filter(([, value]) => validArg(value)) // Filter out irrelevant args
        .map(([name, value]) => [name, formatValue(value)]) // Format name and value
        .filter(([, value]) => false !== value) // Filter out irrelevant nested values
        .map(([name, value]) => `{% set ${name} = ${value} %}`); // Print the set tag

    return varDeclarations.join('\n');
};
