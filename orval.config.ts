import { defineConfig } from 'orval';

export default defineConfig({
    backend: {
        input: process.env.OPENAPI_URL || 'http://localhost:3000/swagger.json',
        output: {
            target: 'src/api/generated/index.ts',
            client: 'axios',
            mode: 'single',
            override: {
                mutator: { path: 'src/api/http.ts', name: 'axiosClient' },
            },
        },
    },
});
