import path, { resolve, sep, join } from 'path';
import { dedent } from 'ts-dedent';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { createUnplugin } from 'unplugin';
import { logger } from 'storybook/internal/node-logger';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { JSDOM } from 'jsdom';
import isGlob from 'is-glob';
import { glob } from 'glob';

// ../shared/dist/chunk-6633BDDN.js
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
var PLUGIN_NAME = "twig-loader";
var TwigLoaderPlugin = createUnplugin((options) => {
  const { twigComponentConfiguration } = options;
  const resolver = new TwigComponentResolver(twigComponentConfiguration);
  return {
    name: PLUGIN_NAME,
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
var createProxyConfig = (symfonyOptions, configType) => {
  if (!symfonyOptions.server) {
    logger.warn(dedent`
        Symfony server proxy is disabled because "framework.options.symfony.server" is not configured.
        `);
    return {};
  }
  const proxyPaths = ["/_storybook/render"];
  if (symfonyOptions.proxyPaths) {
    proxyPaths.push(
      ...Array.isArray(symfonyOptions.proxyPaths) ? symfonyOptions.proxyPaths : [symfonyOptions.proxyPaths]
    );
  }
  return Object.fromEntries(
    proxyPaths.map((path2) => [
      path2,
      {
        target: symfonyOptions.server,
        changeOrigin: true,
        secure: configType === "PRODUCTION",
        headers: {
          "X-Storybook-Proxy": "true"
        }
      }
    ])
  );
};
var SymfonyPreviewPlugin = (options) => {
  let previewHtml = "";
  let previewHtmlFetched = false;
  const refreshPreviewHtml = async () => {
    previewHtml = await runSymfonyCommand("storybook:generate-preview");
    previewHtmlFetched = true;
  };
  return {
    name: "storybook-symfony-preview",
    async buildStart() {
      await refreshPreviewHtml();
    },
    configureServer(server) {
      const resolvedWatchPaths = computeAdditionalWatchPaths(options.additionalWatchPaths, options.projectDir);
      const watchPaths = [...resolvedWatchPaths.dirs, ...resolvedWatchPaths.files];
      server.watcher.add(watchPaths);
      server.watcher.on("change", async (path2) => {
        const watchedFileChanged = resolvedWatchPaths.files.includes(path2);
        const watchedDirChanged = resolvedWatchPaths.dirs.some(
          (watchPath) => path2 === watchPath || path2.startsWith(`${watchPath}${sep}`)
        );
        if (!watchedFileChanged && !watchedDirChanged) {
          return;
        }
        try {
          await refreshPreviewHtml();
          server.ws.send({ type: "full-reload" });
        } catch (err) {
          logger.error(dedent`
                    Failed to regenerate Symfony preview template.
                    ERR: ${err}
                    `);
        }
      });
    },
    async transformIndexHtml(html) {
      try {
        const hasPreviewHeadPlaceholder = html.includes("<!--PREVIEW_HEAD_PLACEHOLDER-->");
        const hasPreviewBodyPlaceholder = html.includes("<!--PREVIEW_BODY_PLACEHOLDER-->");
        if (!hasPreviewHeadPlaceholder && !hasPreviewBodyPlaceholder) {
          return html;
        }
        if (!previewHtmlFetched) {
          await refreshPreviewHtml();
        }
        return injectPreviewHtml(previewHtml, html);
      } catch (err) {
        logger.error(dedent`
                Failed to inject Symfony preview template in main iframe.html.
                ERR: ${err}
                `);
        return html;
      }
    }
  };
};
var viteFinal = async (config, options) => {
  const framework = await options.presets.apply("framework");
  const frameworkOptions = typeof framework === "string" ? {} : framework.options;
  const symfonyOptions = await getBuildOptions(frameworkOptions.symfony || {});
  return {
    ...config,
    server: {
      ...config.server,
      proxy: {
        ...config.server?.proxy,
        ...createProxyConfig(frameworkOptions.symfony || {}, options.configType)
      }
    },
    plugins: [
      ...config.plugins || [],
      SymfonyPreviewPlugin(symfonyOptions),
      TwigLoaderPlugin.vite({
        twigComponentConfiguration: symfonyOptions.twigComponent
      })
    ]
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

export { previewBody, previewHead, viteFinal };
