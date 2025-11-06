import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach token before every request
api.interceptors.request.use(
  (config) => {
    // Priority: 1. Environment variable (for one-time setup), 2. localStorage (for login-based)
    const envToken = process.env.NEXT_PUBLIC_JWT_TOKEN;
    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const token = envToken || localToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (unauthorized) responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Only redirect if not retrying and not the login or /me endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/users/me")
    ) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login?error=Session expired, please log in again";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
