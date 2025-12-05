// resources/js/services/apiService.js
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const toast = useToast();

// ✅ Base Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

// 🧩 Request Interceptor — attach token
api.interceptors.request.use(
    (config) => {
        const auth = useAuthStore();
        const token = auth?.token || localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Response Interceptor — handle session/logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const auth = useAuthStore();

        if (error.response?.status === 401) {
            toast.error("Session expired. Redirecting to landing page...");
            setTimeout(() => {
                auth.logout();
                window.location.href = "/";
            }, 2000);
        }

        if (error.response?.status === 409) {
            toast.error("Your account has been deactivated. Please contact the administrator...");
            setTimeout(() => {
                auth.logout();
                window.location.href = "/";
            }, 2000);
        }

        return Promise.reject(error);
    }
);

// =====================================================
// 👤 USER MANAGEMENT
// =====================================================
export const fetchUsers = async () => api.get('/api/users').then(r => r.data);
export const fetchMyInfo = async () => api.get('/api/me').then(r => r.data);

export const fetchUserOtherInfo = async () => api.get('/api/users/other-info').then(r => r.data);
export const saveUpdateUserOtherInfo = async (user) =>
    api.post('/api/users/other-info', user).then(r => r.data);
export const saveUpdateUsers = async (user) =>
    api.post(`/api/users/update/${user.id}`, user).then(r => r.data);
export const toggleActiveUser = async (user) =>
    api.patch(`/api/users/${user}/toggle-active`).then(r => r.data);

// =====================================================
// 📜 TOR MANAGEMENT
// =====================================================
export const fetchAllTors = async () => api.get('/api/tor').then(r => r.data);
export const fetchMyTors = async () => api.get('/api/fetchMyTors').then(r => r.data);

export const uploadTor = async (file, curriculum_id) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/tor/upload/${curriculum_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 1200000,
    });
    return response.data;
};

export const fetchTor = async (id) => api.get(`/api/tor/${id}`).then(r => r.data);
export const updateTor = async (id, payload) => api.put(`/api/tor/${id}`, payload).then(r => r.data);
export const deleteTor = async (id) => api.delete(`/api/tor/${id}`).then(r => r.data);

export const approveTor = async (payload) => api.post('/api/tors/approve', payload).then(r => r.data);
export const rejectTor = async (id) => api.post(`/api/tors/reject/${id}`).then(r => r.data);
export const computeRemainingYears = async (torId, curriculumId) =>
    api.get(`/api/tor/approve/compute-remaining/${torId}/${curriculumId}`).then(r => r.data);

// =====================================================
// 🧾 ADVISING MANAGEMENT
// =====================================================
export const saveAdvising = async (payload) =>
    api.post('/api/advising', {
        tor_id: payload.tor_id,
        advising: payload.advising,
        ocr_records: payload.ocr_records,
    }).then(r => r.data);

export const fetchAdvising = async (torId) => api.get(`/api/advising/${torId}`).then(r => r.data);
export const newAdvising = async (curriculum_id) =>
    api.post(`/api/new-student/advising`, { curriculum_id }).then(r => r.data);

// =====================================================
// 🎓 COURSE MANAGEMENT
// =====================================================
export const fetchAllCourses = async () => api.get('/api/courses').then(r => r.data);
export const createCourse = async (courseData) => api.post('/api/courses', courseData).then(r => r.data);
export const updateCourse = async (id, courseData) => api.put(`/api/courses/${id}`, courseData).then(r => r.data);
export const deleteCourse = async (id) => api.delete(`/api/courses/${id}`).then(r => r.data);

// =====================================================
// 📚 CURRICULUM MANAGEMENT
// =====================================================
export const fetchAllCurriculums = async () => api.get('/api/curriculums').then(r => r.data);
export const createCurriculum = async (data) => api.post('/api/curriculums', data).then(r => r.data);
export const updateCurriculum = async (id, data) => api.put(`/api/curriculums/${id}`, data).then(r => r.data);
export const deleteCurriculum = async (id) => api.delete(`/api/curriculums/${id}`).then(r => r.data);
export const fetchCurriculumsByCourse = async (courseId) =>
    api.get(`/api/curriculums/course/${courseId}`).then(r => r.data);

// =====================================================
// 📘 SUBJECT MANAGEMENT
// =====================================================
export const fetchAllSubjects = async () => api.get('/api/subjects').then(r => r.data);
export const fetchSubjectsByCurriculum = async (curriculumId) =>
    api.get(`/api/curriculums/${curriculumId}/subjects`).then(r => r.data);
export const createSubject = async (data) => api.post('/api/subjects', data).then(r => r.data);
export const updateSubject = async (id, data) => api.put(`/api/subjects/${id}`, data).then(r => r.data);
export const deleteSubject = async (id) => api.delete(`/api/subjects/${id}`).then(r => r.data);
export const fetchSubjectPrerequisites = async (id) =>
    api.get(`/api/subjects/${id}/prerequisites`).then(r => r.data);

// =====================================================
// 🧮 GRADES MANAGEMENT
// =====================================================
export const saveGrades = async (id, grades) =>
    api.post(`/api/grades`, { tor_id: id, grades }, { timeout: 120000 }).then(r => r.data);

// =====================================================
// 🧠 OCR / TESSERACT PROCESSING
// =====================================================
export const Tesseract = async (id, curriculum_id) =>
    api.post(`/api/process-tor/${id}/${curriculum_id}`, {}, { timeout: 0 }).then(r => r.data);

// =====================================================
// 🔔 NOTIFICATIONS
// =====================================================
export const fetchAllNotifications = async () => api.get('/api/notifications').then(r => r.data);
export const fetchUnreadNotifications = async () => api.get('/api/notifications/unread').then(r => r.data);
export const markNotificationAsRead = async (id) => api.post(`/api/notifications/${id}/read`).then(r => r.data);
export const markAllNotificationsAsRead = async () => api.post('/api/notifications/read-all').then(r => r.data);

// =====================================================
// 📊 REPORTS / SUMMARIES
// =====================================================
export const fetchStudentSummary = async () => api.get(`/api/student/summary`).then(r => r.data);
export const fetchAdminSummary = async () => api.get(`/api/admin/summary`).then(r => r.data);

// ✅ Fetch subjects by course code
export async function fetchSubjectsByCourse(courseCode) {
  const response = await api.get(`/api/subjects/course/${courseCode}`);
  console.log("API response:", response.data);
  return response.data.subjects || [];
}


export default api;
