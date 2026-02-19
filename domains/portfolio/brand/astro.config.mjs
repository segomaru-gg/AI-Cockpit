// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://docs.astro.build/en/guides/configuring-astro/
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    })
});
