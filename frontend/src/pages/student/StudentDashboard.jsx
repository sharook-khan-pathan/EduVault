import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, PageLoader, PriorityBadge } from '../../components/common/UI';
import MaterialCard from '../../components/common/MaterialCard';
import { subjectApi, materialApi, announcementApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiSearch, FiBell, FiBook, FiArrowRight } from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [recent, setRecent] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deptId = user?.departmentId;

    Promise.all([
      subjectApi.getAll(),
      materialApi.getRecent(20),
      deptId ? announcementApi.getForDepartment(deptId) : announcementApi.getAll()
    ]).then(([s, r, a]) => {
      // Filter subjects to only student's department
      const allSubjects = s.data.data || [];
      const deptSubjects = deptId
        ? allSubjects.filter(sub => sub.departmentId === deptId)
        : allSubjects;
      setSubjects(deptSubjects);

      // Filter recent materials to only student's department
      const allMaterials = r.data.data || [];
      const deptMaterials = deptId
        ? allMaterials.filter(m => {
            // match by departmentId on the subject's course
            return deptSubjects.some(sub => sub.id === m.subjectId);
          })
        : allMaterials;
      setRecent(deptMaterials);

      setAnnouncements(a.data.data?.content || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold text-gray-800">{user?.fullName}</span>
            {user?.departmentName && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {user.departmentName}
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="My Subjects" value={subjects.length} icon={FiBookOpen} color="blue"
            subtitle={user?.departmentName} />
          <StatCard title="Recent Materials" value={recent.length} icon={FiBook} color="green" />
          <StatCard title="Announcements" value={announcements.length} icon={FiBell} color="purple" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/student/browse"
            className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiBookOpen className="text-blue-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Browse Materials</h3>
              <p className="text-sm text-gray-500">By subject & semester</p>
            </div>
          </Link>
          <Link to="/student/search"
            className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiSearch className="text-purple-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Search Materials</h3>
              <p className="text-sm text-gray-500">Find anything instantly</p>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Materials - dept filtered */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recently Added
                <span className="ml-2 text-sm font-normal text-gray-500">({user?.departmentName})</span>
              </h2>
              <Link to="/student/browse" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Browse all <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recent.length === 0 ? (
                <div className="card text-center py-8 text-gray-500 text-sm">
                  No materials uploaded for your department yet
                </div>
              ) : (
                recent.slice(0, 4).map(m => <MaterialCard key={m.id} material={m} />)
              )}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              <Link to="/student/announcements" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="card text-center py-8 text-gray-500 text-sm">No announcements</div>
              ) : (
                announcements.slice(0, 5).map(a => (
                  <div key={a.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{a.title}</h3>
                      <PriorityBadge priority={a.priority} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(a.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
