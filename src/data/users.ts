import { User } from './userDashboard';
import { TeamMember } from '@/features/team/types/team.types';
import { ProjectManager } from '@/features/projects/types/project.types';

export interface AuthUser extends User {
  password?: string;
  department: string;
  title: string;
  phone?: string;
}

export const DUMMY_AUTH_USERS: AuthUser[] = [
  {
    id: 'usr_01',
    fullName: 'Tankeu Daniel',
    nickname: 'OracleX',
    email: 'oraclexp@gmail.com',
    password: 'Password@2026',
    avatar: '/Avatar.jpg',
    status: 'online',
    department: 'Operations',
    title: 'Operations Manager & Lead Architect',
    phone: '+237 670 000 001',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Ops Manager',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_02',
    fullName: 'Sarah Jenkins',
    nickname: 'sarahj',
    email: 'sarah.j@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    department: 'Engineering',
    title: 'Senior Frontend Engineer',
    phone: '+1 (555) 234-5678',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Senior Frontend Engineer',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_03',
    fullName: 'Roger Miller',
    nickname: 'rogerm',
    email: 'roger.m@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    department: 'Design',
    title: 'Staff Product Designer',
    phone: '+1 (555) 345-6789',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Staff Product Designer',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_04',
    fullName: 'Elena Rostova',
    nickname: 'elena_r',
    email: 'elena.r@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    status: 'away',
    department: 'Product',
    title: 'Technical Product Manager',
    phone: '+1 (555) 456-7890',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Technical Product Manager',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_05',
    fullName: 'Marcus Vance',
    nickname: 'marcusv',
    email: 'marcus.v@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    status: 'busy',
    department: 'Platform',
    title: 'Principal Systems Architect',
    phone: '+1 (555) 567-8901',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Principal Systems Architect',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_06',
    fullName: 'Chloe Bennett',
    nickname: 'chloeb',
    email: 'chloe.b@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    department: 'Quality Assurance',
    title: 'QA & Automation Lead',
    phone: '+1 (555) 678-9012',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'QA & Automation Lead',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_07',
    fullName: 'Aiden Nakamura',
    nickname: 'aidenn',
    email: 'aiden.n@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    department: 'Engineering',
    title: 'Full Stack Engineer',
    phone: '+1 (555) 789-0123',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Full Stack Engineer',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_08',
    fullName: 'Amara Diallo',
    nickname: 'amarad',
    email: 'amara.d@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    department: 'Infrastructure',
    title: 'DevOps & Cloud Engineer',
    phone: '+1 (555) 890-1234',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'DevOps & Cloud Engineer',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_09',
    fullName: 'Liam O’Connor',
    nickname: 'liamo',
    email: 'liam.o@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'away',
    department: 'Analytics',
    title: 'Growth & Business Intelligence Analyst',
    phone: '+1 (555) 901-2345',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'Growth & BI Analyst',
      plan: 'Enterprise',
    },
  },
  {
    id: 'usr_10',
    fullName: 'Zoe Chen',
    nickname: 'zoec',
    email: 'zoe.c@nexaflow.io',
    password: 'Password@2026',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    department: 'Design',
    title: 'UI/UX Interaction Designer',
    phone: '+1 (555) 012-3456',
    workspace: {
      id: 'ws_nexaflow',
      name: 'NexaFlow',
      role: 'UI/UX Interaction Designer',
      plan: 'Enterprise',
    },
  },
];

// Helper to fetch all auth users
export function getAuthUsers(): AuthUser[] {
  return DUMMY_AUTH_USERS;
}

// Helper to find user by ID or email
export function getAuthUserById(id: string): AuthUser | undefined {
  return DUMMY_AUTH_USERS.find((u) => u.id === id);
}

export function getAuthUserByEmail(email: string): AuthUser | undefined {
  return DUMMY_AUTH_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Helper to convert AuthUser to TeamMember
export function authUserToTeamMember(user: AuthUser, capacity = 80): TeamMember {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.title,
    department: user.department,
    avatar: user.avatar,
    capacity,
    activeTaskCount: 0,
    status: user.status === 'offline' ? 'On Leave' : 'Active',
  };
}

// Helper to convert AuthUser to ProjectManager
export function authUserToProjectManager(user: AuthUser): ProjectManager {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatar: user.avatar,
    role: user.title,
    department: user.department,
  };
}
