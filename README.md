# ITTR Cognivus Frontend

Vue 3 single-page frontend for the ITTR Cognivus learning management system. It renders dashboards for student, lecturer, and admin roles and communicates with the Express/Supabase backend through a centralized API client.

## Stack

- Vue 3 with Composition API and Vite 7
- Vue Router 4 for nested, role-aware routing
- Tailwind CSS 4 and Flowbite components
- Axios with JWT interceptor
- Supabase JS SDK for session handling
- CryptoJS-based secure localStorage wrapper
- Vitest, Vue Test Utils, and Happy DOM for testing

## Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── pages/
│   ├── router/
│   ├── services/
│   ├── store/
│   ├── utils/
│   └── tests/
├── vite.config.js
├── vitest.config.js
└── package.json
```

## Setup

Prerequisites: Node.js 18.17 or newer and a running backend at `http://localhost:5000`.

```fish
cd frontend
npm install
```

Create `.env` with:

```properties
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_ENCRYPTION_KEY="base64-32-byte-secret"
```

Start development mode:

```fish
npm run dev
```

Build for production:

```fish
npm run build
npm run preview
```

## Scripts

- `npm run dev` – launch Vite dev server
- `npm run build` – build optimized bundle
- `npm run preview` – preview production build
- `npm run test` – run Vitest suite
- `npm run test:watch` / `test:coverage` / `test:ui` – additional test modes

## Authentication

`authStore` keeps Supabase session data, derives the active role, and persists token, user, role, and expiry using the encrypted storage utility. Tokens expire after three hours and a background timer enforces automatic logout when the expiry passes.

## API Client

`src/services/api.js` contains resource-specific helpers that attach the stored JWT and handle multipart uploads. Update this file when backend endpoints change. Adjust the Axios base URL before deploying to other environments.

## Testing

Vitest is configured through `vitest.config.js` with `src/tests/setup.js` providing DOM mocks and a secure localStorage shim. Run `npm run test` to execute the suite.

## Deployment

1. Configure environment variables on your hosting platform.
2. Run `npm run build` to produce the `dist/` directory.
3. Serve `dist/` via your chosen static host.
4. Point the Axios base URL to the live backend.

## Contribution

1. Fork the repository and create a feature branch.
2. Install dependencies and run the dev server.
3. Update or add tests for behavior changes.
4. Submit a pull request with a summary of the updates.
