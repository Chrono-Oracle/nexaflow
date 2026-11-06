'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuPlus, LuTrash2 } from 'react-icons/lu';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { MiniCalendarPicker, getTodayDateString } from '@/components/ui/DatePicker';
import { AssigneeSelector } from './AssigneeSelector';
import { PrioritySelector } from './PrioritySelector';
import { TaskPriority, TaskStatus, TaskAttachment } from '@/features/tasks/types/task.types';
import { FileUploadModal, FileIconBadge } from '@/components/ui/FileUpload';
import { useAddTaskMutation, useProjectsQuery } from '@/hooks/useDashboardData';
import { AuthUser } from '@/data/users';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export function AddTaskModal({
  isOpen,
  onClose,
  defaultStatus = 'To Do',
}: AddTaskModalProps) {
  const t = useTranslations('tasksPage');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [selectedUsers, setSelectedUsers] = useState<AuthUser[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: projects = [] } = useProjectsQuery();
  const addTaskMutation = useAddTaskMutation();

  const todayKey = useMemo(() => getTodayDateString(), []);

  // Minimum selectable date for Due Date: cannot be in the past (before today)
  // and cannot precede startDate if a future start date was selected
  const minDueDate = useMemo(() => {
    return startDate && startDate > todayKey ? startDate : todayKey;
  }, [startDate, todayKey]);

  // Logic 1: If user clicks on due date without choosing start date,
  // automatically set start date to current live date
  const handleDueDateClick = () => {
    if (!startDate) {
      setStartDate(todayKey);
    }
  };

  const handleDueDateChange = (selectedDate: string) => {
    // Logic 2: User cannot choose a date that has passed the actual current live date
    if (selectedDate < todayKey) return;

    if (!startDate) {
      setStartDate(todayKey);
    }
    setDueDate(selectedDate);
  };

  const handleStartDateChange = (selectedDate: string) => {
    setStartDate(selectedDate);
    // If due date was already selected and is earlier than new start date, sync due date
    if (dueDate && dueDate < selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Form validation: All required fields and options must be filled/selected
  const hasValidTitle = Boolean(title.trim());
  const hasValidDescription = Boolean(
    description && description.replace(/<[^>]*>/g, '').trim().length > 0
  );
  const hasValidStartDate = Boolean(startDate);
  const hasValidDueDate = Boolean(dueDate);
  const hasValidAssignee = selectedUsers.length > 0;
  const hasValidPriority = Boolean(priority);

  const isFormValid =
    hasValidTitle &&
    hasValidDescription &&
    hasValidStartDate &&
    hasValidDueDate &&
    hasValidAssignee &&
    hasValidPriority;

  const isSubmitDisabled = !isFormValid || addTaskMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const projectId =
      projects.length > 0 ? projects[0].id : 'proj-general';

    const finalStartDate = startDate || todayKey;
    const finalDeadline = dueDate || finalStartDate;

    addTaskMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: defaultStatus,
        startDate: finalStartDate,
        deadline: finalDeadline,
        projectId,
        assigneeId: selectedUsers[0]?.id,
        assigneeIds: selectedUsers.map((u) => u.id),
        attachments,
      },
      {
        onSuccess: () => {
          toast.success(t('modal.taskCreatedSuccess'));
          // Reset form state & close
          setTitle('');
          setDescription('');
          setStartDate('');
          setDueDate('');
          setSelectedUsers([]);
          setAttachments([]);
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-task-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-6 overflow-hidden font-elms"
        >
          {/* Backdrop - smooth dark overlay without compositor buffer flash */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal Window Container: Fixed height on mobile, flex-col, overflow-hidden */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-primary-medium/15 z-10 my-auto flex flex-col h-[76dvh] sm:h-auto sm:max-h-[88vh] overflow-hidden"
          >
            {/* Pinned Header Row: Non-scrollable */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3.5 border-b border-primary-medium/10 bg-white shrink-0 z-10">
              <h2 className="text-xl font-bold text-primary-dark tracking-tight">
                {t('modal.addNewTask')}
              </h2>

              {/* Circular Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
                aria-label={t('modal.close')}
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Middle Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-4 space-y-4 pb-12">
                {/* 1. Task Title */}
                <div>
                  <label
                    htmlFor="task-title-input"
                    className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block"
                  >
                    {t('modal.taskTitle')}
                  </label>
                  <div className="relative flex items-center bg-[#f7f6f2] hover:bg-[#f3f1ec] focus-within:bg-white border border-primary-medium/15 focus-within:border-primary-dark/40 focus-within:ring-2 focus-within:ring-primary-dark/15 rounded-xl px-4 py-2.5 transition-all">
                    <input
                      id="task-title-input"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('modal.titlePlaceholder')}
                      required
                      className="w-full bg-transparent text-sm font-medium text-primary-dark placeholder:text-primary-medium/50 focus:outline-none"
                    />
                    {title && (
                      <button
                        type="button"
                        onClick={() => setTitle('')}
                        className="p-1 rounded-full text-primary-medium/60 hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

            {/* 2. Description with Rich Text Editor */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                {t('modal.description')}
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder={t('modal.descriptionPlaceholder')}
                showBlockArrow={false}
                showAlignment={false}
                showQuote={false}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            </div>

            {/* 2.5 Attachments Field (Only shows when there's at least 1 attachment) */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-primary-dark block">
                    {t('modal.attachments', { count: attachments.length })}
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAttachments([])}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                      <span>{t('modal.clearAll')}</span>
                    </button>
                    <span className="text-primary-medium/30">•</span>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <LuPlus className="w-3.5 h-3.5" />
                      <span>{t('modal.addMore')}</span>
                    </button>
                  </div>
                </div>

                {/* Display attachment cards: 2 columns, max 2 rows, scrollable if > 4 */}
                <div className="max-h-[124px] overflow-y-auto custom-scrollbar pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2.5 bg-[#f7f6f2] hover:bg-[#f3f1ec] border border-primary-medium/15 rounded-xl px-2.5 py-2 shadow-2xs text-xs font-medium text-primary-dark transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileIconBadge name={att.name} type={att.type} size="sm" />
                          <div className="min-w-0 flex-1">
                            <span
                              className="font-bold text-primary-dark block truncate"
                              title={att.name}
                            >
                              {att.name}
                            </span>
                            <span className="text-[10px] text-primary-medium/70 block">
                              {att.formattedSize}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                          }
                          className="p-1 rounded-lg text-primary-medium/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          title={t('modal.removeAttachment', { name: att.name })}
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Date Selection Row: Split into Start Date & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  {t('modal.startDate')}
                </label>
                <MiniCalendarPicker
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder={t('modal.selectStartDate')}
                />
              </div>

              {/* Due Date Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  {t('modal.dueDate')}
                </label>
                <MiniCalendarPicker
                  value={dueDate}
                  onChange={handleDueDateChange}
                  onTriggerClick={handleDueDateClick}
                  minDate={minDueDate}
                  placeholder={t('modal.selectDueDate')}
                />
              </div>
            </div>

            {/* 4. Bottom Row: Assign to & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assign to Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  {t('modal.assignTo')}
                </label>
                <AssigneeSelector
                  selectedUsers={selectedUsers}
                  onSelectUsers={setSelectedUsers}
                />
              </div>

              {/* Priority Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  {t('modal.priority')}
                </label>
                <PrioritySelector
                  value={priority}
                  onChange={setPriority}
                />
              </div>
            </div>
          </div>

          {/* Pinned Footer (Bottom): Non-scrollable */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-primary-medium/10 bg-white shrink-0 z-10">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-3 rounded-md text-sm font-semibold transition-all duration-200 select-none ${
                  isSubmitDisabled
                    ? 'bg-[#8f857d] text-white/90 cursor-not-allowed shadow-none'
                    : 'bg-primary-dark text-white hover:bg-primary active:scale-98 shadow-xs cursor-pointer'
                }`}
              >
                {addTaskMutation.isPending ? t('modal.creatingTask') : t('modal.addTask')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}

      {/* File Upload Modal with slide bouncy effect */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAttachFiles={(newAttachments) => {
          setAttachments(newAttachments);
        }}
        initialAttachments={attachments}
      />
    </AnimatePresence>
  );
}
