import { JSDOM } from 'jsdom';
import { execFile } from 'child_process';
import { dedent } from 'ts-dedent';
import { createUnplugin } from 'unplugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from 'storybook/internal/node-logger';
import path, { join, resolve } from 'path';
import isGlob from 'is-glob';
import { glob } from 'glob';
import fs from 'fs';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

// ../shared/dist/chunk-TT62UGG3.js
var injectPreviewHtml = (previewHtml, targetHtml) => {
  if (!targetHtml.includes("<!--PREVIEW_HEAD_PLACEHOLDER-->")) {
    throw new Error("Missing PREVIEW_HEAD_PLACEHOLDER in Storybook iframe HTML.");
  }
  if (!targetHtml.includes("<!--PREVIEW_BODY_PLACEHOLDER-->")) {
    throw new Error("Missing PREVIEW_BODY_PLACEHOLDER in Storybook iframe HTML.");
  }
  const previewDom = new JSDOM(previewHtml);
  const previewHead2 = previewDom.window.document.head;
  const previewBody2 = previewDom.window.document.body;
  return targetHtml.replace("<!--PREVIEW_HEAD_PLACEHOLDER-->", previewHead2.innerHTML).replace("<!--PREVIEW_BODY_PLACEHOLDER-->", previewBody2.innerHTML);
};
var defaultOptions = {
  php: "php",
  script: "bin/console"
};
var prepareSymfonyCommand = (command, inputs = [], options = {}) => {
  const finalOptions = {
    ...defaultOptions,
    ...options
  };
  return {
    file: finalOptions.php,
    args: [finalOptions.script, command, ...inputs, "-v"]
  };
};
var execSymfonyCommand = async ({ file, args }) => {
  return new Promise((resolve2, reject) => {
    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new Error(dedent`
                    Symfony console failed with exit status ${error.code}:
                    CMD: ${[file, ...args].join(" ")}
                    Output: ${stdout}
                    Error output: ${stderr}
                `)
        );
      }
      resolve2(stdout);
    });
  });
};
var runSymfonyCommand = async (command, inputs = [], options = {}) => {
  const finalCommand = prepareSymfonyCommand(command, inputs, options);
  return execSymfonyCommand(finalCommand);
};
var runSymfonyCommandJson = async (command, inputs = [], options = {}) => {
  const finalCommand = prepareSymfonyCommand(command, [...inputs, "--format=json"], options);
  const result = await execSymfonyCommand(finalCommand);
  try {
    return JSON.parse(result);
  } catch {
    throw new Error(dedent`
        Failed to process JSON output for Symfony command.
        CMD: ${[finalCommand.file, ...finalCommand.args].join(" ")}
        Raw output: ${result}
        `);
  }
};
var getKernelProjectDir = async () => {
  const projectDir = (await runSymfonyCommandJson("debug:container", ["--parameter=kernel.project_dir"]))["kernel.project_dir"];
  if (!projectDir) {
    throw new Error('Missing "kernel.project_dir" in Symfony debug:container output.');
  }
  return projectDir;
};
var getBundleConfig = async () => {
  const config = (await runSymfonyCommandJson("debug:config", ["storybook"]))["storybook"];
  if (!config) {
    throw new Error('Missing "storybook" in Symfony debug:config output.');
  }
  return config;
};
var getTwigComponentConfiguration = async () => {
  const config = (await runSymfonyCommandJson("debug:config", [
    "twig_component",
    "--resolve-env"
  ]))["twig_component"];
  if (!config) {
    throw new Error('Missing "twig_component" in Symfony debug:config output.');
  }
  return config;
};
var getTwigConfiguration = async () => {
  const config = (await runSymfonyCommandJson("debug:config", ["twig", "--resolve-env"]))["twig"];
  if (!config) {
    throw new Error('Missing "twig" in Symfony debug:config output.');
  }
  return config;
};
var PLUGIN_NAME = "preview-plugin";
var PreviewCompilerPlugin = createUnplugin(() => {
  return {
    name: PLUGIN_NAME,
    webpack(compiler) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        const webpackCompilation = compilation;
        HtmlWebpackPlugin.getHooks(webpackCompilation).afterTemplateExecution.tapPromise(
          PLUGIN_NAME,
          async (params) => {
            try {
              const previewHtml = await runSymfonyCommand("storybook:generate-preview");
              params.html = injectPreviewHtml(previewHtml, params.html);
              return params;
            } catch (err) {
              logger.error(dedent`
                            Failed to inject Symfony preview template in main iframe.html.
                            ERR: ${err}
                            `);
              throw err;
            }
          }
        );
      });
    }
  };
});
var computeAdditionalWatchPaths = (paths, baseDir) => {
  const result = {
    dirs: [],
    files: []
  };
  paths.map((v) => join(baseDir, v)).forEach((watchPath) => {
    if (isGlob(watchPath)) {
      result.files.push(
        ...glob.sync(watchPath, {
          dot: true,
          absolute: true
        })
      );
    } else {
      try {
        const stats = fs.lstatSync(watchPath);
        (stats.isDirectory() ? result.dirs : result.files).push(watchPath);
      } catch (err) {
        if (err instanceof Error && "code" in err && err.code === "ENOENT") {
          logger.warn(dedent`
                            Ignoring additional watch path '${watchPath}': path doesn't exist.
                        `);
          return;
        }
        throw err;
      }
    }
  });
  return result;
};
var PLUGIN_NAME2 = "dev-preview-plugin";
var escapeTemplateLiteral = (value) => value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
var DevPreviewCompilerPlugin = createUnplugin((options) => {
  const { projectDir, additionalWatchPaths } = options;
  return {
    name: PLUGIN_NAME2,
    enforce: "post",
    transformInclude(id) {
      return /storybook-config-entry\.js$/.test(id);
    },
    async transform(code) {
      return dedent`
        import { symfonyPreview } from './symfony-preview.js';

        ${code}

        window.__SYMFONY_PREVIEW__ = symfonyPreview;
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./symfony-preview.js', () => {
                const iframe = window.top.document.getElementById('storybook-preview-iframe');
                if (iframe) {
                    iframe.src = iframe.src;
                }
            });
        }
        `;
    },
    webpack(compiler) {
      const v = new VirtualModulesPlugin();
      v.apply(compiler);
      let previewHtml = "";
      let registeredAdditionalWatchPaths = false;
      compiler.hooks.watchRun.tapPromise(PLUGIN_NAME2, async () => {
        registeredAdditionalWatchPaths = false;
        previewHtml = await runSymfonyCommand("storybook:generate-preview");
        v.writeModule(
          "./symfony-preview.js",
          dedent`
                    export const symfonyPreview = {
                        html: \`${escapeTemplateLiteral(previewHtml)}\`,
                    };`
        );
      });
      compiler.hooks.afterCompile.tap(PLUGIN_NAME2, (compilation) => {
        const webpackCompilation = compilation;
        if ("HtmlWebpackCompiler" == webpackCompilation.name) {
          const resolvedWatchPaths = computeAdditionalWatchPaths(additionalWatchPaths, projectDir);
          webpackCompilation.contextDependencies.addAll(resolvedWatchPaths.dirs);
          webpackCompilation.fileDependencies.addAll(resolvedWatchPaths.files);
          registeredAdditionalWatchPaths = true;
        }
      });
      compiler.hooks.done.tap(PLUGIN_NAME2, () => {
        if (additionalWatchPaths.length > 0 && !registeredAdditionalWatchPaths) {
          logger.warn(dedent`
                    Additional watch paths were not registered because HtmlWebpackPlugin's child compilation was not found.
                    `);
        }
      });
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME2, (compilation) => {
        const webpackCompilation = compilation;
        HtmlWebpackPlugin.getHooks(webpackCompilation).afterTemplateExecution.tapPromise(
          PLUGIN_NAME2,
          async (params) => {
            try {
              params.html = injectPreviewHtml(previewHtml, params.html);
              return params;
            } catch (err) {
              logger.error(dedent`
                            Failed to inject Symfony preview template in main iframe.html.
                            ERR: ${err}
                            `);
              return params;
            }
          }
        );
      });
    }
  };
});
var TwigComponentResolver = class {
  constructor(config) {
    this.config = config;
  }
  config;
  resolveNameFromFile(file) {
    const stripDirectory = (file2, dir) => {
      return file2.replace(dir, "").replace(/^\//, "").replaceAll("/", ":").replace(".html.twig", "");
    };
    for (const [namespace, twigDirectories] of Object.entries(this.config.namespaces)) {
      const matchingDirectory = twigDirectories.find((dir) => file.startsWith(dir));
      if (matchingDirectory) {
        const trimmedPath = stripDirectory(file, matchingDirectory);
        return namespace ? `${namespace}:${trimmedPath}` : trimmedPath;
      }
    }
    for (const anonymousDir of this.config.anonymousTemplateDirectory) {
      if (file.startsWith(anonymousDir)) {
        return stripDirectory(file, anonymousDir);
      }
    }
    throw new Error(dedent`Unable to determine template name for file "${file}":`);
  }
  resolveFileFromName(name) {
    const nameParts = name.split(":");
    const namespace = nameParts.length > 1 ? nameParts[0] : "";
    const dirParts = nameParts.slice(0, -1);
    const filename = `${nameParts.slice(-1)}.html.twig`;
    const lookupPaths = [];
    if (namespace && this.config.namespaces[namespace]) {
      const namespacePaths = this.config.namespaces[namespace];
      if (namespacePaths.length > 0) {
        for (const namespacePath of namespacePaths) {
          lookupPaths.push(path.join(namespacePath, dirParts.slice(1).join("/")));
        }
      }
    }
    if (this.config.namespaces[""] && this.config.namespaces[""].length > 0) {
      for (const namespacePath of this.config.namespaces[""]) {
        lookupPaths.push(path.join(namespacePath, dirParts.join("/")));
      }
    }
    if (this.config.anonymousTemplateDirectory.length > 0) {
      for (const namespacePath of this.config.anonymousTemplateDirectory) {
        lookupPaths.push(path.join(namespacePath, dirParts.join("/")));
      }
    }
    for (const lookupPath of lookupPaths) {
      const resolvedPath = path.join(lookupPath, filename);
      if (fs.existsSync(resolvedPath)) {
        return resolvedPath;
      }
    }
    throw new Error(dedent`Unable to find template file for component "${name}".`);
  }
};
var extractComponentsFromTemplate = (source) => {
  const reservedNames = ["block"];
  const tagRe = new RegExp(/twig:[A-Za-z]+(?::[A-Za-z]+)*/);
  const functionRe = new RegExp(/component\(\s*['"]([A-Za-z]+(?::[A-Za-z]+)*)['"]\s*(?:,.*)?\)/, "gs");
  const lookupComponents = (obj) => {
    return Object.entries(obj).reduce((names, [key, value]) => {
      if (value !== null && typeof value === "object") {
        names.push(...lookupComponents(value));
      } else if (typeof value === "string") {
        for (const m of value.matchAll(functionRe)) {
          names.push([...m][1]);
        }
      }
      if (tagRe.test(key)) {
        names.push(key.replace("twig:", ""));
      }
      return names;
    }, []);
  };
  try {
    const documentObj = new XMLParser().parse(`<div>${source}</div>`);
    return lookupComponents(documentObj).filter((name) => !reservedNames.includes(name));
  } catch (err) {
    throw new Error(`Invalid XML in template: ${source}`, { cause: err });
  }
};
var PLUGIN_NAME3 = "twig-loader";
var TwigLoaderPlugin = createUnplugin((options) => {
  const { twigComponentConfiguration } = options;
  const resolver = new TwigComponentResolver(twigComponentConfiguration);
  return {
    name: PLUGIN_NAME3,
    enforce: "pre",
    transformInclude: (id) => {
      return /\.html\.twig$/.test(id);
    },
    transform: async (code, id) => {
      const imports = [];
      let name = id;
      try {
        const components = new Set(extractComponentsFromTemplate(code));
        components.forEach((name2) => {
          imports.push(resolver.resolveFileFromName(name2));
        });
        name = resolver.resolveNameFromFile(id);
      } catch (err) {
        logger.warn(dedent`
                Failed to load Twig component metadata from '${id}': ${err}
                `);
      }
      return dedent`
            ${imports.map((file) => `import '${file}';`).join("\n")}
            export default {
                name: \'${name}\',
                hash: \`${crypto.createHash("sha256").update(code).digest("hex")}\`,
            };
           `;
    }
  };
});
var getBuildOptions = async (symfonyOptions) => {
  const projectDir = await getKernelProjectDir();
  const twigComponentsConfig = await getTwigComponentConfiguration();
  const twigConfig = await getTwigConfiguration();
  const componentNamespaces = {};
  const twigPaths = Object.keys(twigConfig.paths).map((key) => resolve(projectDir, key));
  if (twigPaths.length === 0) {
    twigPaths.push(`${projectDir}/templates/`);
  }
  for (const { name_prefix: namePrefix, template_directory: templateDirectory } of Object.values(
    twigComponentsConfig.defaults || {}
  )) {
    componentNamespaces[namePrefix] = twigPaths.map((twigPath) => resolve(twigPath, templateDirectory));
  }
  const anonymousNamespace = twigPaths.map(
    (twigPath) => resolve(twigPath, twigComponentsConfig["anonymous_template_directory"])
  );
  const runtimeDir = (await getBundleConfig()).runtime_dir;
  return {
    twigComponent: {
      anonymousTemplateDirectory: anonymousNamespace,
      namespaces: componentNamespaces
    },
    runtimeDir,
    projectDir,
    additionalWatchPaths: symfonyOptions.additionalWatchPaths || []
  };
};
var webpack = async (config, options) => {
  const framework = await options.presets.apply("framework");
  const frameworkOptions = typeof framework === "string" ? {} : framework.options;
  const symfonyOptions = await getBuildOptions(frameworkOptions.symfony || {});
  const storybookPlugins = [
    options.configType === "PRODUCTION" ? PreviewCompilerPlugin.webpack() : DevPreviewCompilerPlugin.webpack({
      projectDir: symfonyOptions.projectDir,
      additionalWatchPaths: symfonyOptions.additionalWatchPaths
    }),
    TwigLoaderPlugin.webpack({
      twigComponentConfiguration: symfonyOptions.twigComponent
    })
  ];
  return {
    ...config,
    plugins: [...config.plugins || [], ...storybookPlugins],
    module: {
      ...config.module,
      rules: [...config.module?.rules || []]
    }
  };
};
var previewHead = async (base) => dedent`
    ${base}
    <!--PREVIEW_HEAD_PLACEHOLDER-->
    `;
var previewBody = async (base) => dedent`
    ${base}
    <!--PREVIEW_BODY_PLACEHOLDER-->
    `;

export { previewBody, previewHead, webpack };
