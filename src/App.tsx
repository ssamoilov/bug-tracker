import { useState, useCallback, useEffect } from 'react';
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
    isSyncing,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    syncWithCloud,
    isAuthenticated,
    getLastSync,
    refreshTasks,
  } = useTasks();

  // Проверка синхронизации при загрузке
  useEffect(() => {
    if (isAuthenticated()) {
      const lastSync = getLastSync();
      if (!lastSync || new Date().getTime() - new Date(lastSync).getTime() > 3600000) {
        syncWithCloud();
      }
    }
  }, []);

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
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    await updateTaskStatus(taskId, newStatus);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const handleAddTask = (status: Status) => {
    setSelectedStatusForCreate(status);
    setIsCreateModalOpen(true);
  };

  const handleSync = async () => {
    await syncWithCloud();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🐞</span>
            </div>
          </div>
          <p className="text-gray-300 font-medium">Загрузка задач...</p>
          <p className="text-gray-500 text-sm mt-2">Подготовка вашего рабочего пространства</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSearchClick={() => {
        toast('🔍 Поиск в разработке', { icon: '🚧' });
      }}
      onCreateClick={() => {
        setSelectedStatusForCreate('todo');
        setIsCreateModalOpen(true);
      }}
      onSyncClick={handleSync}
      isSyncing={isSyncing}
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
    </MainLayout>
  );
}

export default App;