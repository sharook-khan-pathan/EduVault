import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Modal, PageLoader, EmptyState } from '../../components/common/UI';
import { adminApi } from '../../api/services';
import { FiPlus, FiLayers } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', durationYears: 4, departmentId: '' });

  const load = () => Promise.all([adminApi.getCourses(), adminApi.getDepartments()])
    .then(([c, d]) => { setCourses(c.data.data || []); setDepartments(d.data.data || []); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminApi.createCourse({ ...form, durationYears: parseInt(form.durationYears), departmentId: parseInt(form.departmentId) });
      toast.success('Course created');
      setModalOpen(false);
      setForm({ name: '', code: '', durationYears: 4, departmentId: '' });
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{courses.length} courses</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary"><FiPlus size={16} /> Add Course</button>
        </div>

        {courses.length === 0 ? (
          <EmptyState icon={FiLayers} title="No courses yet" description="Add courses to organize subjects"
            action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add Course</button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(c => (
              <div key={c.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <FiLayers className="text-purple-600 dark:text-purple-400" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    {c.code && <span className="text-xs text-gray-500">{c.code}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>🏛️ {c.department?.name || 'N/A'}</span>
                  <span>⏱️ {c.durationYears} years</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Course">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course Name *</label>
              <input className="input" placeholder="e.g. B.Tech CSE" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Code</label>
              <input className="input" placeholder="e.g. BTCS" value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department *</label>
              <select className="input" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration (Years)</label>
              <select className="input" value={form.durationYears} onChange={e => setForm(f => ({ ...f, durationYears: e.target.value }))}>
                {[2,3,4,5].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.name || !form.departmentId} className="btn-primary">
              {saving ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
