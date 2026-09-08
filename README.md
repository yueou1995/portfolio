# Yue Ou Portfolio

Personal portfolio for Yue Ou, built with Next.js, TypeScript, and Tailwind CSS.

## Run Locally

Use Node.js 22.18 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js.

## Production

```sh
npm run build
npm start
```

## Cloudflare

Use `npm run deploy` as the Cloudflare Builds deploy command. It builds and deploys the Worker.

For a local Workers preview:

```sh
npm run build:cloudflare
npm run preview:cloudflare
```
