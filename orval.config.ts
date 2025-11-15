// js-auth.orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
    'js-auth': {
        input: process.env.OPENAPI_URL ?? 'http://localhost:3001/api/openapi.json',
        output: {
            target: 'src/api/generated/js-auth.gen.ts',
            client: 'react-query',
            mode: 'single',
            clean: true,
            override: { mutator: { path: 'src/api/http.ts', name: 'axiosClient' } },
        },
    },
});
