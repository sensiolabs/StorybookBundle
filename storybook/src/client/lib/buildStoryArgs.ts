import type { Args, ArgTypes } from '../public-types';

/**
 * Pre-process args to replace JS functions, deeply.
 */
const sanitizeArgs = (args: any) => {
    const sanitized: any = {};
    for (const name in args) {
        if (typeof args[name] === 'function') {
            // Replace function arg with its name for later binding
            sanitized[name] = name;
        } else if (typeof args[name] === 'object' && null !== args[name]) {
            // Deep sanitize args, e.g. when using args composition
            sanitized[name] = sanitizeArgs(args[name]);
        } else {
            // Scalar, raw copy value
            sanitized[name] = args[name];
        }
    }

    return sanitized;
};

export const buildStoryArgs = (args: Args, argTypes: ArgTypes) => {
    const storyArgs = { ...args };

    Object.keys(argTypes).forEach((key: string) => {
        const argType = argTypes[key];
        const { control } = argType;
        const controlType = control && control.type.toLowerCase();
        const argValue = storyArgs[key];
        switch (controlType) {
            case 'date':
                // For cross framework & language support we pick a consistent representation of Dates as strings
                storyArgs[key] = new Date(argValue).toISOString();
                break;
            default:
        }
    });

    return sanitizeArgs(storyArgs);
};
