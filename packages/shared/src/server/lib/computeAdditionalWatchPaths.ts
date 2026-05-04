import { join } from 'path';
import isGlob from 'is-glob';
import { glob } from 'glob';
import fs from 'node:fs';
import { logger } from 'storybook/internal/node-logger';
import { dedent } from 'ts-dedent';

type AdditionalWatchPaths = {
    dirs: string[];
    files: string[];
};

export const computeAdditionalWatchPaths = (paths: string[], baseDir: string) => {
    const result: AdditionalWatchPaths = {
        dirs: [],
        files: [],
    };

    paths
        .map((v) => join(baseDir, v))
        .forEach((watchPath) => {
            if (isGlob(watchPath)) {
                result.files.push(
                    ...glob.sync(watchPath, {
                        dot: true,
                        absolute: true,
                    })
                );
            } else {
                try {
                    const stats = fs.lstatSync(watchPath);
                    (stats.isDirectory() ? result.dirs : result.files).push(watchPath);
                } catch (err) {
                    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
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
