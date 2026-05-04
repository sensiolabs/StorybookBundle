import type { Args, ArgTypes } from '../public-types';

/**
 * Pre-process args to replace JS functions, deeply.
 */
const sanitizeArgs = (args: any): any => {
    if (Array.isArray(args)) {
        return args.map((value) => sanitizeArgs(value));
    }

    if (typeof args !== 'object' || null === args) {
        return args;
    }

    const storyArgs: any = {};
    for (const name in args) {
        if (typeof args[name] === 'function') {
            // Replace function arg with its name for later binding
            storyArgs[name] = name;
        } else if (typeof args[name] === 'object' && null !== args[name]) {
            // Deep sanitize args, e.g. when using args composition
            storyArgs[name] = sanitizeArgs(args[name]);
        } else {
            storyArgs[name] = args[name];
        }
    }

    return storyArgs;
};

export const buildStoryArgs = (args: Args, argTypes: ArgTypes) => {
    const storyArgs = sanitizeArgs(args);

    Object.keys(argTypes).forEach((key: string) => {
        const argType = argTypes[key];
        const { control } = argType;
        const argValue = storyArgs[key];
        const controlType = typeof control === 'object' ? control.type : control;

        switch (controlType) {
            case 'date': {
                if (argValue === undefined || argValue === null || argValue === '') {
                    break;
                }

                const date = new Date(argValue);
                if (!Number.isNaN(date.getTime())) {
                    // For cross framework & language support we pick a consistent representation of Dates as strings
                    storyArgs[key] = date.toISOString();
                }

                break;
            }
        }
    });

    return storyArgs;
};
