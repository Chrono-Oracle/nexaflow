import { Project } from '@/features/projects/types/project.types';
import { Task } from '@/features/tasks/types/task.types';
import { TeamMember } from '@/features/team/types/team.types';
import { ActivityItem } from '@/features/notifications/types/activity.types';
import { DashboardStats } from '@/features/home/types/dashboard.types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Tankeu Daniel',
    email: 'daniel.tankeu@nexaflow.io',
    role: 'Lead Architect & Ops Manager',
    department: 'Engineering',
    avatar: '/Avatar.jpg',
    capacity: 75,
    activeTaskCount: 5,
    status: 'Active',
  },
  {
    id: 'team-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nexaflow.io',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
    capacity: 90,
    activeTaskCount: 7,
    status: 'Active',
  },
  {
    id: 'team-3',
    name: 'Roger Miller',
    email: 'roger.m@nexaflow.io',
    role: 'Staff Product Designer',
    department: 'Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    capacity: 60,
    activeTaskCount: 3,
    status: 'Active',
  },
  {
    id: 'team-4',
    name: 'Elena Rostova',
    email: 'elena.r@nexaflow.io',
    role: 'Technical Product Manager',
    department: 'Product',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
    capacity: 80,
    activeTaskCount: 4,
    status: 'Active',
  },
  {
    id: 'team-5',
    name: 'Marcus Vance',
    email: 'marcus.v@nexaflow.io',
    role: 'Principal Systems Engineer',
    department: 'Platform',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    capacity: 45,
    activeTaskCount: 2,
    status: 'On Leave',
  },
  {
    id: 'team-6',
    name: 'Chloe Bennett',
    email: 'chloe.b@nexaflow.io',
    role: 'QA & Automation Specialist',
    department: 'Quality',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face',
    capacity: 70,
    activeTaskCount: 4,
    status: 'Active',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Complete brand repositioning, next-gen component library and conversion funnel overhaul.',
    manager: INITIAL_TEAM_MEMBERS[0],
    deadline: '2026-12-15',
    status: 'In Progress',
    progress: 68,
    color: '#735840', // Mocha
    createdAt: '2026-10-01',
    taskCount: 14,
    tags: ['Next.js', 'Tailwind', 'Branding'],
  },
  {
    id: 'proj-2',
    name: 'Mobile App V2',
    description: 'Cross-platform native companion app with offline caching and biometric authentication.',
    manager: INITIAL_TEAM_MEMBERS[1],
    deadline: '2027-01-20',
    status: 'In Progress',
    progress: 42,
    color: '#26150b', // Dark Chocolate
    createdAt: '2026-10-15',
    taskCount: 18,
    tags: ['Mobile', 'React Native', 'Security'],
  },
  {
    id: 'proj-3',
    name: 'CRM Platform Migration',
    description: 'Consolidation of legacy customer database into modern unified GraphQL microservices.',
    manager: INITIAL_TEAM_MEMBERS[3],
    deadline: '2027-02-28',
    status: 'Pending',
    progress: 15,
    color: '#a68d77', // Taupe
    createdAt: '2026-11-01',
    taskCount: 9,
    tags: ['Database', 'Migration', 'GraphQL'],
  },
  {
    id: 'proj-4',
    name: 'Q4 Marketing Campaign',
    description: 'Global promotional launch across social, partner channels and developer relations.',
    manager: INITIAL_TEAM_MEMBERS[2],
    deadline: '2026-11-30',
    status: 'Completed',
    progress: 100,
    color: '#403022', // Espresso
    createdAt: '2026-09-01',
    taskCount: 12,
    tags: ['Marketing', 'Campaign', 'Growth'],
  },
  {
    id: 'proj-5',
    name: 'Design System Tokens',
    description: 'Unification of design tokens across Figma, web components and native design systems.',
    manager: INITIAL_TEAM_MEMBERS[2],
    deadline: '2026-12-28',
    status: 'In Progress',
    progress: 85,
    color: '#735840', // Mocha
    createdAt: '2026-09-15',
    taskCount: 11,
    tags: ['Design', 'Tokens', 'Figma'],
  },
  {
    id: 'proj-6',
    name: 'Security Compliance Audit',
    description: 'Annual SOC2 Type II audit, penetration tests and automated dependency security review.',
    manager: INITIAL_TEAM_MEMBERS[4],
    deadline: '2026-10-31',
    status: 'Completed',
    progress: 100,
    color: '#26150b', // Dark Chocolate
    createdAt: '2026-08-01',
    taskCount: 16,
    tags: ['Security', 'SOC2', 'Compliance'],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design high-fidelity desktop & mobile wireframes',
    description: 'Finalize Figma design tokens and component specs for mobile navbar.',
    priority: 'High',
    status: 'Completed',
    deadline: '2026-11-04',
    projectId: 'proj-1',
    assigneeId: 'team-3',
    createdAt: '2026-10-18',
  },
  {
    id: 'task-2',
    title: 'Implement animated floating bottom dock',
    description: 'Build Framer Motion spring pop-up with active tab indicator.',
    priority: 'High',
    status: 'Completed',
    deadline: '2026-11-05',
    projectId: 'proj-1',
    assigneeId: 'team-1',
    createdAt: '2026-10-22',
  },
  {
    id: 'task-3',
    title: 'Setup TanStack Query v5 state cache engine',
    description: 'Configure optimistic updates, query client defaults and local storage seed.',
    priority: 'High',
    status: 'In Progress',
    deadline: '2026-11-06',
    projectId: 'proj-1',
    assigneeId: 'team-1',
    createdAt: '2026-11-01',
  },
  {
    id: 'task-4',
    title: 'Migrate user session cookies to httpOnly',
    description: 'Ensure cross-origin protection and SameSite cookie compliance.',
    priority: 'Medium',
    status: 'To Do',
    deadline: '2026-11-18',
    projectId: 'proj-2',
    assigneeId: 'team-2',
    createdAt: '2026-11-02',
  },
  {
    id: 'task-5',
    title: 'Build bilingual English & French translation layer',
    description: 'Implement next-intl routing, request proxy and translation dictionaries.',
    priority: 'High',
    status: 'Completed',
    deadline: '2026-11-05',
    projectId: 'proj-1',
    assigneeId: 'team-1',
    createdAt: '2026-11-02',
  },
  {
    id: 'task-6',
    title: 'Implement responsive Kanban drag & drop board',
    description: 'Build 3-column backlog with optimistic status transitions and priority tags.',
    priority: 'High',
    status: 'To Do',
    deadline: '2026-11-12',
    projectId: 'proj-2',
    assigneeId: 'team-2',
    createdAt: '2026-11-03',
  },
  {
    id: 'task-7',
    title: 'Integrate SVG vector charts & workload meters',
    description: 'Build interactive progress breakdown donuts and team allocation gauges.',
    priority: 'Medium',
    status: 'In Progress',
    deadline: '2026-11-20',
    projectId: 'proj-3',
    assigneeId: 'team-4',
    createdAt: '2026-11-04',
  },
  {
    id: 'task-8',
    title: 'Conduct automated a11y & Lighthouse audit',
    description: 'Ensure 100% keyboard accessibility, ARIA labels and WCAG AA contrast ratio.',
    priority: 'Low',
    status: 'To Do',
    deadline: '2026-11-25',
    projectId: 'proj-1',
    assigneeId: 'team-6',
    createdAt: '2026-11-04',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'project_created',
    title: 'New project created',
    description: 'Website Redesign was initialized by Tankeu Daniel.',
    timestamp: '2 hours ago',
    actorName: 'Tankeu Daniel',
    actorAvatar: '/Avatar.jpg',
  },
  {
    id: 'act-2',
    type: 'task_status_changed',
    title: 'Task completed',
    description: 'Sarah Jenkins marked "Implement animated floating bottom dock" as completed.',
    timestamp: '35 minutes ago',
    actorName: 'Sarah Jenkins',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 'act-3',
    type: 'member_assigned',
    title: 'Assignee updated',
    description: 'Elena Rostova assigned Roger Miller to "Design System Tokens".',
    timestamp: '15 minutes ago',
    actorName: 'Elena Rostova',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  },
];

export function calculateDashboardStats(
  projects: Project[],
  tasks: Task[],
  team: TeamMember[]
): DashboardStats {
  const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && new Date(t.deadline) < new Date('2026-11-05')
  ).length;

  const totalProgress = projects.reduce((acc, curr) => acc + curr.progress, 0);
  const overallProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

  return {
    activeProjects,
    completedTasks,
    overdueTasks,
    totalProjects: projects.length,
    overallProgress,
    totalTeamMembers: team.length,
  };
}
