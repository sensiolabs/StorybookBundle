import { DecoratorFunction } from '@storybook/types';
import { ServerRenderer } from '@storybook/server';
import dedent from 'ts-dedent';

const ACTION_ATTRIBUTE = 'data-storybook-action';
const proxifyEvent = <T extends Event>(e: T) => {
    if (e.currentTarget !== null && Object.hasOwn(e.currentTarget, '__component')) {
        // Special handling for Live Components:
        // creates a proxy wrapper to omit the __component property that could
        // make actions calls when its properties are listed
        const elementProxy = new Proxy(e.currentTarget, {
            ownKeys(target: Element): ArrayLike<string | symbol> {
                return Object.keys(target).filter((key) => key !== '__component');
            },
        });
        return new Proxy(e, {
            get(obj, key) {
                if (key === 'currentTarget') {
                    return elementProxy;
                }
                return Reflect.get(obj, key);
            },
        });
    }

    return e;
};

export const setupActionListeners: DecoratorFunction<ServerRenderer> = (StoryFn, context) => {
    const { args } = context;
    const root = document.getElementById('storybook-root');

    // Configure action listeners once story has been rendered
    document.addEventListener(
        'DOMContentLoaded',
        () => {
            if (null === root) {
                return;
            }
            Object.entries(args)
                .filter(([, arg]) => typeof arg === 'function' && arg._sfActionId !== undefined)
                .forEach(([name, arg]) => {
                    const el = root.querySelector(`[${ACTION_ATTRIBUTE}='${arg._sfActionId}']`);
                    if (null !== el) {
                        el.addEventListener(name, (...eventArgs) => {
                            arg(...eventArgs.map(proxifyEvent));
                        });
                    } else {
                        console.warn(dedent`
                        Action arg "${name} is not bound to any DOM element."
                    `);
                    }
                });
        },
        { once: true }
    );

    return StoryFn(context);
};
