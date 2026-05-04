import { dedent } from 'ts-dedent';
import { logger } from 'storybook/internal/client-logger';

// src/client/lib/eventCallbacks.ts
var CALLBACK_ATTRIBUTE = "data-storybook-callbacks";
var ACTION_ATTRIBUTE = "data-storybook-action";
var proxifyEvent = (e) => {
  if (e.currentTarget !== null && Object.hasOwn(e.currentTarget, "__component")) {
    const elementProxy = new Proxy(e.currentTarget, {
      ownKeys(target) {
        return Object.keys(target).filter((key) => key !== "__component");
      }
    });
    return new Proxy(e, {
      get(obj, key) {
        const value = Reflect.get(obj, key);
        return value === e.currentTarget ? elementProxy : value;
      }
    });
  }
  return e;
};
var setupEventCallbacks = (args, root) => {
  Object.entries(args).filter(([, arg]) => typeof arg === "function").forEach(([name, arg]) => {
    let el = root.querySelector(`[${CALLBACK_ATTRIBUTE}~='${name}']`);
    const isLegacyAttribute = el === null && null !== (el = root.querySelector(`[${ACTION_ATTRIBUTE}~='${name}']`));
    if (null !== el) {
      if (isLegacyAttribute) {
        logger.warn(dedent`
                    Usage of attribute "${ACTION_ATTRIBUTE}" is deprecated. Use "${CALLBACK_ATTRIBUTE}" instead.
                    `);
      }
      el.addEventListener(name, (event) => arg(proxifyEvent(event)));
    } else {
      logger.warn(dedent`
                Callback arg "${name}" is not bound to any DOM element.
            `);
    }
  });
};

export { ACTION_ATTRIBUTE, CALLBACK_ATTRIBUTE, setupEventCallbacks };
