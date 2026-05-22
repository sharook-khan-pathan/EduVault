import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { StatCard, PageLoader } from '../../components/common/UI';
import { adminApi, materialApi } from '../../api/services';
import MaterialCard from '../../components/common/MaterialCard';
import { FiUsers, FiBook, FiLayers, FiDownload, FiGrid, FiBookOpen } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), materialApi.getRecent(6)])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data.data);
        setRecent(recentRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats?.totalStudents} icon={FiUsers} color="blue" />
          <StatCard title="Total Faculty" value={stats?.totalFaculty} icon={FiUsers} color="green" />
          <StatCard title="Departments" value={stats?.totalDepartments} icon={FiGrid} color="purple" />
          <StatCard title="Courses" value={stats?.totalCourses} icon={FiLayers} color="orange" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Subjects" value={stats?.totalSubjects} icon={FiBookOpen} color="blue" />
          <StatCard title="Materials" value={stats?.totalMaterials} icon={FiBook} color="green" />
          <StatCard title="Total Downloads" value={stats?.totalDownloads} icon={FiDownload} color="purple" />
        </div>

        {/* Recent Materials */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recently Uploaded Materials</h2>
          {recent.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No materials uploaded yet</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recent.map(m => <MaterialCard key={m.id} material={m} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
