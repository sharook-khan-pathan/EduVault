import { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { Modal, PageLoader, EmptyState, PriorityBadge, ConfirmDialog } from '../components/common/UI';
import { announcementApi, adminApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'NORMAL', departmentId: '' });

  const canPost = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const load = () => {
    const fn = user?.departmentId
      ? announcementApi.getForDepartment(user.departmentId)
      : announcementApi.getAll();
    fn.then(r => setAnnouncements(r.data.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (canPost) adminApi.getDepartments().then(r => setDepartments(r.data.data || []));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await announcementApi.create({ ...form, departmentId: form.departmentId || null });
      toast.success('Announcement posted');
      setModalOpen(false);
      setForm({ title: '', content: '', priority: 'NORMAL', departmentId: '' });
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await announcementApi.delete(deleteTarget.id);
      toast.success('Announcement deleted');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{announcements.length} announcements</p>
          </div>
          {canPost && (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <FiPlus size={16} /> Post Announcement
            </button>
          )}
        </div>

        {announcements.length === 0 ? (
          <EmptyState icon={FiBell} title="No announcements" description="No announcements have been posted yet" />
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className={`card border-l-4 ${
                a.priority === 'URGENT' ? 'border-l-red-500' :
                a.priority === 'HIGH' ? 'border-l-orange-500' :
                a.priority === 'NORMAL' ? 'border-l-blue-500' : 'border-l-gray-300'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                      <PriorityBadge priority={a.priority} />
                      {a.departmentName && (
                        <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {a.departmentName}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>By {a.postedByName}</span>
                      <span>•</span>
                      <span>{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                  {canPost && (a.postedById === user?.id || user?.role === 'ADMIN') && (
                    <button onClick={() => setDeleteTarget(a)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex-shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Announcement Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post Announcement">
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Announcement title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Content *</label>
            <textarea className="input" rows={4} placeholder="Write your announcement..." value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department (optional)</label>
              <select className="input" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
                <option value="">All (Global)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.title || !form.content} className="btn-primary">
              {saving ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={saving} title="Delete Announcement" message={`Delete "${deleteTarget?.title}"?`} />
    </DashboardLayout>
  );
}
