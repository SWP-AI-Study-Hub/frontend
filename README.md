# AI Study Hub Frontend

React + TypeScript frontend for the AI Study Hub MVP.

## Requirements

- Node.js 24.x or a current LTS version
- npm

## Setup

```bash
npm ci
cp .env.example .env
npm run dev
```

Default API base URL:

```txt
http://localhost:8080/api
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Current Scope

- Authentication pages: login, register, forgot password
- Protected profile page
- Admin user list and user detail pages
- Role-based route guard
- API client configured for HTTP-only cookie auth
