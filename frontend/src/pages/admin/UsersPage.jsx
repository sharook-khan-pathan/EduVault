import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Modal, ConfirmDialog, PageLoader, EmptyState } from '../../components/common/UI';
import { adminApi } from '../../api/services';
import { FiPlus, FiUsers, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function UsersPage({ role }) {
  role = role || 'FACULTY';
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '', phone: '', departmentId: '' });

  const load = () => Promise.all([
    role === 'FACULTY' ? adminApi.getFaculty() : adminApi.getStudents(),
    adminApi.getDepartments()
  ]).then(([u, d]) => {
    setUsers(u.data.data?.content || []);
    setDepartments(d.data.data || []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, [role]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminApi.createUser({ ...form, role, departmentId: form.departmentId || null });
      toast.success(`${role === 'FACULTY' ? 'Faculty' : 'Student'} account created`);
      setModalOpen(false);
      setForm({ username: '', password: '', email: '', fullName: '', phone: '', departmentId: '' });
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleUserStatus(id);
      toast.success('Status updated');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const title = role === 'FACULTY' ? 'Faculty' : 'Students';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} {title.toLowerCase()}</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <FiPlus size={16} /> Add {role === 'FACULTY' ? 'Faculty' : 'Student'}
          </button>
        </div>

        {users.length === 0 ? (
          <EmptyState icon={FiUsers} title={`No ${title.toLowerCase()} yet`} description={`Add ${title.toLowerCase()} accounts to get started`}
            action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add {title}</button>} />
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Name', 'Username', 'Email', 'Department', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-semibold">
                          {u.fullName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.username}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.department || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(u.id)} className="text-gray-400 hover:text-blue-600" title="Toggle status">
                          {u.active ? <FiToggleRight size={18} className="text-green-500" /> : <FiToggleLeft size={18} />}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="text-gray-400 hover:text-red-600">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${role === 'FACULTY' ? 'Faculty' : 'Student'}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Username *</label>
              <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.username || !form.password || !form.email} className="btn-primary">
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={saving} title="Delete User" message={`Delete "${deleteTarget?.fullName}"? This cannot be undone.`} />
    </DashboardLayout>
  );
}
