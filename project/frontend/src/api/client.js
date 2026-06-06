import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agri_zkp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = (payload) =>
  api.post("/auth/login", payload).then((r) => r.data);

export const registerUser = (payload) =>
  api.post("/auth/register", payload).then((r) => r.data);

export const applyRegulator = (payload) =>
  api.post("/auth/apply", payload).then((r) => r.data);

export const getRegulatorApplications = () =>
  api.get("/auth/admin/applications").then((r) => r.data.applications);

export const approveRegulator = (appId) =>
  api.post(`/auth/admin/approve/${appId}`).then((r) => r.data);

export const rejectRegulator = (appId) =>
  api.post(`/auth/admin/reject/${appId}`).then((r) => r.data);

export const getCrops = () => api.get("/crops").then((r) => r.data.crops);

export const getCropRules = (crop) =>
  api.get(`/crops/${encodeURIComponent(crop)}/rules`).then((r) => r.data.rules);

export const submitCompliance = (payload) =>
  api.post("/compliance/submit", payload).then((r) => r.data);

export const getRegulatorRecords = () =>
  api.get("/compliance/regulator").then((r) => r.data.records);

export default api;

