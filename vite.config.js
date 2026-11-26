import {cloudflare} from '@cloudflare/vite-plugin';
import {defineConfig} from 'vite';
import vinext from 'vinext';
import {sites} from './scripts/vite/sites-vite-plugin.ts';

export default defineConfig({
  plugins: [
    vinext(),
    sites({mockAuth:false}),
    cloudflare({
      viteEnvironment:{name:'rsc',childEnvironments:['ssr']},
      config:{
        name:'mindtest',
        main:'./worker/index.js',
        compatibility_date:'2026-05-15',
        compatibility_flags:['nodejs_compat']
      }
    })
  ]
});
