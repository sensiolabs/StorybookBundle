import { setupEventCallbacks, CALLBACK_ATTRIBUTE } from './chunk-4G2ZCMT3.js';
import { twig } from './chunk-MTJ43HKR.js';
import { global } from '@storybook/global';
import { logger } from 'storybook/internal/client-logger';
import { dedent } from 'ts-dedent';
import { simulatePageLoad, addons } from 'storybook/preview-api';
import { STORY_ERRORED, STORY_RENDER_PHASE_CHANGED } from 'storybook/internal/core-events';
import { decode } from 'he';

var { window: globalWindow } = global;
globalWindow.STORYBOOK_ENV = "symfony";

// src/client/lib/createComponent.ts
var createComponent = (name, args) => {
  const processedArgs = Object.entries(args).reduce(
    (acc, [argName, value]) => {
      if (typeof value === "function") {
        acc.callbacks.push(`{{ _context['${argName}'] }}`);
      } else {
        acc.props.push(`:${argName}="${argName}"`);
      }
      return acc;
    },
    { props: [], callbacks: [] }
  );
  const argsAttributes = processedArgs.props;
  if (processedArgs.callbacks.length > 0) {
    argsAttributes.push(`${CALLBACK_ATTRIBUTE}="${processedArgs.callbacks.join(" ")}"`);
  }
  return twig`
        <twig:${name} ${argsAttributes.join(" ")} />
    `;
};
var extractErrorTitle = (html, fallback) => {
  const firstLine = html.split("\n", 1)[0];
  const matches = firstLine.match(/<!--\s*(.*)\s*-->$/);
  if (null === matches || matches.length < 2) {
    return fallback || "";
  }
  return decode(matches[1]);
};

// src/client/lib/buildStoryArgs.ts
var sanitizeArgs = (args) => {
  if (Array.isArray(args)) {
    return args.map((value) => sanitizeArgs(value));
  }
  if (typeof args !== "object" || null === args) {
    return args;
  }
  const storyArgs = {};
  for (const name in args) {
    if (typeof args[name] === "function") {
      storyArgs[name] = name;
    } else if (typeof args[name] === "object" && null !== args[name]) {
      storyArgs[name] = sanitizeArgs(args[name]);
    } else {
      storyArgs[name] = args[name];
    }
  }
  return storyArgs;
};
var buildStoryArgs = (args, argTypes) => {
  const storyArgs = sanitizeArgs(args);
  Object.keys(argTypes).forEach((key) => {
    const argType = argTypes[key];
    const { control } = argType;
    const argValue = storyArgs[key];
    const controlType = typeof control === "object" ? control.type : control;
    switch (controlType) {
      case "date": {
        if (argValue === void 0 || argValue === null || argValue === "") {
          break;
        }
        const date = new Date(argValue);
        if (!Number.isNaN(date.getTime())) {
          storyArgs[key] = date.toISOString();
        }
        break;
      }
    }
  });
  return storyArgs;
};

// src/client/render.ts
var { fetch, window: globalWindow2 } = global;
var SymfonyRenderingError = class extends Error {
  constructor(title, errorPage) {
    super(title);
    this.title = title;
    this.errorPage = errorPage;
  }
  title;
  errorPage;
};
var fetchStoryHtml = async (url, path, params, storyContext, template) => {
  const fetchUrl = new URL(`${url}/${path}`);
  const body = {
    args: { ...storyContext.globals, ...params },
    template: template.getSource()
  };
  const response = await fetch(fetchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/html"
    },
    body: JSON.stringify(body)
  });
  const html = await response.text();
  if (!response.ok) {
    const errorTitle = extractErrorTitle(html, response.statusText);
    throw new SymfonyRenderingError(errorTitle, html);
  }
  return html;
};
var render = (args, context) => {
  const { id, component } = context;
  if (typeof component === "string") {
    return {
      template: twig(component),
      setup: () => args
    };
  }
  if (typeof component === "object") {
    if ("getSource" in component && typeof component.getSource === "function") {
      return {
        template: component,
        setup: () => args
      };
    } else if ("name" in component) {
      return {
        template: createComponent(component.name, args),
        components: [component],
        setup: () => args
      };
    }
  }
  if (typeof component === "function") {
    return component(args, context);
  }
  logger.warn(dedent`
    Symfony renderer only supports rendering Twig templates. Either:
    - Create a "render" function in your story export
    - Set the "component" story's property to a string or a template created with the "twig" helper

    Received: ${component}
    `);
  throw new Error(`Unable to render story ${id}`);
};
async function renderToCanvas({
  id,
  showMain,
  storyFn,
  storyContext,
  storyContext: { parameters: parameters2, args, argTypes }
}, canvasElement) {
  const { template, setup } = storyFn(storyContext);
  if (typeof setup === "function") {
    args = setup();
  }
  const storyArgs = buildStoryArgs(args, argTypes);
  const {
    symfony: { id: storyId, params }
  } = parameters2;
  const url = `${globalWindow2.location.origin}/_storybook/render`;
  const fetchId = storyId || id;
  const storyParams = { ...params, ...storyArgs };
  showMain();
  try {
    canvasElement.innerHTML = await fetchStoryHtml(url, fetchId, storyParams, storyContext, template);
    setupEventCallbacks(args, canvasElement);
    configureLiveComponentErrorCatcher(id, canvasElement);
    simulatePageLoad(canvasElement);
  } catch (err) {
    if (err instanceof SymfonyRenderingError) {
      showSymfonyError(id, canvasElement, err);
    } else {
      throw err;
    }
  }
}
var showSymfonyError = (storyId, canvasElement, error) => {
  const { title, errorPage } = error;
  logger.error(`Error rendering story ${storyId}: ${title}`);
  const channel = addons.getChannel();
  channel.emit(STORY_ERRORED, { title: storyId, description: `Server failed to render story:
${title}` });
  channel.emit(STORY_RENDER_PHASE_CHANGED, { newPhase: "errored", storyId });
  canvasElement.innerHTML = errorPage;
  simulatePageLoad(canvasElement);
};
var configureLiveComponentErrorCatcher = (storyId, canvasElement) => {
  const liveComponentHosts = canvasElement.querySelectorAll("[data-controller~=live]");
  const errorHandler = async (response) => {
    const title = extractErrorTitle(await response.getBody());
    logger.error(`Live component failed to re-render in story ${storyId}: ${title}`);
    const channel = addons.getChannel();
    channel.emit(STORY_ERRORED, { title: storyId, description: `Live component failed to re-render:
${title}` });
  };
  liveComponentHosts.forEach(
    (el) => el.addEventListener(
      "live:connect",
      () => {
        if ("__component" in el) {
          const component = el.__component;
          component.on("response:error", errorHandler);
        } else {
          logger.warn(dedent`
                    Failed to configure error handler for LiveComponent. The "__component" property is missing from the element.
                    It's likely to be an issue with the Symfony Storybook framework. Check the concerned element below:
                    `);
          logger.warn(el);
        }
      },
      { once: true }
    )
  );
};

// src/entry-preview.ts
var parameters = {
  renderer: "symfony",
  symfony: {}
};

export { parameters, render, renderToCanvas };
