import { CALLBACK_ATTRIBUTE, ACTION_ATTRIBUTE } from './chunk-4G2ZCMT3.js';
import { SourceType, enhanceArgTypes, SNIPPET_RENDERED } from 'storybook/internal/docs-tools';
import { logger } from 'storybook/internal/client-logger';
import { useEffect, addons } from 'storybook/preview-api';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

var validArg = (value) => typeof value !== "function" && value !== void 0;
var isObject = (value) => typeof value === "object" && null !== value && !Array.isArray(value);
var indent = (level) => "    ".repeat(level);
var escapeTwigString = (value) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
var formatValue = (value, level = 0) => {
  if (null === value) {
    return "null";
  } else if (typeof value === "string") {
    return `'${escapeTwigString(value)}'`;
  } else if (typeof value === "number") {
    return `${value}`;
  } else if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (isObject(value)) {
    if (Object.keys(value).length === 0) {
      return "{}";
    }
    const objectDefinition = Object.entries(value).filter((v) => validArg(v[1])).flatMap(([key, v]) => {
      const formatted = formatValue(v, level + 1);
      return false === formatted ? [] : [`${indent(level + 1)}'${escapeTwigString(key)}': ${formatted}`];
    });
    if (objectDefinition.length === 0) {
      return false;
    }
    return ["{", objectDefinition.join(",\n"), `${indent(level)}}`].join("\n");
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    const arrayDefinition = value.filter((v) => validArg(v)).flatMap((v) => {
      const formatted = formatValue(v, level + 1);
      return false === formatted ? [] : [`${indent(level + 1)}${formatted}`];
    });
    if (arrayDefinition.length === 0) {
      return false;
    }
    return ["[", arrayDefinition.join(",\n"), `${indent(level)}]`].join("\n");
  } else {
    logger.error("Unhandled value", value);
    throw new Error(`Unhandled type: ${typeof value}`);
  }
};
var buildVariableDeclarations = (args) => {
  const varDeclarations = Object.entries(args).filter(([, value]) => validArg(value)).map(([name, value]) => [name, formatValue(value)]).filter(([, value]) => false !== value).map(([name, value]) => `{% set ${name} = ${value} %}`);
  return varDeclarations.join("\n");
};
var STRIPPED_ATTRIBUTES = [CALLBACK_ATTRIBUTE, ACTION_ATTRIBUTE];
var isAttributeName = (name) => {
  return isLitAttributeName(name) || isExprAttributeName(name);
};
var isLitAttributeName = (name) => {
  return /^@_[^:]/.test(name);
};
var isExprAttributeName = (name) => {
  return /^@_:/.test(name);
};
var isTextName = (name) => {
  return /^#/.test(name);
};
var isNodeName = (name) => {
  return !isAttributeName(name) && !isTextName(name);
};
var getAttributeName = (name) => {
  if (isExprAttributeName(name)) {
    return name.replace(/^@_:/, "");
  }
  if (isLitAttributeName(name)) {
    return name.replace(/^@_/, "");
  }
  throw new Error("Invalid argument");
};
var traverseNode = (node) => {
  if (Array.isArray(node)) {
    node.forEach(traverseNode);
    return;
  }
  if (typeof node !== "string") {
    for (const child in node) {
      if (isAttributeName(child)) {
        const attrName = getAttributeName(child);
        if (STRIPPED_ATTRIBUTES.includes(attrName)) {
          delete node[child];
          continue;
        }
      }
      if (isNodeName(child)) {
        traverseNode(node[child]);
      }
    }
  }
};
var sanitize = (source) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    stopNodes: ["*.pre", "*.script"],
    unpairedTags: ["hr", "br", "link", "meta"],
    processEntities: true,
    htmlEntities: true,
    preserveOrder: true,
    allowBooleanAttributes: true
  });
  const xml = parser.parse(source);
  traverseNode(xml);
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    processEntities: false,
    format: true,
    suppressEmptyNode: true,
    preserveOrder: true,
    suppressBooleanAttributes: true
  });
  return builder.build(xml).trim();
};

// src/client/addons/docs/sourceDecorator.ts
function skipSourceRender(context) {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;
  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }
  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}
var sourceDecorator = (storyFn, context) => {
  const story = storyFn();
  const setup = story.setup;
  let source;
  if (!skipSourceRender(context)) {
    source = story.template.getSource();
  }
  useEffect(() => {
    const { id, unmappedArgs } = context;
    if (source) {
      const args = setup ? setup() : unmappedArgs;
      const preamble = buildVariableDeclarations(args);
      let sanitizedSource = source;
      try {
        sanitizedSource = sanitize(source);
      } catch (err) {
        logger.warn(`Failed to sanitize Symfony story source. Falling back to the raw source. ERR: ${err}`);
      }
      const renderedSource = `${preamble}

${sanitizedSource}`;
      addons.getChannel().emit(SNIPPET_RENDERED, { id, args: unmappedArgs, source: renderedSource });
    }
  });
  return story;
};

// src/entry-preview-docs.ts
var decorators = [sourceDecorator];
var parameters = {
  docs: {
    story: { inline: true },
    source: {
      type: SourceType.DYNAMIC,
      language: "html",
      code: void 0,
      excludeDecorators: void 0
    }
  }
};
var argTypesEnhancers = [enhanceArgTypes];

export { argTypesEnhancers, decorators, parameters };
