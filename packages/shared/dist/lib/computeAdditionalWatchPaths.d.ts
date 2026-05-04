type AdditionalWatchPaths = {
    dirs: string[];
    files: string[];
};
declare const computeAdditionalWatchPaths: (paths: string[], baseDir: string) => AdditionalWatchPaths;

export { computeAdditionalWatchPaths };
