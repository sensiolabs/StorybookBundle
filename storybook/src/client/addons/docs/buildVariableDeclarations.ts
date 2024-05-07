const validArg = (value: any) => typeof value !== 'function';

const isObject = (value: any) => typeof value === 'object' && null !== value && !Array.isArray(value);

const indent = (level: number) => '    '.repeat(level);

const formatValue = (value: any, level: number = 0): string | false => {
    if (null === value) {
        return 'null';
    } else if (typeof value === 'string') {
        return `'${value}'`;
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
            .map(([key, v]) => {
                return `${indent(level + 1)}'${key}': ${formatValue(v, level + 1)}`;
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
            .map((v) => {
                return `${indent(level + 1)}${formatValue(v, level + 1)}`;
            });
        if (arrayDefinition.length === 0) {
            // Array contained keys but were removed because not relevant, return false to skip
            return false;
        }

        return ['[', arrayDefinition.join(',\n'), `${indent(level)}]`].join('\n');
    } else {
        console.error('Unhandled value', value);
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
