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
  labelKey: string;
  dotColor: string;
  className: string;
  badgeClass: string;
} {
  switch (status) {
    case 'To Do':
      return {
        label: 'To Do',
        labelKey: 'status.todo',
        dotColor: 'bg-[#63584c]',
        className: 'bg-[#f0ece4] text-[#3e372f] border border-[#ded8cc]',
        badgeClass: 'bg-[#f0ece4] text-[#3e372f] border border-[#ded8cc]',
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        labelKey: 'status.inProgress',
        dotColor: 'bg-[#ea580c]',
        className: 'bg-[#feebe7] text-[#c2410c] border border-[#fecdd3]',
        badgeClass: 'bg-[#feebe7] text-[#c2410c] border border-[#fecdd3]',
      };
    case 'In Review':
      return {
        label: 'In Review',
        labelKey: 'status.inReview',
        dotColor: 'bg-[#9333ea]',
        className: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]',
        badgeClass: 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]',
      };
    case 'Approved':
      return {
        label: 'Approved',
        labelKey: 'status.approved',
        dotColor: 'bg-[#0d9488]',
        className: 'bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4]',
        badgeClass: 'bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4]',
      };
    case 'Completed':
    default:
      return {
        label: 'Completed',
        labelKey: 'status.completed',
        dotColor: 'bg-[#16a34a]',
        className: 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]',
        badgeClass: 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]',
      };
  }
}
