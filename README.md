# Estin Blog

A modern blogging platform for Estin students and teachers to share their thoughts, experiences, and knowledge.

## Features

- 🔐 **Email/Password Authentication** - Secure login with credentials
- 📝 **Blog Posting** - Students and teachers can create and share blogs
- 💬 **Comments** - Engage with the community through comments
- ❤️ **Likes** - Show appreciation for content you enjoy
- 👥 **User Roles** - Student, Teacher, and Admin roles
- 🎛️ **Admin Dashboard** - Manage users and their roles
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **NextAuth.js** - Authentication with credentials provider
- **Prisma** - Database ORM
- **PostgreSQL** - Database (hosted on Prisma Data Platform)
- **bcryptjs** - Password hashing
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use Prisma Data Platform)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd eblog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string
   ```

   To generate a secure `NEXTAUTH_SECRET`, you can run:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   npm run prisma:generate
   npx prisma db push
   ```
   
   Or create a migration:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## User Roles

- **Student** - Default role for new users. Can post blogs, comment, and like.
- **Teacher** - Same permissions as students (can be assigned by admin).
- **Admin** - First user to sign up automatically becomes admin. Can manage users, delete any blog/comment, and change user roles.

## Project Structure

```
eblog/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── blogs/            # Blog pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utility functions
├── prisma/               # Database schema
└── types/                # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## License

MIT
