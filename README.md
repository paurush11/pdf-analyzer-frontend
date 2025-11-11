This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Integration

- Run the auth backend (`pdf_image_analyzer_backend_auth`) locally on `http://localhost:3001/api`, or set `NEXT_PUBLIC_API_BASE` to the deployed URL.
- Provide frontend environment variables (e.g. in `.env.local`):
  - `NEXT_PUBLIC_API_BASE`: Base URL for the auth API (defaults to `http://localhost:3001/api`).
  - `NEXT_PUBLIC_AUTH_POST_LOGIN_URL`: Route users should land on after a successful login (defaults to `/uploads`).
  - `NEXT_PUBLIC_AUTH_POST_LOGOUT_URL`: Route users should land on after logout (defaults to `/`).
- Tokens returned from the backend are persisted in `sessionStorage` by `src/features/auth/AuthProvider.tsx`. Use the `useAuth` hook to access `login`, `logout`, `refresh`, or `verify` helpers inside client components.
- All HTTP calls use `axios` through `src/api/http.ts`, which automatically attaches the access token from session storage to the `Authorization` header.
