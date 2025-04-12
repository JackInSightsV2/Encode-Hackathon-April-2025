# Next.js PWA with Tailwind CSS v3

This project is a Progressive Web App (PWA) built with Next.js and Tailwind CSS v3.

## Features

- Next.js App Router
- Progressive Web App (PWA) capabilities with next-offline
- Tailwind CSS v3 for styling
- TypeScript for type safety
- ESLint for code linting

## Setup Steps Completed

1. Created Next.js project
2. Configured Tailwind CSS v3 (downgraded from v4)
3. Added PWA functionality with next-offline
4. Created manifest.json for PWA features
5. Added PWA meta tags to the layout component
6. Created placeholder icons for PWA
7. Setup service worker registration

## Important Notes

- Tailwind CSS v3 is used instead of v4 as specified
- We're using next-offline for PWA features instead of next-pwa for better compatibility
- Icons in `/public/icons` should be replaced with real icons
- The service worker is registered in both development and production environments

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm run start
```

## PWA Requirements

For the PWA to work properly in production:

1. Replace placeholder icons in `/public/icons` with real PNG images of the specified dimensions
2. Make sure your hosting provider serves the manifest.json file correctly
3. The app must be served over HTTPS for PWA features to work
4. The service worker file is generated automatically during the build process 