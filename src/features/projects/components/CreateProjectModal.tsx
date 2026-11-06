'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { LuX, LuCalendar, LuTag } from 'react-icons/lu';
import { useAddProjectMutation } from '@/hooks/useDashboardData';
import { currentUser } from '@/data/userDashboard';
import { ProjectStatus, ProjectPriority } from '../types/project.types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#26150b', // Dark Chocolate
  '#735840', // Warm Mocha
  '#2563eb', // Royal Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

const STATUS_OPTIONS: ProjectStatus[] = [
  'In Progress',
  'Pending',
  'In Review',
  'At Risk',
  'Completed',
];

const PRIORITY_OPTIONS: ProjectPriority[] = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const t = useTranslations('projectsPage.createProjectModal');
  const tOverview = useTranslations('projectOverview');

  const addProjectMutation = useAddProjectMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('In Progress');
    setPriority('Medium');
    setDeadline('2026-12-31');
    setColor(COLOR_OPTIONS[0]);
    setTagsInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addProjectMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        deadline,
        status,
        priority,
        progress: 0,
        color,
        taskCount: 0,
        tags: tags.length > 0 ? tags : ['General'],
        manager: {
          id: 'team-user-01',
          name: currentUser.fullName,
          email: currentUser.email,
          avatar: currentUser.avatar,
          role: currentUser.workspace.role,
          department: 'Operations',
        },
      });

      toast.success(t('success'));
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Subtle Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-primary-medium/20 p-6 sm:p-7 z-10 font-elms max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-primary-medium/10">
              <div>
                <h2 className="text-xl font-bold text-primary-dark tracking-tight">
                  {t('title')}
                </h2>
                <p className="text-xs text-primary-medium/70 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-primary-medium/60 hover:text-primary-dark hover:bg-primary-surface/40 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                  {t('description')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all resize-none"
                />
              </div>

              {/* 2-Column: Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                    {t('status')}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2.5 text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {tOverview(`status.${st === 'In Progress' ? 'inProgress' : st === 'At Risk' ? 'atRisk' : st === 'In Review' ? 'inReview' : st.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2.5 text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((pr) => (
                      <option key={pr} value={pr}>
                        {tOverview(`priority.${pr.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <LuCalendar className="w-3.5 h-3.5 text-primary-medium/70" />
                    <span>{t('deadline')}</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2 text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all cursor-pointer"
                />
              </div>

              {/* Theme Color Picker Swatches */}
              <div>
                <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                  {t('color')}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        color === c
                          ? 'border-primary-dark scale-110 shadow-2xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-primary-dark mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <LuTag className="w-3.5 h-3.5 text-primary-medium/70" />
                    <span>{t('tags')}</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t('tagsPlaceholder')}
                  className="w-full text-xs sm:text-sm bg-[#faf9f5] border border-primary-medium/25 rounded-md px-3.5 py-2.5 text-primary-dark placeholder:text-primary-medium/50 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-primary-medium/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-primary-medium/25 text-xs font-medium text-primary-dark hover:bg-primary-surface/40 transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-md bg-primary-dark hover:bg-primary text-white text-xs font-medium shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
