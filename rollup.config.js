import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import pkg from './package.json';

const config = {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  external: ['react', 'react/jsx-runtime'],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modulesOnly: true, // Ensures that only ES modules are bundled
    }),
    typescript({
      tsconfigOverride: { exclude: ['**/*.test.ts','**/*.test.tsx'] },
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.js', '.tsx', '.jsx'],
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
    }),
  ],
};

export default config;
