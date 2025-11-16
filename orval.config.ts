// js-auth.orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
    'js-auth': {
        input: process.env.BACKEND_API_URL + '/api/openapi.json',
        output: {
            target: 'src/api/generated/js-auth.gen.ts',
            client: 'react-query',
            mode: 'single',
            clean: true,
            override: { mutator: { path: 'src/api/http.ts', name: 'axiosClient' } },
        },
    },
});
