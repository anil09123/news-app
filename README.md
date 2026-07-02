# NewsPulse - React + Vite News App

A polished news dashboard built with React, Vite, React Router and React Bootstrap.

## Latest update in this ZIP

- API key support updated through server-side environment variables.
- Added `.env` for local testing and kept `.env` ignored from Git commits.
- Added a custom animated desktop mouse cursor with trailing particles.
- Added live glass navbar, LIVE badge, trending strip, improved hero, stats row, pulse animation, hover shine cards and cleaner modal actions.
- Kept the NewsAPI key away from production browser code by using the Node proxy route `/api/news`.

## Why live deployment was failing with 426

NewsAPI's free Developer plan is meant for development/testing. Browser CORS is enabled for localhost only, so deployed static frontends can fail even when localhost works. This app now calls NewsAPI from the server side in production.

## Local setup

```bash
npm install
```

For normal local Vite development:

```bash
npm run dev
```

For testing the same production proxy flow locally:

```bash
npm run build
npm start
```

## Render deployment

Use Render **Web Service**, not only Static Site, because this project includes a Node proxy.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Environment variable to add in Render:

```env
NEWS_API_KEY=your_newsapi_key_here
```

After changing environment variables, redeploy/restart the service.

## Important

Do not commit `.env` to GitHub. The file is included only for local testing and is ignored by `.gitignore`.
