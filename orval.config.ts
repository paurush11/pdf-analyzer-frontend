// js-auth.orval.config.ts
import { defineConfig } from 'orval';
import dotenv from "dotenv"
dotenv.config({ path: '.env.local' });
const backendUrl = process.env.BACKEND_API_URL ?? 'http://localhost:3001';
export default defineConfig({
    'js-auth': {
        input: backendUrl + '/api/openapi.json',
        output: {
            target: 'src/api/generated/js-auth.gen.ts',
            client: 'react-query',
            mode: 'single',
            clean: true,
            override: { mutator: { path: 'src/api/http.ts', name: 'axiosClient' } },
        },
    },
});
