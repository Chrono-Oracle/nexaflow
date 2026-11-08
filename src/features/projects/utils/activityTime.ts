import { ProjectActivity } from '../types/project.types';

/**
 * Extracts a valid Date from a ProjectActivity.
 * Handles ISO strings, timestamps embedded in act.id or project.id,
 * or falls back to project.createdAt or the current date.
 */
export function getValidActivityDate(
  act: ProjectActivity,
  projectCreatedAt?: string,
  projectId?: string
): Date {
  if (
    act.timestamp &&
    act.timestamp !== 'Just now' &&
    !isNaN(new Date(act.timestamp).getTime())
  ) {
    return new Date(act.timestamp);
  }

  // Check if timestamp is embedded in act.id (e.g. act_1731071234567 or act_proj_...)
  const actMatch = act.id?.match(/act_(\d{10,13})/);
  if (actMatch) {
    const ms = parseInt(actMatch[1], 10);
    if (!isNaN(ms) && ms > 1600000000000) {
      return new Date(ms);
    }
  }

  // Check if timestamp is embedded in projectId (e.g. proj_1731071234567_...)
  const projMatch = projectId?.match(/proj_(\d{10,13})/);
  if (projMatch) {
    const ms = parseInt(projMatch[1], 10);
    if (!isNaN(ms) && ms > 1600000000000) {
      return new Date(ms);
    }
  }

  // Fallback to project creation date
  if (projectCreatedAt && !isNaN(new Date(projectCreatedAt).getTime())) {
    return new Date(projectCreatedAt);
  }

  return new Date();
}

/**
 * Formats a Date into a human-friendly real-time relative string:
 * - < 10s: "Just now"
 * - 10s - 59s: "Xs ago"
 * - 1m - 59m: "1 min ago" / "X mins ago"
 * - 1h - 23h: "1 hr ago" / "X hrs ago"
 * - 1d: "Yesterday"
 * - 2d - 6d: "X days ago"
 * - >= 7d: "Nov 8, 2026"
 */
export function formatRealTimeRelative(
  date: Date | string,
  now: Date = new Date()
): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(targetDate.getTime())) {
    return 'Just now';
  }

  const diffMs = now.getTime() - targetDate.getTime();

  // If in the future or less than 10 seconds ago
  if (diffMs < 10000) {
    return 'Just now';
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin === 1 ? '1 min ago' : `${diffMin} mins ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hr ago' : `${diffHours} hrs ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // Older than a week
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(targetDate);
}
