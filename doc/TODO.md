# NexaFlow — Technical Challenge Implementation Roadmap & Master TODO List

**Project:** NexaFlow — Enterprise-Grade Project & Task Management Dashboard  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4  
**Architecture:** Feature-Based Modular Architecture with Strict Separation of Concerns  
**Duration:** 5 Hours (11:00 AM – 4:00 PM)  
**Total Points:** 100 Points  

---

## 1. Architecture & Code Philosophy

To ensure **clean code**, **zero bulky/monolithic components**, and **strict separation of concerns**, the codebase adheres to these modular standards:

```text
src/
├── app/                  # Next.js 16 App Router (Lean Orchestrators < 35 lines)
├── components/ui/        # Dumb, reusable atomic UI primitives (No domain knowledge)
├── layouts/              # App Shell components (Sidebar, Header, MobileNav, Shell)
├── context/              # Central reactive store & theme state engine
├── providers/            # Provider composers
├── features/             # Domain-encapsulated feature slices:
│   ├── home/             # Overview dashboard domain
│   ├── projects/         # Projects hub & dynamic project workspace domain
│   ├── tasks/            # Tasks list & Kanban board domain
│   ├── team/             # Team roster & capacity/workload domain
│   ├── roadmap/          # Timeline & Gantt visualization domain
│   ├── analytics/        # Progress distribution & performance charts
│   └── notifications/    # Real-time event log & notifications feed
├── lib/                  # Local storage persistence, constants & realistic seed data
└── utils/                # Pure utility functions (cn, date helpers, CSV export)
```

### Clean Code Rules
1. **Single Responsibility:** Every component does exactly one thing. Container components fetch/select state; presentational components render UI.
2. **Lean App Router Pages:** Pages inside `src/app/` only mount feature containers and handle route parameters. No inline business logic or giant JSX trees.
3. **Domain Encapsulation:** Each feature inside `src/features/<feature>/` owns its own `types/`, `components/`, `hooks/`, `api/`, and `utils/`.
4. **Decoupled State Engine:** A centralized `ProjectContext` handles simulated local storage persistence, reactive CRUD, activity logging, and dynamic KPI calculations across all pages.

---

## 2. Complete 8-Page Ecosystem & Interconnection Map

| Route | Page | Purpose & Key Capabilities | Interconnections |
|---|---|---|---|
| `/` | **Dashboard Overview** | Executive command center with welcome banner, live KPI stat cards, recent projects, upcoming tasks widget, and progress visualizer. | Aggregates data from `projects`, `tasks`, and `activityLog`. Links out to `/projects`, `/tasks`, and `/projects/[id]`. |
| `/projects` | **Projects Hub** | Global project catalog with live text search, status filters (*All*, *In Progress*, *Completed*, *Pending*), sort controls, view toggle (*Grid* vs *Table*), and CSV export. | Cards deep-link to `/projects/[id]`. Manager selector links to `/team`. Trigger for `CreateProjectModal`. |
| `/projects/[id]` | **Project Workspace** | Deep-dive dynamic project workspace with hero banner, status dropdown, countdown timer, and 4 scoped tabs (*Project Tasks*, *Milestones/Phases*, *Activity Log*, *Project Specs*). | Changing task status inside here recalculates project progress %, updating `/`, `/projects`, and `/analytics`. |
| `/tasks` | **Tasks & Kanban** | Dedicated task workspace with dual view modes (*List/Table* and *3-Column Kanban Board*), priority filters (*High*, *Medium*, *Low*), and instant status updates. | Grouped by or filtered by project or team assignee. Updates reflect immediately on team workload meters. |
| `/team` | **Team & Workload** | Team directory with member avatars, roles, department tags, active project ownership, and visual workload/capacity gauges. | Feeds the manager dropdown in `CreateProjectModal`. Clicking a member filters `/tasks?assignee=[id]`. |
| `/roadmap` | **Roadmap / Timeline** | Interactive horizontal Gantt-style timeline displaying project spans from creation date to deadline, color-coded with progress fills and milestones. | Visualizes the temporal relationship of project deadlines from `projects`. Clicking bars links to `/projects/[id]`. |
| `/analytics` | **Analytics & Visuals** | Deep visual representation of project progress, status distribution donut, task volume by priority, and team allocation metrics. | Real-time computed charts reflecting state from `projects` and `tasks`. |
| `/settings` | **Settings & Data Engine** | Theme configuration (Dark / Light / System), workspace metadata, and evaluator test controls (*Reset Demo Data*, *Seed Bulk Data*, *Export JSON*). | Drives `ThemeContext`. Resetting demo data updates all pages instantaneously without full page reload. |
| *Header Overlay* | **Activity & Notification Center** | Real-time drawer/popover tracking all user actions (*Project created*, *Task completed*, *Deadline updated*). | Automatically logged on every mutation across any page. |

---

## 3. 5-Hour Test Schedule & Execution Priority

```text
[11:00 AM] ── Phase 1: Architecture, Types & Data Simulation ── (20 min)
[11:20 AM] ── Phase 2: Design System, UI Primitives & Layout Shell ── (40 min)
[12:00 PM] ── Phase 3: Core State & Mandatory Feature Modules ── (75 min)
[01:15 PM] ── Phase 4: Main Dashboard, Modal & Project Workspace (/projects/[id]) ── (60 min)
[02:15 PM] ── Phase 5: High-Impact Expansions (/team, /settings, /roadmap, /analytics) ── (45 min)
[03:00 PM] ── Phase 6: Interactions, Dark Mode, Kanban D&D, Command Palette ── (30 min)
[03:30 PM] ── Phase 7: Responsive Polish, A11y, Edge Cases & Verification ── (15 min)
[03:45 PM] ── Phase 8: Final README, Build Check & Presentation Prep ── (15 min)
[04:00 PM] ── Submission Complete (100/100 points)
```

### Strategic Implementation Tiers
* **Tier 1 (Mandatory Core — 0 to 70 pts):** Main Dashboard (`/`), Projects Hub (`/projects`), Tasks Hub (`/tasks`), Create Project Modal with validation, and responsive Layout Shell.
* **Tier 2 (High-Value Architecture Polish — 70 to 85 pts):** Dynamic Project Workspace (`/projects/[id]`), Team Directory (`/team`), Settings & Demo Data Reset (`/settings`).
* **Tier 3 (Bonus Standouts — 85 to 100 pts):** Interactive Roadmap (`/roadmap`), Drag-and-Drop Kanban, Dark mode, Command Palette (`Cmd+K`), and CSV export.

---

## 4. Master Implementation Checklist

### Phase 1: Architecture, Types & Data Simulation (11:00 AM – 11:20 AM)

#### 1.1 TypeScript Domain Models (`src/features/*/types/`)
- [ ] Create `src/features/projects/types/project.types.ts`
  - `ProjectStatus`: `'In Progress' | 'Completed' | 'Pending'`
  - `ProjectManager`: `{ id: string; name: string; email: string; avatar: string; role: string; department: string }`
  - `Project`: `{ id: string; name: string; description: string; manager: ProjectManager; deadline: string; status: ProjectStatus; progress: number; color: string; createdAt: string; taskCount?: number; tags?: string[] }`
  - `ProjectFilterState`: `{ search: string; status: ProjectStatus | 'All'; sortBy: 'deadline' | 'progress' | 'name'; sortOrder: 'asc' | 'desc'; viewMode: 'grid' | 'table' }`
- [ ] Create `src/features/tasks/types/task.types.ts`
  - `TaskPriority`: `'Low' | 'Medium' | 'High'`
  - `TaskStatus`: `'To Do' | 'In Progress' | 'Completed'`
  - `Task`: `{ id: string; title: string; description?: string; priority: TaskPriority; status: TaskStatus; deadline: string; projectId: string; assigneeId?: string }`
  - `TaskFilterState`: `{ search: string; priority: TaskPriority | 'All'; status: TaskStatus | 'All'; projectId: string | 'All'; assigneeId: string | 'All' }`
- [ ] Create `src/features/team/types/team.types.ts`
  - `TeamMember`: `{ id: string; name: string; email: string; role: string; department: string; avatar: string; capacity: number; activeTaskCount: number; status: 'Active' | 'On Leave' }`
- [ ] Create `src/features/home/types/dashboard.types.ts`
  - `DashboardStats`: `{ activeProjects: number; completedTasks: number; overdueTasks: number; totalProjects: number; overallProgress: number }`
- [ ] Create `src/features/notifications/types/activity.types.ts`
  - `ActivityItem`: `{ id: string; type: 'project_created' | 'task_status_changed' | 'project_completed' | 'member_assigned'; title: string; description: string; timestamp: string; actorName: string; actorAvatar: string }`

#### 1.2 Infrastructure, Seed Data & Storage Helpers (`src/lib/` & `src/utils/`)
- [ ] Create `src/lib/constants.ts`: Color identities, department lists, priority badge mappings, status styles
- [ ] Create `src/lib/seedData.ts`:
  - 6 realistic projects (diverse statuses, dates, managers, colors, and progress ratios)
  - 16 realistic tasks (distributed across projects, statuses, and priorities; includes upcoming and overdue items)
  - 5 realistic team members with avatars and departments
  - Initial activity events feed
- [ ] Create `src/lib/storage.ts`: SSR-safe `localStorage` helper with fallbacks (`getItem`, `setItem`, `removeItem`)
- [ ] Create `src/utils/cn.ts`: Classnames / Tailwind merge utility
- [ ] Create `src/utils/date.ts`: Formatter, relative date parser ("due in 2 days", "3 hours ago"), and overdue detector

---

### Phase 2: Design System, UI Primitives & Layout Shell (11:20 AM – 12:00 PM)

#### 2.1 Atomic Reusable UI Components (`src/components/ui/`)
- [ ] `src/components/ui/Button.tsx`: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), loading spinner
- [ ] `src/components/ui/Badge.tsx`: Semantic status and priority pills with light/dark tokens
- [ ] `src/components/ui/Input.tsx`: Accessible text input with label, icon support, and validation error message
- [ ] `src/components/ui/Select.tsx`: Accessible select dropdown
- [ ] `src/components/ui/ProgressBar.tsx`: Animated progress bar with percentage indicator and custom accent colors
- [ ] `src/components/ui/Modal.tsx`: Accessible dialog with focus trap, ESC listener, backdrop blur, and close button
- [ ] `src/components/ui/Card.tsx`: Compound card (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`)
- [ ] `src/components/ui/Avatar.tsx`: Avatar image with fallback initials and online/status indicator
- [ ] `src/components/ui/Tabs.tsx`: Accessible tab switcher for sub-views
- [ ] `src/components/ui/EmptyState.tsx`: Reusable empty state view with illustration icon, title, description, and action button
- [ ] `src/components/ui/Toast.tsx`: Toast notification container and trigger helper for feedback messages

#### 2.2 Global Layout Chrome (`src/layouts/`)
- [ ] `src/layouts/Sidebar.tsx`:
  - Brand header with NexaFlow logo and name
  - Navigation links:
    - Overview (`/`)
    - Projects (`/projects`)
    - Tasks (`/tasks`)
    - Team (`/team`)
    - Roadmap (`/roadmap`)
    - Analytics (`/analytics`)
    - Settings (`/settings`)
  - Active route highlighting using `usePathname()`
  - Badge counter for overdue tasks alert
  - Responsive desktop collapse/expand toggle
- [ ] `src/layouts/Header.tsx`:
  - Quick Search / Command Palette shortcut button (`Ctrl/Cmd + K`)
  - Notifications Bell with unread counter badge and slide-over / dropdown trigger
  - Dark / Light mode toggle switch
  - User Profile pill (*"Alex Morgan – Product Lead"*)
- [ ] `src/layouts/MobileNav.tsx`: Responsive mobile drawer with backdrop and hamburger button
- [ ] `src/layouts/DashboardShell.tsx`: Master responsive container wrapping Sidebar, Header, and page content

---

### Phase 3: Core State & Mandatory Feature Modules (12:00 PM – 01:15 PM)

#### 3.1 Central State Management (`src/context/` & `src/providers/`)
- [ ] Create `src/context/ProjectContext.tsx`:
  - State: `projects`, `tasks`, `teamMembers`, `activityLog`, `stats`
  - Actions:
    - `addProject(dto: CreateProjectDTO): void`
    - `updateProject(id: string, updates: Partial<Project>): void`
    - `deleteProject(id: string): void`
    - `updateTaskStatus(taskId: string, newStatus: TaskStatus): void`
    - `addTask(dto: CreateTaskDTO): void`
    - `logActivity(action: string, details: string): void`
    - `resetToDemoData(): void`
    - `seedBulkData(): void`
  - Dynamic Computed Getters:
    - `activeProjectsCount`
    - `completedTasksCount`
    - `overdueTasksCount`
    - `overallProgress`
  - Automatic synchronization with `localStorage`
- [ ] Create `src/context/ThemeContext.tsx`: Light / Dark / System mode persistence
- [ ] Create `src/providers/AppProviders.tsx`: Composes ThemeProvider and ProjectProvider

#### 3.2 Projects Feature (`src/features/projects/`)
- [ ] `src/features/projects/hooks/useProjectFilters.ts`: Live text search, status filtering, and sorting logic
- [ ] `src/features/projects/components/ProjectCard.tsx`:
  - Visual identity color bar / badge
  - Manager avatar and name
  - Interactive progress bar with percentage indicator
  - Deadline countdown and status badge
  - Task count summary
  - Click-through navigation to `/projects/[id]`
- [ ] `src/features/projects/components/ProjectTable.tsx`: Full tabular view alternative for projects
- [ ] `src/features/projects/components/ProjectToolbar.tsx`:
  - Search input with clear button
  - Status filter pill buttons (*All*, *In Progress*, *Completed*, *Pending*)
  - Sort selector (*Deadline*, *Progress*, *Name*)
  - View switcher (*Grid* vs *Table*)
  - CSV Export button
  - "New Project" primary action button
- [ ] `src/features/projects/components/ProjectListContainer.tsx`: Coordinates toolbar, list/grid rendering, and empty states
- [ ] Create App Route `src/app/projects/page.tsx` (Mounts `ProjectListContainer`)

#### 3.3 Tasks Feature (`src/features/tasks/`)
- [ ] `src/features/tasks/hooks/useTaskFilters.ts`: Filtering by priority, status, project, and assignee
- [ ] `src/features/tasks/components/TaskItem.tsx`:
  - Title and deadline
  - Priority badge (*High* = Red, *Medium* = Amber, *Low* = Blue)
  - Associated project tag
  - Interactive status dropdown to update status without reload
- [ ] `src/features/tasks/components/TaskList.tsx`: Clean tabular / list presentation of tasks
- [ ] `src/features/tasks/components/TaskKanbanBoard.tsx`:
  - 3 columns: *To Do*, *In Progress*, *Completed*
  - Interactive card move buttons or drag-and-drop
  - Column item counter badges
- [ ] `src/features/tasks/components/TaskToolbar.tsx`: Priority filter, project selector, and search
- [ ] Create App Route `src/app/tasks/page.tsx` (Mounts task container with List / Kanban view switcher)

---

### Phase 4: Main Dashboard, Modal & Project Workspace (01:15 PM – 02:15 PM)

#### 4.1 Main Dashboard Feature (`src/features/home/`)
- [ ] `src/features/home/components/WelcomeBanner.tsx`: Personalized greeting, live date, and quick action buttons
- [ ] `src/features/home/components/StatCard.tsx`: KPI card micro-component with icon, metric, trend indicator, and tooltip
- [ ] `src/features/home/components/StatsGrid.tsx`:
  - *Active Projects* count
  - *Completed Tasks* count
  - *Overdue Tasks* count (urgent alert styling)
  - *Overall Health / Progress* percentage
- [ ] `src/features/home/components/RecentProjectsWidget.tsx`: Top 3 recent projects with progress bars and quick links
- [ ] `src/features/home/components/UpcomingTasksWidget.tsx`: Top urgent tasks with quick status checkboxes
- [ ] `src/features/home/components/ProgressVisualizer.tsx`: Visual progress breakdown (stacked progress bar or SVG ring)
- [ ] Update `src/app/page.tsx` to mount `DashboardOverviewContainer`

#### 4.2 Project Creation Modal (`src/features/projects/components/CreateProjectModal.tsx`)
- [ ] Modal trigger accessible from Header, Dashboard, and Projects page
- [ ] Form Fields:
  - Name (text, required)
  - Description (textarea, required)
  - Assigned Manager (select populated from `teamMembers`, required)
  - Deadline (date picker, required)
  - Initial Status (*In Progress*, *Pending*, required)
  - Color Accent (preset color picker)
- [ ] Form Validation: Inline error messages, disables submit if invalid
- [ ] Optimistic Local State Addition:
  - Adds new project to local state and updates stats immediately without reload
  - Appends record to `activityLog`
  - Closes modal on successful submit
  - Shows success toast feedback
  - Resets form state
- [ ] Keyboard accessibility: Close on Escape key, close on backdrop click, keyboard focus trap

#### 4.3 Dynamic Project Workspace Feature (`src/features/projects/` & `src/app/projects/[id]/`)
- [ ] `src/features/projects/components/ProjectWorkspaceHero.tsx`:
  - Visual identity accent header
  - Project name, editable description, and manager pill
  - Due date countdown timer badge (*"Due in 3 days"*)
  - Status change dropdown (*In Progress*, *Completed*, *Pending*)
- [ ] `src/features/projects/components/ProjectWorkspaceTabs.tsx`:
  - **Tab 1: Tasks:** Scoped task list showing only tasks for this project + quick inline "Add Task"
  - **Tab 2: Milestones:** Visual phase tracker (*Discovery ➔ Design ➔ Build ➔ QA ➔ Launch*)
  - **Tab 3: Activity:** Filtered audit log for this project
  - **Tab 4: Project Specs:** Rendered markdown document showing scope and deliverables
- [ ] Create App Route `src/app/projects/[id]/page.tsx` (Dynamic route fetching project by ID or showing 404 state)

---

### Phase 5: High-Impact Expansions (02:15 PM – 03:00 PM)

#### 5.1 Team & Workload Feature (`src/features/team/` & `src/app/team/`)
- [ ] `src/features/team/components/MemberCard.tsx`:
  - Avatar, full name, role, and department badge
  - Active managed projects count
  - Visual workload meter (e.g., *"3 Active Tasks — 75% Capacity"*)
  - Workload status badge (*Available*, *Optimal*, *Busy*)
  - Deep-link button: *"View Tasks"* (links to `/tasks?assignee=[id]`)
- [ ] `src/features/team/components/TeamToolbar.tsx`: Search member by name/role, filter by department (*Engineering*, *Design*, *Product*)
- [ ] `src/features/team/components/TeamGrid.tsx`: Responsive grid of team member cards
- [ ] Create App Route `src/app/team/page.tsx` (Mounts `TeamContainer`)

#### 5.2 Settings & Workspace Management (`src/app/settings/page.tsx`)
- [ ] **Appearance Settings:** Live Dark / Light / System theme selector
- [ ] **Workspace Settings:** Workspace name (*"NexaFlow HQ"*), time zone, and default project color
- [ ] **Evaluator Controls (High Impact):**
  - **"Reset to Demo Data"** button (restores default seed state in `localStorage`)
  - **"Seed Bulk Data"** button (adds 20+ projects to test search/filter performance)
  - **"Export Workspace (JSON)"** button (downloads state as `.json` file)

#### 5.3 Roadmap & Timeline Feature (`src/features/roadmap/` & `src/app/roadmap/`)
- [ ] `src/features/roadmap/components/TimelineHeader.tsx`: Month/Quarter calendar axis
- [ ] `src/features/roadmap/components/TimelineGanttBar.tsx`:
  - Horizontal bar spanning from `createdAt` to `deadline`
  - Project color identity styling
  - Inner progress fill representing completion %
  - Tooltip on hover showing manager, deadline, and task completion
  - Click bar to navigate to `/projects/[id]`
- [ ] `src/features/roadmap/components/RoadmapContainer.tsx`: Timeline grid view with status filter
- [ ] Create App Route `src/app/roadmap/page.tsx` (Mounts `RoadmapContainer`)

#### 5.4 Analytics Feature (`src/features/analytics/` & `src/app/analytics/`)
- [ ] `src/features/analytics/components/ProjectStatusChart.tsx`: SVG / CSS donut chart of project statuses
- [ ] `src/features/analytics/components/TaskPriorityChart.tsx`: Bar chart showing task volume by priority
- [ ] `src/features/analytics/components/WorkloadDistributionChart.tsx`: Team workload comparison
- [ ] Create App Route `src/app/analytics/page.tsx` (Mounts `AnalyticsContainer`)

---

### Phase 6: Interactions, Dark Mode, Kanban D&D & Bonus Polish (03:00 PM – 03:30 PM)

#### 6.1 Dark Mode
- [ ] Theme provider toggles `'dark'` class on `<html>`
- [ ] Tailwind dark variants (`dark:bg-slate-900`, `dark:text-white`, `dark:border-slate-800`) applied across all components
- [ ] Theme state persisted in `localStorage`

#### 6.2 Command Palette (`src/components/CommandPalette.tsx`)
- [ ] Keyboard shortcut listener: `Ctrl + K` or `Cmd + K`
- [ ] Fast search & navigation to any page (`/`, `/projects`, `/tasks`, `/team`, `/roadmap`, `/analytics`, `/settings`)
- [ ] Quick actions: *"Create Project"*, *"Toggle Theme"*, *"Reset Demo Data"*
- [ ] Accessible backdrop and keyboard selection (`ArrowUp`, `ArrowDown`, `Enter`, `ESC`)

#### 6.3 CSV Project Export (`src/utils/exportCsv.ts`)
- [ ] Generates clean CSV string from `projects` array
- [ ] Downloads timestamped file: `nexaflow_projects_[date].csv`

#### 6.4 Notification Center Slide-Over (`src/features/notifications/components/NotificationDrawer.tsx`)
- [ ] Header bell trigger with animated badge
- [ ] Chronological event stream populated by `activityLog`
- [ ] Filter by *All*, *Projects*, or *Tasks*
- [ ] "Mark All as Read" / "Clear History" actions

---

### Phase 7: Responsive Polish, Accessibility & Bug Fixes (03:30 PM – 03:45 PM)

- [ ] Mobile navigation drawer tested on 375px viewport (collapses gracefully, no horizontal scroll)
- [ ] Keyboard tab order and focus rings verified across all interactive elements
- [ ] ARIA attributes on modals (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
- [ ] Form input labels linked with `htmlFor` and `id`
- [ ] Empty state checks: Verify zero-result fallback for search, filters, and empty lists
- [ ] State consistency verification:
  1. Creating a project updates: Projects page, Home stats, Roadmap, and Activity log
  2. Completing a task updates: Task list, Kanban, Project progress %, and Member workload meter
  3. Resetting demo data updates all pages synchronously

---

### Phase 8: Deliverables & Presentation Preparation (03:45 PM – 04:00 PM)

- [ ] Complete `README.md`:
  - Project architecture & feature-sliced philosophy
  - Setup instructions (`npm install`, `npm run dev`)
  - Feature matrix (Mandatory + Standout Bonus items)
  - 3–5 minute presentation talking points covering UI/UX decisions
- [ ] Production build check: `npm run build` passes with zero errors
- [ ] Console verification: Zero React hydration mismatches or runtime warnings

---

## 5. Complete Target Directory Map

```text
nexaflow/
├── doc/
│   ├── TODO.md                                     # Master implementation checklist
│   └── TODO.pdf                                    # Formatted printable PDF
├── public/
│   └── (brand assets & favicons)
├── src/
│   ├── app/                                        # Next.js 16 App Router (Lean Orchestrators)
│   │   ├── layout.tsx                              # Root layout with Fonts & AppProviders
│   │   ├── page.tsx                                # 1. Main Dashboard Overview
│   │   ├── globals.css                             # Tailwind v4 theme & custom utilities
│   │   ├── projects/
│   │   │   ├── page.tsx                            # 2. Projects Hub
│   │   │   └── [id]/
│   │   │       └── page.tsx                        # 3. Dynamic Project Workspace
│   │   ├── tasks/
│   │   │   └── page.tsx                            # 4. Tasks & Kanban Board
│   │   ├── team/
│   │   │   └── page.tsx                            # 5. Team Directory & Workload
│   │   ├── roadmap/
│   │   │   └── page.tsx                            # 6. Project Timeline & Gantt
│   │   ├── analytics/
│   │   │   └── page.tsx                            # 7. Progress & Performance Visuals
│   │   └── settings/
│   │       └── page.tsx                            # 8. Settings & Demo Data Controls
│   ├── assets/                                     # Static icons & brand assets
│   ├── components/
│   │   ├── CommandPalette.tsx                      # Cmd+K quick navigation palette
│   │   └── ui/                                     # Dumb, reusable atomic UI primitives
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Select.tsx
│   │       ├── Tabs.tsx
│   │       └── Toast.tsx
│   ├── context/
│   │   ├── ProjectContext.tsx                      # Unified reactive store (Projects, Tasks, Team, Activity)
│   │   └── ThemeContext.tsx                        # Dark / Light mode provider
│   ├── features/                                   # Domain feature slices
│   │   ├── home/
│   │   │   ├── components/                         # StatCards, RecentProjects, UpcomingTasks, WelcomeBanner
│   │   │   ├── hooks/                              # useDashboardStats
│   │   │   └── types/                              # dashboard.types.ts
│   │   ├── projects/
│   │   │   ├── components/                         # ProjectCard, ProjectTable, ProjectWorkspace, CreateModal
│   │   │   ├── hooks/                              # useProjectFilters, useProjectOperations
│   │   │   ├── types/                              # project.types.ts
│   │   │   └── utils/                              # projectSort.ts
│   │   ├── tasks/
│   │   │   ├── components/                         # TaskItem, TaskList, TaskKanbanBoard, TaskToolbar
│   │   │   ├── hooks/                              # useTaskFilters, useTaskOperations
│   │   │   └── types/                              # task.types.ts
│   │   ├── team/
│   │   │   ├── components/                         # MemberCard, TeamGrid, TeamToolbar
│   │   │   └── types/                              # team.types.ts
│   │   ├── roadmap/
│   │   │   ├── components/                         # TimelineHeader, TimelineGanttBar, RoadmapContainer
│   │   │   └── utils/                              # timelineMath.ts
│   │   ├── analytics/
│   │   │   └── components/                         # StatusChart, PriorityChart, WorkloadChart
│   │   └── notifications/
│   │       ├── components/                         # NotificationDrawer, ActivityItemView
│   │       └── types/                              # activity.types.ts
│   ├── layouts/                                    # Application Chrome
│   │   ├── DashboardShell.tsx
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── Sidebar.tsx
│   ├── lib/                                        # Infrastructure & seed helpers
│   │   ├── constants.ts
│   │   ├── seedData.ts                             # Realistic mock seed dataset
│   │   └── storage.ts                              # Browser localStorage abstraction
│   ├── providers/
│   │   └── AppProviders.tsx                        # Root compound provider
│   └── utils/                                      # Shared generic utilities
│       ├── cn.ts
│       ├── date.ts
│       └── exportCsv.ts
├── package.json
└── tsconfig.json
```
