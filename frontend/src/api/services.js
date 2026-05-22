import api from './axios';

// ===== AUTH =====
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ===== ADMIN =====
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Departments
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  // Courses
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  // Subjects
  getSubjects: (page = 0, size = 20) => api.get(`/admin/subjects?page=${page}&size=${size}`),
  createSubject: (data) => api.post('/admin/subjects', data),
  assignFaculty: (subjectId, facultyId) => api.put(`/admin/subjects/${subjectId}/assign-faculty/${facultyId}`),
  // Users
  createUser: (data) => api.post('/admin/users', data),
  getStudents: (page = 0) => api.get(`/admin/users/students?page=${page}`),
  getFaculty: (page = 0) => api.get(`/admin/users/faculty?page=${page}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// ===== COURSES (public for students) =====
export const courseApi = {
  getAll: () => api.get('/courses'),
  getByDepartment: (departmentId) => api.get(`/courses/department/${departmentId}`),
};

// ===== SUBJECTS =====
export const subjectApi = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  getByCourse: (courseId) => api.get(`/subjects/course/${courseId}`),
  getByCourseAndSemester: (courseId, semester) => api.get(`/subjects/course/${courseId}/semester/${semester}`),
  getMySubjects: () => api.get('/subjects/my-subjects'),
};

// ===== MATERIALS =====
export const materialApi = {
  upload: (formData) => api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getBySubject: (subjectId, page = 0) => api.get(`/materials/subject/${subjectId}?page=${page}`),
  search: (query, page = 0) => api.get(`/materials/search?query=${query}&page=${page}`),
  getRecent: (limit = 10) => api.get(`/materials/recent?limit=${limit}`),
  getById: (id) => api.get(`/materials/${id}`),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getDownloadUrl: (id) => `http://localhost:8080/api/materials/download/${id}`,
};

// ===== ANNOUNCEMENTS =====
export const announcementApi = {
  create: (data) => api.post('/announcements', data),
  getAll: (page = 0) => api.get(`/announcements?page=${page}`),
  getForDepartment: (deptId, page = 0) => api.get(`/announcements/department/${deptId}?page=${page}`),
  delete: (id) => api.delete(`/announcements/${id}`),
};
