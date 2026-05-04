import { fileURLToPath } from 'url';

// src/preset.ts
var resolveLocalFile = (path) => fileURLToPath(import.meta.resolve(path));
var addons = [resolveLocalFile("./server/framework-preset.js")];
var core = async (config, options) => {
  const framework = await options.presets.apply("framework");
  return {
    ...config,
    builder: {
      name: resolveLocalFile("./builders/webpack-builder.js"),
      options: typeof framework === "string" ? {} : framework.options.builder || {}
    }
  };
};
var previewAnnotations = async (entry = [], options) => {
  const docsEnabled = Object.keys(await options.presets.apply("docs", {}, options)).length > 0;
  return entry.concat(resolveLocalFile("./entry-preview.js")).concat(docsEnabled ? [resolveLocalFile("./entry-preview-docs.js")] : []);
};

export { addons, core, previewAnnotations };
