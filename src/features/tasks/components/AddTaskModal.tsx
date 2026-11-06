'use client';

import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX } from 'react-icons/lu';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { MiniCalendarPicker, getTodayDateString } from '@/components/ui/DatePicker';
import { AssigneeSelector } from './AssigneeSelector';
import { PrioritySelector } from './PrioritySelector';
import { TaskPriority, TaskStatus } from '@/features/tasks/types/task.types';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [selectedUsers, setSelectedUsers] = useState<AuthUser[]>([]);

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
      },
      {
        onSuccess: () => {
          // Reset form state & close
          setTitle('');
          setDescription('');
          setStartDate('');
          setDueDate('');
          setSelectedUsers([]);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-elms"
        >
          {/* Backdrop - smooth dark overlay without compositor buffer flash */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal Window Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-primary-medium/15 z-10 my-auto overflow-visible"
          >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-4 border-b border-primary-medium/10">
            <h2 className="text-xl font-bold text-primary-dark tracking-tight">
              Add New Task
            </h2>

            {/* Circular Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-primary-medium/20 text-primary-dark hover:bg-primary-surface flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs"
              aria-label="Close modal"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* 1. Task Title */}
            <div>
              <label
                htmlFor="task-title-input"
                className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block"
              >
                Task Title
              </label>
              <div className="relative flex items-center bg-[#f7f6f2] hover:bg-[#f3f1ec] focus-within:bg-white border border-primary-medium/15 focus-within:border-primary-dark/40 focus-within:ring-2 focus-within:ring-primary-dark/15 rounded-xl px-4 py-2.5 transition-all">
                <input
                  id="task-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Schedule stakeholder demo for next sprint"
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
                Description
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Coordinate with stakeholders to find a time for the sprint demo presentation."
                showBlockArrow={false}
                showAlignment={false}
                showQuote={false}
              />
            </div>

            {/* 3. Date Selection Row: Split into Start Date & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  Start Date
                </label>
                <MiniCalendarPicker
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder="Select start date"
                />
              </div>

              {/* Due Date Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  Due Date
                </label>
                <MiniCalendarPicker
                  value={dueDate}
                  onChange={handleDueDateChange}
                  onTriggerClick={handleDueDateClick}
                  minDate={minDueDate}
                  placeholder="Select due date"
                />
              </div>
            </div>

            {/* 4. Bottom Row: Assign to & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assign to Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  Assign to
                </label>
                <AssigneeSelector
                  selectedUsers={selectedUsers}
                  onSelectUsers={setSelectedUsers}
                />
              </div>

              {/* Priority Column */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-primary-dark mb-1.5 block">
                  Priority
                </label>
                <PrioritySelector
                  value={priority}
                  onChange={setPriority}
                />
              </div>
            </div>

            {/* 5. Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full py-3 rounded-md text-sm font-semibold transition-all duration-200 select-none ${
                  isSubmitDisabled
                    ? 'bg-[#8f857d] text-white/90 cursor-not-allowed shadow-none'
                    : 'bg-primary-dark text-white hover:bg-primary active:scale-98 shadow-xs cursor-pointer'
                }`}
              >
                {addTaskMutation.isPending ? 'Creating Task...' : 'Add Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
