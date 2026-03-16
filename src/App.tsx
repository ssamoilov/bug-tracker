import { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { Board } from './components/KanbanBoard/Board';
import { CreateTaskModal } from './components/Modals/CreateTaskModal';
import { TaskDetailModal } from './components/Modals/TaskDetailModal';
import { StatisticsDashboard } from './components/Statistics/Dashboard';
import { TaskList } from './components/TaskList/TaskList';
import { useTasks } from './hooks/useTasks';
import { useHotkeys } from './hooks/useHotkeys';
import { Task, Status } from './types';
import toast from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedStatusForCreate, setSelectedStatusForCreate] = useState<Status>('todo');
  
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks();

  // Hotkeys
  useHotkeys({
    'mod+n': () => {
      setSelectedStatusForCreate('todo');
      setIsCreateModalOpen(true);
    },
    'mod+1': () => setActiveTab('board'),
    'mod+2': () => setActiveTab('list'),
    'mod+3': () => setActiveTab('stats'),
  });

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await createTask(taskData as any);
    toast.success('Задача успешно создана');
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    await updateTaskStatus(taskId, newStatus);
    toast.success(`Статус задачи изменен`);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    toast.success('Задача обновлена');
  };

  const handleAddTask = (status: Status) => {
    setSelectedStatusForCreate(status);
    setIsCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSearchClick={() => {}}
      onCreateClick={() => {
        setSelectedStatusForCreate('todo');
        setIsCreateModalOpen(true);
      }}
    >
      {activeTab === 'board' && (
        <Board
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onTaskClick={setSelectedTask}
          onTaskEdit={setSelectedTask}
          onAddTask={handleAddTask}
        />
      )}

      {activeTab === 'list' && (
        <TaskList
          tasks={tasks}
          onTaskClick={setSelectedTask}
          onTaskEdit={setSelectedTask}
        />
      )}

      {activeTab === 'stats' && (
        <StatisticsDashboard tasks={tasks} />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        initialStatus={selectedStatusForCreate}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={deleteTask}
        />
      )}

      {/* Dev tools - можно закомментировать или удалить */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
          <button
            onClick={async () => {
              if (window.confirm('Очистить все задачи?')) {
                localStorage.removeItem('bugtracker-tasks');
                window.location.reload();
              }
            }}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg shadow-lg"
          >
            Очистить все задачи (для теста!!! не актуально на 16.03.26)
          </button>
        </div>
      )}
    </MainLayout>
  );
}

export default App;