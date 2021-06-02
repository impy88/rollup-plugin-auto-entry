import test from 'ava';
import fg from 'fast-glob';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import autoEntry from '../src';

test('generates correct number of bundles with single input', async (t) => {
  const bundle = await rollup({
    input: 'test/fixtures/entry1/index.js',
    plugins: [
      nodeResolve(),
      autoEntry({
        include: [
          '**/index.js'
        ]
      })
    ]
  });

  const entries = await fg('test/fixtures/entry1/**/index.js');
  const { output } = await bundle.generate({ format: 'esm' });

  t.is(output.length, entries.length);
})

test('generates correct number of bundles with multiple input', async (t) => {
  const bundle = await rollup({
    input: [
      'test/fixtures/entry1/index.js',
      'test/fixtures/entry2/index.js',
    ],
    plugins: [
      nodeResolve(),
      autoEntry({
        include: [
          '**/index.js'
        ]
      })
    ]
  });

  const entries = await fg('test/fixtures/**/index.js');
  const { output } = await bundle.generate({ format: 'esm' });

  t.is(output.length, entries.length);
})
