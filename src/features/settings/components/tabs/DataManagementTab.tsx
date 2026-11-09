'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  LuDownload,
  LuSparkles,
  LuRotateCcw,
} from 'react-icons/lu';
import { storageApi } from '@/lib/storage';
import { useProjectsQuery, useTasksQuery, useTeamsQuery } from '@/hooks/useDashboardData';

export function DataManagementTab() {
  const { data: projects = [], refetch: refetchProjects } = useProjectsQuery();
  const { data: tasks = [], refetch: refetchTasks } = useTasksQuery();
  const { data: teams = [], refetch: refetchTeams } = useTeamsQuery();

  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // 1. Export JSON Backup
  const handleExportJson = () => {
    try {
      const jsonString = storageApi.exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `nexaflow_workspace_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Workspace exported successfully');
    } catch (err) {
      toast.error('Failed to export workspace data');
      console.error(err);
    }
  };

  // 2. Seed Bulk Data (Stress test / presentation)
  const handleSeedBulk = async () => {
    try {
      const sampleTitles = [
        'AI Query Copilot Integration',
        'Multi-Cloud Terraform Pipeline',
        'Mobile App Onboarding Redesign',
        'Real-time WebSocket Notification Broker',
        'SOC2 Type II Compliance Audit Preparation',
        'Design System Tokens Modernization',
        'Customer Analytics Warehouse ETL',
        'GraphQL Gateway Federation',
      ];

      for (let i = 0; i < sampleTitles.length; i++) {
        await storageApi.addProject({
          name: sampleTitles[i],
          description: `Strategic initiative #${i + 1} to expand NexaFlow capabilities. Automated demo generation.`,
          status: i % 3 === 0 ? 'In Progress' : i % 3 === 1 ? 'Pending' : 'Completed',
          progress: Math.floor(Math.random() * 85) + 10,
          deadline: new Date(Date.now() + (i + 5) * 86400000).toISOString().split('T')[0],
          color: ['#403022', '#2563eb', '#16a34a', '#d97706', '#9333ea'][i % 5],
          priority: ['Urgent', 'High', 'Medium', 'Low'][i % 4] as any,
          taskCount: Math.floor(Math.random() * 8) + 2,
          tags: ['Platform', 'Core', 'V2', 'Demo'],
          manager: {
            id: 'usr_roger_01',
            name: 'Tankeu Daniel',
            email: 'oraclexp@gmail.com',
            avatar: '/Avatar.jpg',
            role: 'Ops Manager',
            department: 'Operations',
          },
        });
      }

      await Promise.all([refetchProjects(), refetchTasks(), refetchTeams()]);
      toast.success(`Seeded ${sampleTitles.length} bulk demo projects!`);
    } catch (err) {
      toast.error('Failed to seed bulk data');
      console.error(err);
    }
  };

  // 3. Reset Demo Data
  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await storageApi.resetDemoData();
      await Promise.all([refetchProjects(), refetchTasks(), refetchTeams()]);
      setShowConfirmReset(false);
      toast.success('Workspace reset to clean initial baseline');
    } catch (err) {
      toast.error('Failed to reset workspace');
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Data Management & Evaluator Tools
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          Export your workspace records, seed realistic high-volume test data, or restore clean state.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Storage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-primary-medium/20 shadow-2xs">
          <p className="text-[11px] font-bold text-primary-dark/70 uppercase tracking-wider">
            Total Projects
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-1">
            {projects.length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-primary-medium/20 shadow-2xs">
          <p className="text-[11px] font-bold text-primary-dark/70 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-1">
            {tasks.length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-primary-medium/20 shadow-2xs">
          <p className="text-[11px] font-bold text-primary-dark/70 uppercase tracking-wider">
            Configured Teams
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-1">
            {teams.length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-primary-medium/20 shadow-2xs">
          <p className="text-[11px] font-bold text-primary-dark/70 uppercase tracking-wider">
            Storage Engine
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-1">
            LocalStore
          </p>
        </div>
      </div>

      {/* Evaluator Control Cards */}
      <div className="space-y-4 pt-2">
        {/* Card 1: Export JSON */}
        <div className="p-4 sm:p-5 rounded-2xl border border-primary-medium/20 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-surface/60 flex items-center justify-center text-primary-dark shrink-0 mt-0.5 border border-primary-medium/20">
              <LuDownload className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-dark">
                Export Workspace (JSON Backup)
              </h3>
              <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
                Download a clean, timestamped snapshot containing all active projects, tasks, and teams.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-dark text-white text-xs font-bold hover:bg-primary shadow-xs transition-all cursor-pointer shrink-0"
          >
            <LuDownload className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>

        {/* Card 2: Seed Bulk Data */}
        <div className="p-4 sm:p-5 rounded-2xl border border-primary-medium/20 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 border border-amber-200">
              <LuSparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-dark">
                Seed Bulk Demo Projects (Stress Test)
              </h3>
              <p className="text-xs text-primary-dark/80 font-medium mt-0.5">
                Generate 8+ realistic projects with varied priorities and progress meters to evaluate performance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeedBulk}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-primary-medium/30 bg-white hover:bg-primary-surface/30 text-primary-dark text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <LuSparkles className="w-3.5 h-3.5 text-amber-700" />
            Seed Bulk Data
          </button>
        </div>

        {/* Card 3: Reset Demo Data */}
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-300 bg-rose-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5 border border-rose-300">
              <LuRotateCcw className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Reset Workspace to Baseline
              </h3>
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                Clears added records and restores the pristine initial seed state.
              </p>
            </div>
          </div>

          {showConfirmReset ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-700 hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetData}
                className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Now'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
