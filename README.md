# Community Webboard

A lightweight webboard application built with **Next.js (App Router)**, **Prisma**, and **PostgreSQL**.

Users can register, login, create posts, comment, like posts, and delete their own content.

---

## Features

- User registration and login
- Create and view discussion posts
- Post detail page with comments
- Like / Unlike posts
- Delete own comments
- Delete own posts (owner-only)
- Pagination for post feed
- Responsive UI (mobile + desktop)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Password Hashing:** bcrypt

---

## Project Structure

- `app/` - Pages, layouts, components, API routes
- `app/api/` - Backend route handlers
- `app/posts/[id]/page.tsx` - Post detail page
- `prisma/schema.prisma` - Database schema
- `app/components/Navbar.tsx` - Navigation UI

---

## Getting Started

### 1) Install dependencies

Run in project root:

- `npm install`

### 2) Configure environment variables

Create/update `.env`:

- `DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"`

### 3) Prepare database

- `npx prisma generate`
- `npx prisma migrate dev --name init`

If you already have migrations, use:

- `npx prisma migrate dev`

### 4) Start development server

- `npm run dev`

Open:

- `http://localhost:3000`

If port 3000 is used, Next.js will choose another port automatically.

---

## API Endpoints (Summary)

### Auth

- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Posts

- `GET /api/posts?page=1&limit=10` - List posts (paginated)
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Get post detail
- `PUT /api/posts/[id]` - Update post (owner only)
- `DELETE /api/posts/[id]` - Delete post (owner only)

### Comments

- `POST /api/comments` - Create comment
- `DELETE /api/comments` - Delete comment (owner only)

### Likes

- `GET /api/likes?post_id=...&user_id=...` - Like status and count
- `POST /api/likes` - Toggle like/unlike

---

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## Troubleshooting

### 1) Conflicting route/page error

If you see:

`Conflicting route and page at /api/posts/[id]`

Ensure this file does **not** exist:

- `app/api/posts/[id]/page.tsx`

Only `route.ts` should be inside API folders.

### 2) Prisma / DB issues

- Verify `DATABASE_URL` in `.env`
- Re-run: `npx prisma generate`
- Re-run: `npx prisma migrate dev`

### 3) Hydration mismatch

- Avoid using browser-only APIs during initial server render
- For auth UI, read `localStorage` only in client-safe patterns

---

## Notes

- This project currently uses client-side storage for basic auth state.
- For production, consider secure auth with HTTP-only cookies and proper session/JWT management.

---

## License

For educational and portfolio use.
