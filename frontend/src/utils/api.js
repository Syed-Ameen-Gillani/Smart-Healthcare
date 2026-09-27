import { API_BASE_URL, authenticatedFetch, clearAccessToken, persistAccessToken } from "./runtime";

async function apiRequest(endpoint, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData && (options.method || "GET").toUpperCase() !== "GET") headers["Content-Type"] = "application/json";
    const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : { success: response.ok, status: response.status };
    if (!response.ok) throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
    if (data?.data?.access_token) await persistAccessToken(data.data.access_token);
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const authAPI = {
  login: (email, password) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (userData) => apiRequest("/auth/signup", { method: "POST", body: JSON.stringify(userData) }),
  logout: async () => { try { return await apiRequest("/auth/logout", { method: "POST" }); } finally { clearAccessToken(); } },
  checkAuth: () => apiRequest("/auth/status"),
};

export const profileAPI = {
  getProfile: () => apiRequest("/profile"),
  updateProfile: (data) => apiRequest("/profile/update", { method: "PATCH", body: JSON.stringify(data) }),
  updateProfilePicture: (file) => { const body = new FormData(); body.append("profile_picture", file); return apiRequest("/profile/picture", { method: "POST", body }); },
};

export const geminiAPI = {
  healthChat: async (message, context = {}) => {
    const response = await apiRequest("/gemini/chat", { method: "POST", body: JSON.stringify({ message, context }) });
    console.info("[gemini] Chat response received", { responseLength: response.data?.response?.length || 0 });
    return response;
  },
  getStatus: () => apiRequest("/gemini/status"),
};

export const fileAPI = {
  upload: (file) => { const body = new FormData(); body.append("file", file); return apiRequest("/files/upload", { method: "POST", body }); },
  getFiles: () => apiRequest("/files"),
  deleteFile: (id) => apiRequest(`/files/${id}`, { method: "DELETE" }),
  getFile: (id) => apiRequest(`/files/${id}`),
  analyzeReport: (id) => apiRequest(`/files/${id}/analysis`),
  viewFile: async (id) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/files/${id}`);
    if (!response.ok) throw new Error("Failed to load file");
    const url = URL.createObjectURL(await response.blob());
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },
};

export const contactAPI = { submit: (data) => apiRequest("/contact", { method: "POST", body: JSON.stringify(data) }) };

export const medicineOrderAPI = {
  catalog: async (search = "") => {
    const response = await apiRequest(`/medicine-catalog${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    console.info("[medicine] Catalog loaded", { count: response.data?.medicines?.length || 0 });
    return response;
  },
  seedCatalog: () => apiRequest("/medicine-catalog/seed", { method: "POST" }),
  create: (order) => apiRequest("/medicine-orders", { method: "POST", body: JSON.stringify(order) }),
  list: () => apiRequest("/medicine-orders"),
  get: (id) => apiRequest(`/medicine-orders/${id}`),
};

export const doctorAPI = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value !== "" && value != null && params.set(key, value));
    return apiRequest(`/doctors?${params}`);
  },
  get: (id) => apiRequest(`/doctors/${id}`),
  getSpecializations: () => apiRequest("/doctors/specializations"),
  getCities: () => apiRequest("/doctors/cities"),
  seed: () => apiRequest("/doctors/seed", { method: "POST" }),
};

export const healthAPI = { check: () => apiRequest("/health") };
export const reportAPI = {
  getSummary: (days = 90) => apiRequest(`/reports/summary?days=${days}`),
  downloadReport: async (days = 90) => downloadFromResponse(`/reports/generate?days=${days}`, `health_report_${new Date().toISOString().slice(0, 10)}.pdf`),
};
export const exportAPI = {
  getSummary: (days = 90) => apiRequest(`/export/summary?days=${days}`),
  downloadCSV: (type, days = 90) => downloadFromResponse(`/export/csv/${type}?days=${days}`, `${type}.csv`),
};

async function downloadFromResponse(endpoint, filename) {
  const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error("Download failed");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}

export const checkAuthentication = async () => { try { return (await authAPI.checkAuth()).success; } catch { return false; } };
export const downloadFile = (id, filename) => downloadFromResponse(`/files/${id}`, filename || "download");
export { apiRequest, API_BASE_URL, authenticatedFetch };

export default { auth: authAPI, profile: profileAPI, gemini: geminiAPI, file: fileAPI, contact: contactAPI, health: healthAPI, report: reportAPI, export: exportAPI, doctor: doctorAPI, medicineOrders: medicineOrderAPI, checkAuthentication, downloadFile };
