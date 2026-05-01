import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  'Todo': 'bg-gray-100',
  'In Progress': 'bg-yellow-100',
  'Done': 'bg-green-100',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: ''
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    if (user?.role === 'Admin') {
      api.get('/users')
        .then(res => setUsers(res.data))
        .catch(() => {});
    }
  }, [id, user]);

  const createTask = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await api.post('/tasks', { ...form, project: id });

      // ✅ instant update (no refetch)
      setTasks(prev => [...prev, res.data]);

      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        assignedTo: ''
      });

      setShowForm(false);
    } catch {
      alert('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);

      // ✅ instant removal
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch {
      alert('Failed to delete task');
    }
  };

  const grouped = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading project...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Tasks</h1>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form className="bg-white p-4 rounded-xl shadow mb-6 space-y-3" onSubmit={createTask}>
          
          <input
            placeholder="Task Title"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3">
            <select
              className="border p-2 rounded flex-1"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              className="border p-2 rounded flex-1"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />

            <select
              className="border p-2 rounded flex-1"
              value={form.assignedTo}
              onChange={e => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">Assign to...</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className={`px-4 py-2 rounded text-white ${
              creating ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      )}

      {/* Board */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(grouped).map(([status, taskList]) => (
          <div key={status} className={`rounded-xl p-4 ${statusColors[status]}`}>
            
            <h2 className="font-bold mb-3">
              {status} ({taskList.length})
            </h2>

            {taskList.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks</p>
            ) : (
              <div className="space-y-2">
                {taskList.map(task => (
                  <div key={task._id} className="bg-white rounded-lg p-3 shadow-sm">

                    <div className="flex justify-between">
                      <p className="font-semibold text-sm">{task.title}</p>

                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-400 text-xs hover:text-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {task.description || 'No description'}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>

                      <span className="text-xs text-gray-400">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>

                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}