import { Args } from '@storybook/types';
import dedent from 'ts-dedent';
import { logger } from '@storybook/client-logger';

export const CALLBACK_ATTRIBUTE = 'data-storybook-callbacks';

/**
 * @deprecated Use {@link CALLBACK_ATTRIBUTE} instead
 */
export const ACTION_ATTRIBUTE = 'data-storybook-action';

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
                const value = Reflect.get(obj, key);

                return value === e.currentTarget ? elementProxy : value;
            },
        });
    }

    return e;
};

/**
 * Configure callbacks binding by looking for the callback attributes.
 */
export const setupEventCallbacks = (args: Args, root: HTMLElement) => {
    document.addEventListener(
        'DOMContentLoaded',
        () => {
            Object.entries(args)
                .filter(([, arg]) => typeof arg === 'function')
                .forEach(([name, arg]) => {
                    let el = root.querySelector(`[${CALLBACK_ATTRIBUTE}~='${name}']`);

                    const isLegacyAttribute =
                        el === null && null !== (el = root.querySelector(`[${ACTION_ATTRIBUTE}~='${name}']`));

                    if (null !== el) {
                        if (isLegacyAttribute) {
                            logger.warn(dedent`
                            Usage of attribute "${ACTION_ATTRIBUTE}" is deprecated. Use "${CALLBACK_ATTRIBUTE}" instead.
                            `);
                        }

                        el.addEventListener(name, (event: Event) => arg(proxifyEvent(event)));
                    } else {
                        logger.warn(dedent`
                        Callback arg "${name}" is not bound to any DOM element.
                    `);
                    }
                });
        },
        { once: true }
    );
};
