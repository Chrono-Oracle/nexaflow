'use client';

import { useState } from 'react';
import {
  TasksHeader,
  TaskViewMode,
} from '@/features/tasks/components/TasksHeader';
import { TaskBoardView } from '@/features/tasks/components/TaskBoardView';
import { TaskTableView } from '@/features/tasks/components/TaskTableView';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { AddTaskModal } from '@/features/tasks/components/AddTaskModal';
import {
  useTasksQuery,
  useProjectsQuery,
  useUpdateTaskStatusMutation,
} from '@/hooks/useDashboardData';
import { Task, TaskStatus } from '@/features/tasks/types/task.types';

export default function TasksPage() {
  const [activeView, setActiveView] = useState<TaskViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('To Do');

  const { data: tasks = [] } = useTasksQuery();
  const { data: projects = [] } = useProjectsQuery();
  const updateStatusMutation = useUpdateTaskStatusMutation();

  const handleToggleTask = (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'Completed' ? 'To Do' : 'Completed';
    updateStatusMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const handleOpenAddTask = (status: TaskStatus = 'To Do') => {
    setModalDefaultStatus(status);
    setIsAddModalOpen(true);
  };

  return (
    <div className="font-elms w-full space-y-6 pb-12">
      {/* Views & Actions Header Toolbar Card */}
      <TasksHeader
        activeView={activeView}
        onViewChange={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={() => handleOpenAddTask('To Do')}
      />

      {/* Main View Area: Board, Table, or List */}
      <div>
        {activeView === 'board' && (
          <TaskBoardView
            tasks={tasks}
            projects={projects}
            searchQuery={searchQuery}
            onAddTask={(status) => handleOpenAddTask(status || 'To Do')}
          />
        )}

        {activeView === 'table' && (
          <TaskTableView
            tasks={tasks}
            projects={projects}
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
          />
        )}

        {activeView === 'list' && (
          <TaskListView
            tasks={tasks}
            projects={projects}
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
            onAddTask={(status) => handleOpenAddTask(status || 'To Do')}
          />
        )}
      </div>

      {/* Add New Task Modal matching reference UI */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
}
