import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, PageLoader } from '../../components/common/UI';
import MaterialCard from '../../components/common/MaterialCard';
import { subjectApi, materialApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiUpload, FiBook, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([subjectApi.getMySubjects(), materialApi.getRecent(6)])
      .then(([s, r]) => {
        setSubjects(s.data.data || []);
        setRecent(r.data.data || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Assigned Subjects" value={subjects.length} icon={FiBookOpen} color="blue" />
          <StatCard title="Total Materials" value={recent.length} icon={FiBook} color="green" />
          <StatCard title="Department" value={user?.departmentName || 'N/A'} icon={FiBookOpen} color="purple" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/faculty/upload" className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FiUpload className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Upload Material</h3>
              <p className="text-sm text-gray-500">Share notes, PDFs, assignments</p>
            </div>
          </Link>
          <Link to="/faculty/subjects" className="card hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FiBookOpen className="text-green-600 dark:text-green-400" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Subjects</h3>
              <p className="text-sm text-gray-500">View assigned subjects</p>
            </div>
          </Link>
        </div>

        {/* Assigned Subjects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Subjects</h2>
            <Link to="/faculty/subjects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 6).map(s => (
              <Link key={s.id} to={`/faculty/subjects/${s.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.courseName} • Sem {s.semester}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{s.materialCount} materials</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">{s.code}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Materials */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recently Uploaded</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {recent.slice(0, 4).map(m => <MaterialCard key={m.id} material={m} />)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
