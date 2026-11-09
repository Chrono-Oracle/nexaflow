'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LuChevronDown, LuCheck, LuTrash2 } from 'react-icons/lu';
import { TeamMember } from '../../types/team.types';

const AVAILABLE_ROLES = [
  'Lead',
  'Senior',
  'Member',
  'Designer',
  'Engineer',
  'Product Manager',
];

interface TeamMemberItemProps {
  member: TeamMember;
  isEditingRole: boolean;
  onToggleRoleEdit: () => void;
  onUpdateRole: (newRole: string) => void;
  onToggleStatus: () => void;
  onRemove: () => void;
}

export function TeamMemberItem({
  member,
  isEditingRole,
  onToggleRoleEdit,
  onUpdateRole,
  onToggleStatus,
  onRemove,
}: TeamMemberItemProps) {
  const t = useTranslations('teamPage.membersDropdown');

  return (
    <div className="group/item flex items-center justify-between gap-2.5 p-2 rounded-md bg-[#faf9f6] hover:bg-primary-surface/40 border border-primary-medium/10 transition-colors relative">
      {/* Avatar + Name + Role/Dept */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Image
          src={member.avatar || '/Avatar.jpg'}
          alt={member.name}
          width={32}
          height={32}
          unoptimized
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-primary-dark truncate">
            {member.name}
          </div>
          <div className="text-[10px] text-primary-medium/70 truncate flex items-center gap-1.5">
            {/* Role selector dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={onToggleRoleEdit}
                className="inline-flex items-center gap-0.5 hover:underline text-primary-dark/85 font-medium cursor-pointer"
                title={t('editRole')}
              >
                <span>{member.role || 'Member'}</span>
                <LuChevronDown className="w-2.5 h-2.5 text-primary-medium/60" />
              </button>

              {isEditingRole && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-primary-medium/20 py-1 z-50 font-elms">
                  {AVAILABLE_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateRole(r)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 text-[11px] text-left transition-colors cursor-pointer ${
                        member.role === r
                          ? 'bg-primary/10 text-primary-dark font-bold'
                          : 'hover:bg-primary-surface/40 text-primary-dark'
                      }`}
                    >
                      <span>{r}</span>
                      {member.role === r && (
                        <LuCheck className="w-3 h-3 text-primary-dark" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {member.department && (
              <>
                <span>•</span>
                <span>{member.department}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Clickable Status toggle */}
        <button
          type="button"
          onClick={onToggleStatus}
          className="cursor-pointer"
          title="Click to toggle status"
        >
          {member.status === 'Active' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('active')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              {t('onLeave')}
            </span>
          )}
        </button>

        {/* Remove member button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-primary-medium/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title={t('removeMember')}
          aria-label={`Remove ${member.name} from team`}
        >
          <LuTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
