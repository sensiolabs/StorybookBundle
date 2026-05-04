import { dedent } from 'ts-dedent';
import { logger } from 'storybook/internal/client-logger';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

export { ACTION_ATTRIBUTE, CALLBACK_ATTRIBUTE, __commonJS, __toESM, setupEventCallbacks };
