import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import CoursesPage from './pages/admin/CoursesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import UsersPage from './pages/admin/UsersPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import UploadMaterialPage from './pages/faculty/UploadMaterialPage';
import FacultyMaterialsPage from './pages/faculty/FacultyMaterialsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseMaterialsPage from './pages/student/BrowseMaterialsPage';
import SearchPage from './pages/student/SearchPage';

// Shared Pages
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProfilePage from './pages/ProfilePage';

// ===== PROTECTED ROUTE =====
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return children;
}

// ===== ROOT REDIRECT =====
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = { ADMIN: '/admin', FACULTY: '/faculty', STUDENT: '/student' };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><DepartmentsPage /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['ADMIN']}><CoursesPage /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><SubjectsPage /></ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage role="FACULTY" /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage role="STUDENT" /></ProtectedRoute>} />
      <Route path="/admin/materials" element={<ProtectedRoute allowedRoles={['ADMIN']}><FacultyMaterialsPage /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnnouncementsPage /></ProtectedRoute>} />

      {/* Faculty */}
      <Route path="/faculty" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/subjects" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><BrowseMaterialsPage /></ProtectedRoute>} />
      <Route path="/faculty/upload" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><UploadMaterialPage /></ProtectedRoute>} />
      <Route path="/faculty/materials" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyMaterialsPage /></ProtectedRoute>} />
      <Route path="/faculty/announcements" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><AnnouncementsPage /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/browse" element={<ProtectedRoute allowedRoles={['STUDENT']}><BrowseMaterialsPage /></ProtectedRoute>} />
      <Route path="/student/search" element={<ProtectedRoute allowedRoles={['STUDENT']}><SearchPage /></ProtectedRoute>} />
      <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={['STUDENT']}><AnnouncementsPage /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
