import { join } from 'path';
import isGlob from 'is-glob';
import { glob } from 'glob';
import fs from 'node:fs';
import { logger } from '@storybook/node-logger';
import dedent from 'ts-dedent';

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
                result.files.concat(
                    glob.sync(watchPath, {
                        dot: true,
                        absolute: true,
                    })
                );
            } else if (fs.existsSync(watchPath)) {
                const stats = fs.lstatSync(watchPath);
                (stats.isDirectory() ? result.dirs : result.files).push(watchPath);
            } else {
                logger.warn(dedent`
                    Ignoring additional watch path '${watchPath}': path doesn't exists.
                `);
            }
        });

    return result;
};
