import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach token before every request
api.interceptors.request.use(
  (config) => {
    // Priority: 1. localStorage (shared across tabs), 2. sessionStorage (fallback), 3. Environment variable
    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const sessionToken = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const envToken = process.env.NEXT_PUBLIC_JWT_TOKEN;
    // Use localStorage first (shared), then sessionStorage (fallback), then env token
    const token = localToken || sessionToken || envToken;
    
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

    // Only redirect if not retrying and not the login, verify-otp, or /me endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/verify-otp") &&
      !originalRequest.url.includes("/users/me")
    ) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?error=Session expired, please log in again";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
