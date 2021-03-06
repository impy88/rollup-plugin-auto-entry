import * as path from 'path';
import * as rollup from 'rollup';

import Entry from './entry';

export interface RollupPluginOptions {
  include: string[] | undefined
}

export default function autoEntry(opts?: RollupPluginOptions): rollup.Plugin {
  let options: RollupPluginOptions = {
    include: undefined
  };

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

      if (options.include && !module?.isEntry && Entry.isNewEntry(id, options.include)) {
        this.emitFile({
          type: 'chunk',
          id: id,
          importer: id,
          fileName: Entry.getFilenameFor(id),
        });
      }

      return null;

    },

    /**
     * Generate bundle should keep original file extension
     * @param _options
     * @param bundle
     * @param _isWrite
     */
    generateBundle(_options, bundle, _isWrite) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        if (chunk.type === "chunk" && chunk.facadeModuleId) {
          const originalExtension = path.extname(chunk.fileName);
          const targetExtension = path.extname(chunk.facadeModuleId);

          if (originalExtension !== targetExtension) {
            chunk.fileName = chunk.fileName.replace(originalExtension, targetExtension);
          }
        }
      }
    }
  };
}
