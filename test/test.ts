import test from 'ava';
import fg from 'fast-glob';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import autoEntry from '../src/index';

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

  await bundle.close();
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

  await bundle.close();
})

test('generates correct number of bundles if no options were provided', async (t) => {
  const bundle = await rollup({
    input: 'test/fixtures/entry1/index.js',
    cache: false,
    plugins: [
      nodeResolve(),
      autoEntry()
    ]
  });

  const { output } = await bundle.generate({ format: 'esm' });
  t.is(output.length, 1);

  await bundle.close();
})

test('generates number of chunks for deep nesting', async (t) => {
  const bundle = await rollup({
    input: 'test/fixtures/entry3/index.mjs',
    plugins: [
      nodeResolve(),
      autoEntry({
        include: [
          '**/index.mjs'
        ]
      })
    ]
  });

  const entries = await fg('test/fixtures/entry3/**/index.mjs');
  const { output } = await bundle.generate({ format: 'esm' });

  const nonNullItems = output.filter(i => i.type == 'chunk' && i.facadeModuleId)

  t.is(nonNullItems.length, entries.length);

  await bundle.close();
})
