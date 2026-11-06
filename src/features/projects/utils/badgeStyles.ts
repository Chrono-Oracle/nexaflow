import { ProjectStatus, ProjectPriority } from '../types/project.types';
import { TaskStatus } from '@/features/tasks/types/task.types';

export function getProjectStatusStyle(status: ProjectStatus): { labelKey: string; className: string } {
  switch (status) {
    case 'In Progress':
      return {
        labelKey: 'status.inProgress',
        className: 'bg-[#eef4ff] text-[#3b82f6] border border-[#dbeafe]',
      };
    case 'Completed':
      return {
        labelKey: 'status.completed',
        className: 'bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5]',
      };
    case 'At Risk':
      return {
        labelKey: 'status.atRisk',
        className: 'bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2]',
      };
    case 'In Review':
      return {
        labelKey: 'status.inReview',
        className: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
      };
    case 'Pending':
    default:
      return {
        labelKey: 'status.pending',
        className: 'bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]',
      };
  }
}

export function getProjectPriorityStyle(priority: ProjectPriority = 'Medium'): { labelKey: string; className: string } {
  switch (priority) {
    case 'Urgent':
      return {
        labelKey: 'priority.urgent',
        className: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
      };
    case 'High':
      return {
        labelKey: 'priority.high',
        className: 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]',
      };
    case 'Medium':
      return {
        labelKey: 'priority.medium',
        className: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
      };
    case 'Low':
    default:
      return {
        labelKey: 'priority.low',
        className: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
      };
  }
}

export function getPriorityButtonStyles(priority: ProjectPriority) {
  switch (priority) {
    case 'Urgent':
      return {
        active: 'bg-[#dc2626] text-white border border-[#dc2626] shadow-xs font-semibold scale-102',
        inactive: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] hover:bg-[#fee2e2]',
      };
    case 'High':
      return {
        active: 'bg-[#ea580c] text-white border border-[#ea580c] shadow-xs font-semibold scale-102',
        inactive: 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] hover:bg-[#ffedd5]',
      };
    case 'Medium':
      return {
        active: 'bg-[#d97706] text-white border border-[#d97706] shadow-xs font-semibold scale-102',
        inactive: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] hover:bg-[#fef3c7]',
      };
    case 'Low':
    default:
      return {
        active: 'bg-[#2563eb] text-white border border-[#2563eb] shadow-xs font-semibold scale-102',
        inactive: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] hover:bg-[#dbeafe]',
      };
  }
}

export function getTaskStatusStyle(status: TaskStatus = 'To Do'): {
  label: string;
  dotColor: string;
  className: string;
  badgeClass: string;
} {
  switch (status) {
    case 'To Do':
      return {
        label: 'To Do',
        dotColor: 'bg-amber-500',
        className: 'bg-amber-500/10 text-amber-700 border-amber-200/60',
        badgeClass: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        dotColor: 'bg-blue-500',
        className: 'bg-blue-500/10 text-blue-700 border-blue-200/60',
        badgeClass: 'bg-[#eef4ff] text-[#3b82f6] border border-[#dbeafe]',
      };
    case 'In Review':
      return {
        label: 'In Review',
        dotColor: 'bg-purple-500',
        className: 'bg-purple-500/10 text-purple-700 border-purple-200/60',
        badgeClass: 'bg-[#faf5ff] text-[#9333ea] border border-[#f3e8ff]',
      };
    case 'Approved':
      return {
        label: 'Approved',
        dotColor: 'bg-teal-500',
        className: 'bg-teal-500/10 text-teal-700 border-teal-200/60',
        badgeClass: 'bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]',
      };
    case 'Completed':
    default:
      return {
        label: 'Completed',
        dotColor: 'bg-emerald-500',
        className: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60',
        badgeClass: 'bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5]',
      };
  }
}
