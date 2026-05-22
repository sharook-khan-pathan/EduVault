import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Modal, ConfirmDialog, PageLoader, EmptyState } from '../../components/common/UI';
import { adminApi } from '../../api/services';
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const load = () => adminApi.getDepartments()
    .then(r => setDepartments(r.data.data || []))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code || '', description: d.description || '' }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await adminApi.updateDepartment(editing.id, form);
      else await adminApi.createDepartment(form);
      toast.success(editing ? 'Department updated' : 'Department created');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminApi.deleteDepartment(deleteTarget.id);
      toast.success('Department deleted');
      setDeleteTarget(null);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{departments.length} departments</p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <FiPlus size={16} /> Add Department
          </button>
        </div>

        {departments.length === 0 ? (
          <EmptyState icon={FiGrid} title="No departments yet" description="Add your first department to get started"
            action={<button onClick={openCreate} className="btn-primary">Add Department</button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map(dept => (
              <div key={dept.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FiGrid className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                      {dept.code && <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{dept.code}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(dept)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                {dept.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{dept.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div>
            <label className="label">Department Name *</label>
            <input className="input" placeholder="e.g. Computer Science" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" placeholder="e.g. CS" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Brief description..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={saving} title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all related data.`} />
    </DashboardLayout>
  );
}
