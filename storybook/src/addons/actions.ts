import { Args, DecoratorFunction } from '@storybook/types';
import { ServerRenderer } from '@storybook/server';
import { useEffect } from '@storybook/preview-api';

type ActionHandler = (...args: any[]) => void;

type ActionArg = {
    event: string;
    handler: ActionHandler;
    id: string;
};

const ACTION_ATTRIBUTE = 'data-storybook-action';
const isActionArg = (arg: any) => {
    return arg?.isAction ?? false;
};

const generateActionId = (): string => {
    if (!window.crypto) {
        throw new Error('The crypto module is not available in your browser.');
    }

    return window.crypto.randomUUID();
};

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

const popActionArgs = (args: Args) => {
    const actions: ActionArg[] = [];

    for (const argName in args) {
        const arg = args[argName];
        if (isActionArg(arg)) {
            const actionId = generateActionId();
            actions.push({
                event: argName,
                handler: (...args) => {
                    const cleanedArgs = args.map(proxifyEvent);

                    arg(...cleanedArgs);
                },
                id: actionId,
            });
            args[argName] = actionId;
        }
    }

    return actions;
};

export const setupActions: DecoratorFunction<ServerRenderer> = (StoryFn, context) => {
    const { args } = context;

    const actions = popActionArgs(args);

    const root = document.getElementById('storybook-root');
    useEffect(() => {
        if (null === root) {
            return;
        }

        const listeners = actions.reduce(
            (acc, action) => {
                const el = root.querySelector(`[${ACTION_ATTRIBUTE}='${action.id}']`);
                if (null !== el) {
                    acc.push({ el: el, action: action });
                }
                return acc;
            },
            [] as { el: Element; action: ActionArg }[]
        );

        listeners.forEach(({ el, action }) => el.addEventListener(action.event, action.handler));

        return () => listeners.forEach(({ el, action }) => el.removeEventListener(action.event, action.handler));
    }, [root, actions]);

    return StoryFn(context);
};
