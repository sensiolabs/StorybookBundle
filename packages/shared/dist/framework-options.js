import { getKernelProjectDir, getTwigComponentConfiguration, getTwigConfiguration, getBundleConfig } from './chunk-6RI23XSL.js';
import { resolve } from 'path';

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

export { getBuildOptions };
