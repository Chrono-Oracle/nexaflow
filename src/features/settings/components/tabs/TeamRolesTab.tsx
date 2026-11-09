'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { LuUsers, LuShield, LuKey, LuCheck } from 'react-icons/lu';
import { ToggleSwitch } from '../ToggleSwitch';

export function TeamRolesTab() {
  const [allowGuestInvites, setAllowGuestInvites] = useState(false);
  const [requireManagerSignoff, setRequireManagerSignoff] = useState(true);
  const [publicRoadmapLinks, setPublicRoadmapLinks] = useState(false);

  const roles = [
    {
      role: 'Owner',
      badge: 'Full Access',
      description: 'Account control, enterprise billing, audit logs, and organization workspace transfer.',
      membersCount: 1,
    },
    {
      role: 'Admin',
      badge: 'Management',
      description: 'Team provisioning, security policies, integration hooks, and project archiving.',
      membersCount: 3,
    },
    {
      role: 'Project Manager',
      badge: 'Operations',
      description: 'Create and lead projects, assign tasks, manage deadlines, and allocate member workloads.',
      membersCount: 4,
    },
    {
      role: 'Contributor',
      badge: 'Execution',
      description: 'Create tasks, update status columns, upload attachments, and comment on project specs.',
      membersCount: 12,
    },
    {
      role: 'Viewer',
      badge: 'Read-Only',
      description: 'View project roadmaps, KPI dashboards, and sprint progress without edit rights.',
      membersCount: 5,
    },
  ];

  const handleSave = () => {
    toast.success('Team permission policies updated');
  };

  return (
    <div className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Team & Role Permissions
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          View workspace role definitions and manage access policies for project members.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Plan & Capacity Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-primary-surface/40 border border-primary-medium/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary-dark shadow-xs border border-primary-medium/20 shrink-0">
            <LuUsers className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-dark">
              NexaFlow Enterprise Plan
            </h3>
            <p className="text-xs text-primary-dark/80 font-medium">
              25 Member Seats Included • 12 Active Members Provisioned
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.info('Seat management: Contact workspace admin')}
          className="px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-bold hover:bg-primary shadow-xs transition-all cursor-pointer shrink-0"
        >
          Manage Seats
        </button>
      </div>

      {/* Roles List */}
      <div>
        <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider mb-3">
          Role Hierarchy & Permissions
        </h3>
        <div className="divide-y divide-primary-medium/15 border border-primary-medium/20 rounded-2xl overflow-hidden bg-white/70">
          {roles.map((item) => (
            <div key={item.role} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-primary-dark">
                    {item.role}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-surface text-primary-dark border border-primary-medium/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-primary-dark/80 font-medium">
                  {item.description}
                </p>
              </div>

              <span className="text-xs font-bold text-primary-dark/80 shrink-0 self-start sm:self-center">
                {item.membersCount} {item.membersCount === 1 ? 'member' : 'members'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Policies Switches */}
      <div className="pt-4 border-t border-primary-medium/15 space-y-5">
        <h3 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
          Workspace Access Policies
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-primary-dark">
                Allow guest invitations
              </p>
              <p className="text-xs text-primary-dark/80 font-medium">
                Permit project managers to invite external contractor emails to specific boards.
              </p>
            </div>
            <ToggleSwitch
              id="guest-invites"
              label="Allow"
              checked={allowGuestInvites}
              onChange={setAllowGuestInvites}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-primary-medium/15">
            <div>
              <p className="text-sm font-bold text-primary-dark">
                Require manager review for Urgent tasks
              </p>
              <p className="text-xs text-primary-dark/80 font-medium">
                High-priority deliverables must be approved before moving to Completed status.
              </p>
            </div>
            <ToggleSwitch
              id="urgent-signoff"
              label="Enforce"
              checked={requireManagerSignoff}
              onChange={setRequireManagerSignoff}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-primary-medium/15">
            <div>
              <p className="text-sm font-bold text-primary-dark">
                Public read-only roadmap links
              </p>
              <p className="text-xs text-primary-dark/80 font-medium">
                Generate secure tokenized URLs to share high-level Gantt timelines with stakeholders.
              </p>
            </div>
            <ToggleSwitch
              id="public-roadmaps"
              label="Enable"
              checked={publicRoadmapLinks}
              onChange={setPublicRoadmapLinks}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-primary-medium/15 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          Save role policies
        </button>
      </div>
    </div>
  );
}
