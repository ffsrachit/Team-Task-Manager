import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  'Todo': 'bg-gray-200 text-gray-800',
  'In Progress': 'bg-yellow-200 text-yellow-800',
  'Done': 'bg-green-200 text-green-800',
};

export default function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/my');
        setTasks(res.data);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}`, { status });

      // ✅ functional update (avoids stale state bug)
      setTasks(prev =>
        prev.map(t => (t._id === id ? { ...t, status } : t))
      );
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const overdue = tasks.filter(
    t =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'Done'
  );

  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {user?.name || 'User'} 👋
      </h1>
      <p className="text-gray-500 mb-6">
        Role: {user?.role || 'N/A'}
      </p>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
          ⚠️ You have {overdue.length} overdue task(s)!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {['Todo', 'In Progress', 'Done'].map(s => (
          <div key={s} className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">{s}</p>
            <p className="text-3xl font-bold text-blue-600">
              {tasks.filter(t => t.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <h2 className="text-xl font-semibold mb-4">My Tasks</h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task._id}
              className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-500">
                  {task.project?.name || 'No Project'}
                </p>

                {task.dueDate && (
                  <p className="text-xs text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <select
                value={task.status}
                onChange={e => updateStatus(task._id, e.target.value)}
                className={`text-sm px-3 py-1 rounded-full font-medium outline-none ${statusColors[task.status]}`}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}