import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const res = await api.post('/projects', form);

      // ✅ instant UI update (no refetch)
      setProjects(prev => [...prev, res.data]);

      setForm({ name: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading projects...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-4 text-sm">{error}</p>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={createProject}
          className="bg-white p-4 rounded-xl shadow mb-6 space-y-3"
        >
          <input
            placeholder="Project Name"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Description"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className={`px-4 py-2 rounded text-white transition
                ${creating ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link
              to={`/projects/${p._id}`}
              key={p._id}
              className="bg-white rounded-xl p-5 shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-blue-700">
                {p.name}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {p.description || 'No description'}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {p.members?.length || 0} members
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}