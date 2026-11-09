# NexaFlow 🚀

> Modern, high-performance Project Management & Operations Telemetry Platform built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

NexaFlow provides cross-functional teams with a workspace for managing projects, tracking deliverables across interactive Kanban and table views, orchestrating teams, and monitoring real-time operational analytics and continuous activity feeds.

---

## ✨ Features

- **📊 Comprehensive Analytics & Operations**:
  - **Work Completed Chart**: 24-bar distribution histogram with animated hover tooltips.
  - **Hours Logged Chart**: Smooth cubic bezier wave area chart with monetary tracking and trend indicators.
  - **Project Summary Speedometer**: 180° semi-circular radial gauge with radiating tick capsules and color-coded completion segments.
  - **Detailed Activity Log**: Continuous timeline displaying mentions, access requests with one-click approval/denial, 3D stacked calendar event cards, file attachments, and live dashboard operations.
- **📁 Project Workspaces**:
  - Multi-project tracking with milestones, member allocations, and progress indicators.
  - Project detail modals, status assignment, and quick actions.
- **📋 Task Pipeline**:
  - Flexible views: **Kanban Board**, **Interactive Table**, and **List View**.
  - Drag-and-drop / status transitions (`To Do`, `In Progress`, `In Review`, `Approved`, `Completed`).
  - Priority management (`Urgent`, `High`, `Medium`, `Low`) and assignee filters.
- **👥 Team Spaces**:
  - Modular team cards with quick project assignment popovers.
  - Slide-out members drawer with inline role selection, active/on-leave status toggles, and workspace user invites.
- **🌍 Full Internationalization (i18n)**:
  - First-class support for English (`/en/...`) and French (`/fr/...`) powered by `next-intl`.
- **🎨 Modern Design & Dark Mode**:
  - Light, Dark, and System theme preferences with persistent local state.
  - Custom brand colors and responsive layouts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/turbopack`
- **Data & State**: [@tanstack/react-query v5](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Lottie React](https://github.com/Gamote/lottie-react)
- **Internationalization**: [next-intl](https://next-intl.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) & [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `v20.x` or higher (Recommended: `v20.18+` or `v22.x`)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`

Verify your Node installation:
```bash
node -v
npm -v
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexaflow.git
cd nexaflow
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will start on **`http://localhost:3000`** with Turbopack acceleration.

### 4. Open in Your Browser

Navigate to:
- **English**: [http://localhost:3000/en](http://localhost:3000/en)
- **French**: [http://localhost:3000/fr](http://localhost:3000/fr)

Root visits to `http://localhost:3000` automatically negotiate and route to your preferred locale.

---

## 🌐 Public Sharing with ngrok (Optional)

If you wish to test on physical mobile devices or share a live link with collaborators:

```bash
# Expose port 3000
ngrok http 3000

# Or using a reserved custom domain
ngrok http --domain=your-subdomain.ngrok-free.dev 3000
```

> **Note**: NexaFlow is preconfigured in `next.config.ts` to allow cross-origin requests from ngrok tunnels (`*.ngrok-free.dev`, `*.ngrok-free.app`).

---

## 🏗️ Production Build

To build the optimized production bundle and start the production server:

```bash
# 1. Type check and build bundle
npm run build

# 2. Start production server
npm run start
```

---

## 📂 Project Structure

```text
nexaflow/
├── messages/                   # i18n translation dictionaries (en.json, fr.json)
├── public/                     # Static assets, avatars, and animations
├── src/
│   ├── app/                    # Next.js App Router localized pages
│   │   ├── [locale]/
│   │   │   ├── analytics/      # Analytics & Operations page
│   │   │   ├── projects/       # Projects space page
│   │   │   ├── roadmap/        # Roadmap & milestones page
│   │   │   ├── settings/       # Settings & preferences page
│   │   │   ├── tasks/          # Tasks board, table, and list page
│   │   │   ├── team/           # Team management page
│   │   │   ├── layout.tsx      # Root localized layout
│   │   │   └── page.tsx        # Dashboard home page
│   ├── data/                   # Initial user profiles and mock seed data
│   ├── features/               # Modular domain feature slices
│   │   ├── analytics/          # Charts, operational telemetry, and activity log
│   │   ├── home/               # Dashboard widgets, stats grid, and calendar
│   │   ├── projects/           # Project cards, creation modal, and detail views
│   │   ├── settings/           # Settings tabs, appearance, theme controls
│   │   ├── tasks/              # Task board, table, list, and filters
│   │   └── team/               # Team cards, project assign menu, member drawer
│   ├── hooks/                  # Global React Query hooks (useDashboardData)
│   ├── layouts/                # Header, Sidebar, and AppShell layout components
│   ├── lib/                    # Storage API and localStorage synchronization engine
│   └── providers/              # AppProviders (React Query, ThemeProvider, Toaster)
├── next.config.ts              # Next.js configuration & image remote patterns
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts local Next.js dev server with Turbopack on port 3000 |
| `build` | `npm run build` | Compiles and builds production-optimized bundle |
| `start` | `npm run start` | Runs the compiled production server |
| `lint` | `npm run lint` | Runs ESLint analysis across the repository |
| `type-check` | `npx tsc --noEmit` | Runs TypeScript compiler checks without emitting files |

---

## 📄 License

This project is licensed under the MIT License.
