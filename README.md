# amriM - Private Media Server

A beautiful, self-hosted media streaming platform - your private Netflix. Built with Next.js 15, featuring a cinematic dark theme UI.

## 🎬 Features

- **Beautiful UI**: Cinematic dark theme with smooth animations
- **Media Library**: Browse movies and TV shows
- **Content Requests**: Users can request content to be added
- **Admin Dashboard**: Comprehensive admin panel for managing users, requests, and settings
- **User Management**: Role-based access control (Admin/User)
- **Responsive Design**: Works beautifully on all devices

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   cd amriM
   pnpm install
   # or
   npm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Setup Scripts

**Local (Windows PowerShell):**
```powershell
.\scripts\setup-local.ps1
```

**Server (Ubuntu/Linux):**
```bash
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

**Server update (pull/build):**
```bash
chmod +x scripts/update-server.sh
./scripts/update-server.sh
```

## 🚀 GitHub Actions Auto-Deploy (Option C)

### 1) Prepare the server (one-time)
```bash
git clone https://github.com/thetvman/amri.git
cd amri
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2) Add GitHub Secrets
In your GitHub repo → **Settings → Secrets and variables → Actions**, add:
- `SERVER_HOST` (e.g. 123.45.67.89)
- `SERVER_USER` (e.g. ubuntu)
- `SERVER_SSH_KEY` (private key for SSH)
- `SERVER_PATH` (e.g. /home/ubuntu/amri)
- `SERVER_PORT` (optional, default 22)

### 3) Auto-deploy on push
Every push to `main` runs `.github/workflows/deploy.yml`, which:
- SSHs into your server
- Runs `scripts/update-server.sh`
- Rebuilds the app

If you want a systemd service (auto restart), I can add that next.

## 🔐 Authentication Setup

Create an `.env.local` file in `amriM` with:

```
TMDB_API_KEY=your_tmdb_api_key_here
NEXTAUTH_SECRET=your_random_secret
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_password
```

## 🗄️ Database Setup (SQLite)

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run seed:admin
```

## 📁 Project Structure

```
amriM/
├── app/
│   ├── page.tsx              # Home/Library browse
│   ├── request/              # User content requests
│   ├── watch/[id]/           # Video player page
│   └── admin/
│       ├── dashboard/        # Admin overview
│       ├── requests/          # Content request management
│       ├── users/             # User management
│       └── settings/          # System settings
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── menu-bar.tsx          # Navigation menu
│   ├── movie-card.tsx        # Media card component
│   └── search-bar.tsx        # Search component
└── lib/
    └── utils.ts              # Utility functions
```

## 🎨 Design System

The UI uses a consistent design system with:
- **Colors**: Dark cinematic theme with blue/purple accents
- **Components**: Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Inter font family

## 🔐 Admin Access

To access admin pages, navigate to:
- `/admin/dashboard` - Overview and stats
- `/admin/requests` - Manage content requests
- `/admin/users` - User management
- `/admin/settings` - System configuration

## 📝 Current Status

This is a **UI prototype** for investor demonstrations. The interface is fully functional with mock data. Backend integration (database, authentication, media streaming) will be implemented in the next phase.

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Component primitives
- **Lucide Icons** - Icon library

## 📸 Screenshots

- Home page with media library
- Admin dashboard with statistics
- Content request management
- User management interface
- System settings panel

## 🚧 Next Steps

1. Database integration (PostgreSQL + Prisma)
2. Authentication system (NextAuth.js)
3. Media streaming API
4. Content request workflow
5. Library scanning and management

## 📄 License

Private project - All rights reserved
