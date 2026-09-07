import { rmSync } from 'node:fs';

rmSync('.wrangler/deploy/config.json', { force: true });
