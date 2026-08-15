# CodeBlog Pro 🚀

![CodeBlog Pro Banner](public/assets/categories/architecture.png)

> A modern, production-grade publishing platform for developers. Built with Next.js 14, Tailwind CSS, Prisma, and Auth.js.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeBlog Pro is a full-stack, multi-author blogging platform designed specifically for the developer community. It features a beautiful reading experience, a powerful rich text markdown editor, and robust administrative tools.

## ✨ Features

- **📝 Rich Markdown Editor**: Write seamlessly with a live-preview MDX editor.
- **🎨 Beautiful UI/UX**: Designed with a custom design system, Tailwind CSS, and Radix UI primitives.
- **🔐 Role-Based Access Control**: Secure authentication via Auth.js (Google, GitHub, and Credentials) with Admin, Author, and Reader roles.
- **📊 Admin Dashboard**: Comprehensive analytics, user management, and content moderation.
- **🖼️ Image Management**: Integrated Cloudinary support for seamless image uploads.
- **⚡ Performance Optimized**: Server React Components, dynamic OpenGraph image generation, and instant page loads.
- **🔍 SEO Ready**: Auto-generated sitemaps, RSS feeds, and semantic HTML.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Auth.js v5](https://authjs.dev/)
- **Email**: [Resend](https://resend.com/)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/paradox-suraj/codeBlog-pro.git
   cd codeBlog-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🚀 Deployment

CodeBlog Pro is ready to be deployed to production on Vercel or Netlify.

### Environment Variables for Production
Ensure the following variables are set in your deployment environment:
- `DATABASE_URL` (Your production Postgres URL)
- `NEXTAUTH_URL` (Your production URL, e.g. `https://myblog.com`)
- `NEXTAUTH_SECRET` (A strong random string)
- `GOOGLE_ID` & `GOOGLE_SECRET` (OAuth credentials)
- `CLOUDINARY_URL` (For image uploads)
- `RESEND_API_KEY` (For newsletter features)
- `GOOGLE_GENERATIVE_AI_API_KEY` (For AI tagging & summaries)

A `vercel.json` file is included in this repository to configure the Next.js build automatically.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
