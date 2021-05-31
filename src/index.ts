import * as path from 'path';
import * as rollup from 'rollup';
import { isMatch } from 'micromatch';

export interface RollupPluginOptions {
  include: string[]
}

let MODULE_DIR: string;
const PLUGIN_NAME = "rollup-plugin-entries";
let options: RollupPluginOptions = {
  include: []
}

function isNewEntrypoint(id: string) {
  if (options.include) {
    for (const key in options.include) {
      if (isMatch(id, key)) {
        return true;
      }
    }
  }

  return false;
}

export const RollupPluginEntries = (opts: RollupPluginOptions): rollup.Plugin => ({

  name: PLUGIN_NAME,

  buildStart() {
    if (opts) {
      options = { ...options, ...opts };
    }
  },

  outputOptions(opts) {
    if (opts.file) {
      opts.dir = path.dirname(opts.file);
      delete opts.file;
    }

    return opts;
  },

  load(id) {
    const module = this.getModuleInfo(id);

    if (module && module.isEntry) {
      MODULE_DIR = path.dirname(module.id);
    }

    if (isNewEntrypoint(id)) {
      this.emitFile({
        type: 'chunk',
        id: id,
        importer: id,
        fileName: id.replace(`${MODULE_DIR}/`, ''),
      });
    }

    return null;

  },
})
