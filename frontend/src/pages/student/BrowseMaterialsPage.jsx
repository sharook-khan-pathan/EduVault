import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { PageLoader, EmptyState } from '../../components/common/UI';
import MaterialCard from '../../components/common/MaterialCard';
import { subjectApi, materialApi, courseApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiFilter, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BrowseMaterialsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [filters, setFilters] = useState({ courseId: '', semester: '', subjectId: '' });

  // Load courses for student's department only
  useEffect(() => {
    if (!user?.departmentId) return;
    courseApi.getByDepartment(user.departmentId)
      .then(r => setCourses(r.data.data || []))
      .catch(() => toast.error('Failed to load courses'));
  }, [user]);

  // Load subjects when course or semester changes
  useEffect(() => {
    if (!filters.courseId) { setSubjects([]); setFilters(f => ({ ...f, subjectId: '' })); return; }
    const fn = filters.semester
      ? subjectApi.getByCourseAndSemester(filters.courseId, filters.semester)
      : subjectApi.getByCourse(filters.courseId);
    fn.then(r => setSubjects(r.data.data || []))
      .catch(() => toast.error('Failed to load subjects'));
    setFilters(f => ({ ...f, subjectId: '' }));
  }, [filters.courseId, filters.semester]);

  // Load materials when subject is selected
  useEffect(() => {
    if (!filters.subjectId) { setMaterials([]); return; }
    setLoadingMaterials(true);
    materialApi.getBySubject(filters.subjectId)
      .then(r => setMaterials(r.data.data?.content || []))
      .catch(() => toast.error('Failed to load materials'))
      .finally(() => setLoadingMaterials(false));
  }, [filters.subjectId]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Materials</h1>
          <p className="text-gray-500 mt-1">Study materials for your department</p>
        </div>

        {/* Department locked banner */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
          <FiLock size={14} />
          <span>Showing materials for: <strong>{user?.departmentName || 'Your Department'}</strong></span>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-gray-500" size={16} />
            <h2 className="font-semibold text-gray-900">Filter Materials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Course</label>
              <select className="input" value={filters.courseId}
                onChange={e => setFilter('courseId', e.target.value)}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={filters.semester}
                onChange={e => setFilter('semester', e.target.value)}
                disabled={!filters.courseId}>
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" value={filters.subjectId}
                onChange={e => setFilter('subjectId', e.target.value)}
                disabled={!filters.courseId}>
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.code ? ` (${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loadingMaterials ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !filters.subjectId ? (
          <EmptyState icon={FiBookOpen} title="Select a subject"
            description="Choose your course and subject above to view study materials" />
        ) : materials.length === 0 ? (
          <EmptyState icon={FiBookOpen} title="No materials yet"
            description="No materials have been uploaded for this subject yet" />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {materials.length} material{materials.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {materials.map(m => <MaterialCard key={m.id} material={m} />)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
