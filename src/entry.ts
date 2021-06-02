import * as path from 'path';
import micromatch from 'micromatch';

// micromatch is cjs, temp workaround
const { isMatch } = micromatch;

export default class Entry {
  private static _module: string[] = [];

  /**
   * Add new module id in reverse order. That helps to
   * strip module path much closer to current entry
   * @param id
   */
  public static add(id: string) {
    this._module = this._module
      .concat(path.dirname(id) + path.sep)
      .sort((a, b) => b.localeCompare(a));
  }

  /**
   * Generates entrypoint name by stripping module directory
   * @param id
   * @returns stripped filename for entry
   */
  public static getFilenameFor(id: string): string {
    const r = new RegExp(
      this._module
        .join('|')
        .replace(/\//g, '\\/')
    );

    return id.replace(r, '');
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
