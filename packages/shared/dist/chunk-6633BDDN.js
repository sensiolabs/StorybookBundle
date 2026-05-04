import path from 'path';
import { dedent } from 'ts-dedent';
import fs from 'fs';

// src/server/lib/TwigComponentResolver.ts
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

export { TwigComponentResolver };
