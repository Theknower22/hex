 
import axios from 'axios';

// Dynamic API resolution to handle various dev environments (8000, 8001, etc.)
const API_PORT = window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? '8000' : (window.location.port || '8000');
const API_BASE_URL = `http://${window.location.hostname}:${API_PORT}/api/`;

console.log("[DEBUG] API Base URL set to:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 Unauthorized
      localStorage.removeItem('access_token');
      // Only redirect if not already on login/register to avoid loops
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return apiClient.post('token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (userData) => apiClient.post('register', userData),
};


export const reconService = {
  fullRecon: (target) => apiClient.get(`recon/full/${target}`),
  getIpInfo: (target) => apiClient.get(`recon/ip/${target}`),
  getDnsInfo: (domain) => apiClient.get(`recon/dns/${domain}`),
  getHeaders: (target) => apiClient.get(`recon/headers/${target}`),
};

export const scanService = {
  startScan: (target, intensity) => apiClient.post(
    `scan/start?target=${target}&intensity=${intensity}`,
    null,
    { timeout: 180000 } // 3 minutes — Nmap scans can take up to 90s
  ),
  getStatus: (id) => apiClient.get(`scan/status/${id}`),
  deleteScan: (id) => apiClient.delete(`scan/${id}`),
};

export const vulnService = {
  getFindings: (scanId) => apiClient.get(`vuln/findings/${scanId}`),
  getAllFindings: () => apiClient.get(`vuln/all`),
  getRecentFindings: (limit = 10) => apiClient.get(`vuln/recent?limit=${limit}`),
  analyze: (ports) => apiClient.get(`vuln/analyze?ports=${ports}`),
};

export const aiService = {
  chat: (query, context) => apiClient.post('ai/chat', { query, context }),
};

export const adminService = {
  getStats: () => apiClient.get('admin/stats'),
  getUsers: () => apiClient.get('admin/users'),
};

export const reportsService = {
  listReports: () => apiClient.get('vuln/all'), 
  download: (scanId, format) => `${API_BASE_URL}reports/download/${scanId}?format=${format}`,
  downloadPdf: (scanId) => apiClient.get(`reports/download/${scanId}?format=pdf`, { responseType: 'blob' }),
  delete: (scanId) => apiClient.delete(`reports/${scanId}`),
  getReportDetails: (scanId) => apiClient.get(`reports/details/${scanId}`),
  purgeAll: () => apiClient.delete(`reports/purge/all`),
};

export const exploitService = {
  analyze: (findingId) => apiClient.get(`exploit/analyze/${findingId}`),
  run: (findingId, labMode = false) => apiClient.post(`exploit/run/${findingId}?lab_mode=${labMode}`),
};

export default apiClient;
