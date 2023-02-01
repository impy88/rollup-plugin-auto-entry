import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  plugins: [
    typescript({ sourceMap: false, tsconfig: "./tsconfig.pkg.json" })
  ],
  external: ['path', ...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)],
  output: [
    { format: 'cjs', file: pkg.main, exports: 'auto' },
    { format: 'esm', file: pkg.module }
  ]
};
