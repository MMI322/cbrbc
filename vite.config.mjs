import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };

export default defineConfig({
  base: './',
  plugins: [crx({ manifest })],
  build: {
    outDir: 'crx',
    target: ['chrome88', 'firefox109', 'safari16.4'],
  },
});
