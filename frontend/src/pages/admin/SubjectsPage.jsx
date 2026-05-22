import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Modal, PageLoader, EmptyState } from '../../components/common/UI';
import { adminApi } from '../../api/services';
import { FiPlus, FiBookOpen, FiUser } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', semester: '', year: '', totalUnits: 5, courseId: '', facultyId: '' });
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const load = () => Promise.all([
    adminApi.getSubjects(),
    adminApi.getCourses(),
    adminApi.getFaculty()
  ]).then(([s, c, f]) => {
    setSubjects(s.data.data?.content || []);
    setCourses(c.data.data || []);
    setFaculty(f.data.data?.content || []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminApi.createSubject({
        ...form,
        semester: parseInt(form.semester),
        year: parseInt(form.year),
        totalUnits: parseInt(form.totalUnits),
        courseId: parseInt(form.courseId),
        facultyId: form.facultyId ? parseInt(form.facultyId) : null
      });
      toast.success('Subject created');
      setModalOpen(false);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!selectedFaculty) return;
    setSaving(true);
    try {
      await adminApi.assignFaculty(assignModal.id, selectedFaculty);
      toast.success('Faculty assigned');
      setAssignModal(null);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{subjects.length} subjects</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <FiPlus size={16} /> Add Subject
          </button>
        </div>

        {subjects.length === 0 ? (
          <EmptyState icon={FiBookOpen} title="No subjects yet" description="Add subjects to organize materials"
            action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add Subject</button>} />
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Subject', 'Code', 'Course', 'Semester', 'Faculty', 'Materials', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.code || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.courseName}</td>
                    <td className="px-4 py-3 text-gray-500">Sem {s.semester}</td>
                    <td className="px-4 py-3 text-gray-500">{s.facultyName || <span className="text-orange-500">Unassigned</span>}</td>
                    <td className="px-4 py-3 text-gray-500">{s.materialCount}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setAssignModal(s); setSelectedFaculty(s.facultyId || ''); }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <FiUser size={12} /> Assign Faculty
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Subject">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject Name *</label>
              <input className="input" placeholder="e.g. Data Structures" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Code</label>
              <input className="input" placeholder="e.g. CS301" value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Course *</label>
            <select className="input" value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Year *</label>
              <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                <option value="">Year</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester *</label>
              <select className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                <option value="">Sem</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Units</label>
              <input type="number" className="input" value={form.totalUnits} min={1} max={10}
                onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Assign Faculty</label>
            <select className="input" value={form.facultyId} onChange={e => setForm(f => ({ ...f, facultyId: e.target.value }))}>
              <option value="">Select faculty (optional)</option>
              {faculty.map(f => <option key={f.id} value={f.id}>{f.fullName}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.name || !form.courseId || !form.semester} className="btn-primary">
              {saving ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Faculty Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Faculty - ${assignModal?.name}`} size="sm">
        <div className="space-y-4">
          <select className="input" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
            <option value="">Select faculty</option>
            {faculty.map(f => <option key={f.id} value={f.id}>{f.fullName}</option>)}
          </select>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAssignModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssign} disabled={saving || !selectedFaculty} className="btn-primary">
              {saving ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
