import * as path from 'path';
import micromatch from 'micromatch';

// micromatch is cjs, temp workaround
const { isMatch } = micromatch;

export default class Entry {
  private static _modules: string[] = [];

  /**
   * Add new module id in reverse order. That helps to
   * strip module path much closer to current entry
   * @param id
   */
  public static add(id: string) {
    const dirname = path.dirname(id) + path.sep;

    if (!this._modules.includes(dirname)) {
      this._modules.push(dirname);
    }
  }

  /**
   * Generates entrypoint name by stripping module directory
   * @param id
   * @returns stripped filename for entry
   */
  public static getFilenameFor(id: string): string {
    const modules = this._modules
      .map(s => s
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      )
      .sort((a, b) => b.localeCompare(a))
      .join('|');

    return id.replace(new RegExp(modules), '');
  }

  /**
   * Should create entry if matches glob
   *
   * @param id
   * @param include
   * @returns
   */
  public static isNewEntry( id: string, include: string[]) {
    if (include.length) {
      return isMatch(id, include);
    }

    return false;
  }
}
