import { execFile } from 'child_process';
import { dedent } from 'ts-dedent';

// src/server/lib/symfony.ts
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
  return new Promise((resolve, reject) => {
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
      resolve(stdout);
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

export { getBundleConfig, getKernelProjectDir, getTwigComponentConfiguration, getTwigConfiguration, runSymfonyCommand, runSymfonyCommandJson };
