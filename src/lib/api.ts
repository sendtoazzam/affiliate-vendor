import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vf_vendor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem("vf_vendor_token");
      localStorage.removeItem("vf_vendor_user");
      localStorage.removeItem("vf_vendor_brand");
      window.dispatchEvent(new CustomEvent("vf:session-expired"));
    }
    return Promise.reject(error);
  },
);

export const vendorApi = {
  // Auth
  login: async (credentials: {
    email?: string;
    username?: string;
    password: string;
  }) => {
    const response = await apiClient.post("/v1/auth/login", credentials);
    return response.data;
  },

  forgotPassword: async (data: {
    identifier: string;
    login_type: "email" | "username";
  }) => {
    const response = await apiClient.post("/v1/auth/admin/forgot-password", data);
    return response.data;
  },

  verifyToken: async () => {
    const response = await apiClient.get("/v1/vendor/portal/profile");
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/v1/vendor/portal/profile");
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await apiClient.get("/v1/vendor/portal/dashboard");
    return response.data;
  },

  // Products
  getProducts: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await apiClient.get("/v1/vendor/portal/products", {
      params,
    });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/v1/vendor/portal/products/${id}`);
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await apiClient.post("/v1/vendor/portal/products", data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiClient.put(
      `/v1/vendor/portal/products/${id}`,
      data,
    );
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/v1/vendor/portal/products/${id}`);
    return response.data;
  },

  // Reporting
  getReporting: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await apiClient.get("/v1/vendor/portal/reporting", {
      params,
    });
    return response.data;
  },

  // Accounting & Statements
  getStatements: async (params?: { page?: number; per_page?: number }) => {
    const response = await apiClient.get("/v1/vendor/portal/statements", {
      params,
    });
    return response.data;
  },

  getStatement: async (id: string) => {
    const response = await apiClient.get(`/v1/vendor/portal/statements/${id}`);
    return response.data;
  },

  // Class Change
  getClassChangeStatus: async () => {
    const response = await apiClient.get(
      "/v1/vendor/portal/class-change-request",
    );
    return response.data;
  },

  submitClassChange: async (data: {
    requested_class: string;
    reason?: string;
  }) => {
    const response = await apiClient.post(
      "/v1/vendor/portal/class-change-request",
      data,
    );
    return response.data;
  },

  // Maintenance Status
  getMaintenanceStatus: async (app = "shop") => {
    try {
      const response = await apiClient.get("/v1/public/maintenance/status", {
        params: { app },
      });
      return response.data?.data || response.data || null;
    } catch (error: any) {
      if (error.response?.data?.data) {
        return error.response.data.data;
      }
      return null;
    }
  },
};

