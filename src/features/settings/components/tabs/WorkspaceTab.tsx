'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LuCheck } from 'react-icons/lu';
import { WorkspaceSettings } from '../../types/settings.types';
import { settingsStorage, DEFAULT_WORKSPACE } from '../../utils/settingsStorage';

export function WorkspaceTab() {
  const [workspace, setWorkspace] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setWorkspace(settingsStorage.getWorkspace());
  }, []);

  const handleChange = (field: keyof WorkspaceSettings, value: string) => {
    setWorkspace((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settingsStorage.saveWorkspace(workspace);
    setIsSaved(true);
    toast.success('Workspace settings updated');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Workspace Settings
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          Manage organization metadata, default project priorities, sprint intervals, and view modes.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Organization / Workspace Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={workspace.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Workspace URL Slug
          </label>
          <div className="flex items-center rounded-xl bg-white border border-primary-medium/30 overflow-hidden focus-within:ring-2 focus-within:ring-primary-dark/20 focus-within:border-primary-dark transition-all shadow-2xs">
            <span className="px-3 text-xs text-primary-dark/70 font-semibold bg-primary-surface/40 py-2.5 border-r border-primary-medium/20">
              nexaflow.io/
            </span>
            <input
              type="text"
              value={workspace.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm text-primary-dark font-medium bg-transparent focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Primary Timezone
          </label>
          <select
            value={workspace.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer shadow-2xs"
          >
            <option value="UTC+01:00 (Europe/Paris, West Africa Time)">
              UTC+01:00 (Europe/Paris, West Africa Time)
            </option>
            <option value="UTC+00:00 (London, GMT)">
              UTC+00:00 (London, GMT)
            </option>
            <option value="UTC-05:00 (New York, Eastern Time)">
              UTC-05:00 (New York, Eastern Time)
            </option>
            <option value="UTC-08:00 (San Francisco, Pacific Time)">
              UTC-08:00 (San Francisco, Pacific Time)
            </option>
            <option value="UTC+08:00 (Singapore, China Standard Time)">
              UTC+08:00 (Singapore, China Standard Time)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Default Project Priority
          </label>
          <select
            value={workspace.defaultPriority}
            onChange={(e) => handleChange('defaultPriority', e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer shadow-2xs"
          >
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Default Task View Mode
          </label>
          <select
            value={workspace.defaultView}
            onChange={(e) => handleChange('defaultView', e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer shadow-2xs"
          >
            <option value="kanban">Kanban Board (3 Columns)</option>
            <option value="table">Table View (Detailed rows)</option>
            <option value="list">Compact List View</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-dark mb-1.5">
            Work Schedule & Operating Days
          </label>
          <input
            type="text"
            value={workspace.schedule}
            onChange={(e) => handleChange('schedule', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-primary-medium/30 hover:border-primary-medium/50 text-xs sm:text-sm text-primary-dark font-medium placeholder:text-primary-dark/40 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-primary-medium/15 flex items-center justify-between">
        <div className="text-xs text-primary-dark/80 font-medium">
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <LuCheck className="w-4 h-4 stroke-[2.5]" />
              Settings saved successfully
            </span>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          Save workspace settings
        </button>
      </div>
    </form>
  );
}
