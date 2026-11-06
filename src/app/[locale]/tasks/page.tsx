'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TasksHeader,
  TaskViewMode,
} from '@/features/tasks/components/TasksHeader';
import { TaskBoardView } from '@/features/tasks/components/TaskBoardView';
import { TaskTableView } from '@/features/tasks/components/TaskTableView';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { AddTaskModal } from '@/features/tasks/components/AddTaskModal';
import { TaskDetailView } from '@/features/tasks/components/TaskDetailView';
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: tasks = [] } = useTasksQuery();
  const { data: projects = [] } = useProjectsQuery();
  const updateStatusMutation = useUpdateTaskStatusMutation();

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const handleToggleTask = (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'Completed' ? 'To Do' : 'Completed';
    updateStatusMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const handleOpenAddTask = (status: TaskStatus = 'To Do') => {
    setModalDefaultStatus(status);
    setIsAddModalOpen(true);
  };

  // On smaller screens, Table View is not available. Automatically fallback to Board View.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768 && activeView === 'table') {
        setActiveView('board');
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeView]);

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
            onTaskClick={(task) => setSelectedTaskId(task.id)}
          />
        )}

        {activeView === 'table' && (
          <TaskTableView
            tasks={tasks}
            projects={projects}
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
          />
        )}

        {activeView === 'list' && (
          <TaskListView
            tasks={tasks}
            projects={projects}
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
            onAddTask={(status) => handleOpenAddTask(status || 'To Do')}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
          />
        )}
      </div>

      {/* Add New Task Modal matching reference UI */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus={modalDefaultStatus}
      />

      {/* Task Detail View matching reference UI */}
      <TaskDetailView
        task={selectedTask}
        projects={projects}
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
