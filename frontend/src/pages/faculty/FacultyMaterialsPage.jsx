import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { PageLoader, EmptyState, ConfirmDialog, Modal } from '../../components/common/UI';
import MaterialCard from '../../components/common/MaterialCard';
import { subjectApi, materialApi, adminApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { FiUpload, FiBook } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MATERIAL_TYPES = ['PDF', 'PPT', 'DOC', 'ASSIGNMENT', 'LAB_MANUAL', 'PREVIOUS_PAPER', 'OTHER'];

export default function FacultyMaterialsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', type: 'PDF', unitNumber: '' });

  useEffect(() => {
    const fetchSubjects = user?.role === 'ADMIN'
      ? subjectApi.getAll()
      : subjectApi.getMySubjects();
    fetchSubjects.then(r => {
      const subs = r.data.data || [];
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    materialApi.getBySubject(selectedSubject).then(r => setMaterials(r.data.data?.content || []));
  }, [selectedSubject]);

  const handleDelete = async () => {
    setSaving(true);
    try {
      await materialApi.delete(deleteTarget.id);
      toast.success('Material deleted');
      setDeleteTarget(null);
      setMaterials(m => m.filter(x => x.id !== deleteTarget.id));
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const updated = await materialApi.update(editTarget.id, {
        ...editForm, unitNumber: editForm.unitNumber ? parseInt(editForm.unitNumber) : null,
        subjectId: editTarget.subjectId
      });
      toast.success('Material updated');
      setEditTarget(null);
      setMaterials(m => m.map(x => x.id === editTarget.id ? updated.data.data : x));
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setEditForm({ title: m.title, description: m.description || '', type: m.type, unitNumber: m.unitNumber || '' });
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Materials</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your uploaded materials</p>
          </div>
          <Link to="/faculty/upload" className="btn-primary"><FiUpload size={16} /> Upload New</Link>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {subjects.map(s => (
              <button key={s.id} onClick={() => setSelectedSubject(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === s.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {materials.length === 0 ? (
          <EmptyState icon={FiBook} title="No materials yet"
            description="Upload your first material for this subject"
            action={<Link to="/faculty/upload" className="btn-primary">Upload Material</Link>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {materials.map(m => (
              <MaterialCard key={m.id} material={m} showActions
                onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Material">
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit Number</label>
              <input type="number" className="input" value={editForm.unitNumber}
                onChange={e => setEditForm(f => ({ ...f, unitNumber: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setEditTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleEdit} disabled={saving || !editForm.title} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={saving} title="Delete Material" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </DashboardLayout>
  );
}
