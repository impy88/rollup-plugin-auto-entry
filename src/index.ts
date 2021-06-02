import * as path from 'path';
import * as rollup from 'rollup';

import Entry from './entry';

export interface RollupPluginOptions {
  include: string[]
}

let options: RollupPluginOptions = {
  include: []
}

export default function autoEntry(opts: RollupPluginOptions): rollup.Plugin {
  return {
    name: "rollup-plugin-entries",

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
        Entry.add(module.id);
      }

      if (!module?.isEntry && Entry.isNewEntry(id, options.include)) {
        this.emitFile({
          type: 'chunk',
          id: id,
          importer: id,
          fileName: Entry.getFilenameFor(id),
        });
      }

      return null;

    },
  };
}
