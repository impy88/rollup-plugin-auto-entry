import * as path from 'path';
import * as rollup from 'rollup';
import fg from 'fast-glob';

export interface RollupPluginOptions {
  include: string[] | undefined,
  scope?: string
}

export default function autoEntry(opts?: RollupPluginOptions): rollup.Plugin {
  let options: RollupPluginOptions = {
    include: undefined,
    scope: ''
  };

  function getInputOptions(input: rollup.InputOption | undefined):string[]|false {
    if (typeof input === 'string') {
      return [input];
    }

    if (Array.isArray(input)) {
      return input;
    }

    return false;
  }

  function hashCode(s:string) {
    for (var h = 0, i = 0; i < s.length; h &= h)
      h = 31 * h + s.charCodeAt(i++);
    return h;
  }

  opts = { ...options, ...opts };

  return {
    name: "rollup-plugin-entries",

    options(rollupOptions) {
      const inputOptions = getInputOptions(rollupOptions.input);
      let resultInput: string[][] = [];
      if (opts?.include && inputOptions) {

        for (const input of inputOptions) {
          const cwd = path.dirname(input);
          const entry = [[
            path.join(opts.scope!, path.relative(cwd, input)),
            input
          ]];

          const files = fg
            .sync(opts.include, { cwd, absolute: true,  ignore: [path.relative(cwd, input)] })
            .map(file => [
              path.join(opts!.scope!, path.relative(cwd, file)),
              file
            ]);

          resultInput = resultInput.concat(entry, files);
        }
      }

      if (resultInput.length) {
        rollupOptions.input = resultInput.reduce<{[key: string]: string}>(
          (acc, [file, path]) => {
            if (acc[file]) {
              file = file.replace(/(.*)\.([a-z0-9]{1,3})$/i, `$1-${hashCode(path)}.$2`)
            }
            acc[file] = path;
            return acc;
          }, {});
      }

      rollupOptions.preserveEntrySignatures = 'allow-extension';

      return rollupOptions;
    },

    outputOptions(opts) {
      opts.entryFileNames = chunkInfo => {
        if (chunkInfo.type === "chunk" && chunkInfo.facadeModuleId) {
          const name = chunkInfo.name.replace(/\.(?:[a-z0-9]+)$/, '')
          return `${name}.mjs`
        }
        return "[name].mjs";
      },

      opts.interop = 'esModule';
      opts.minifyInternalExports = false;

      if (opts.file) {
        opts.dir = path.dirname(opts.file);
        opts.hoistTransitiveImports = false;

        delete opts.file;
      }

      return opts;
    }
  };
}
