import axios from 'axios';
import { redirect } from 'next/navigation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Needed for HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    // Import inside the interceptor to avoid issues with Zustand hydration
    const { useAuthStore } = require('@/store/auth');

    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Import inside the interceptor to avoid issues with Zustand hydration
        const { useAuthStore } = require('@/store/auth');

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Update the authorization header of the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear state and redirect to login
        useAuthStore.getState().logout();
        redirect('/auth/login'); // Use next/navigation.redirect for App Router
        return Promise.reject(refreshError);
      }
    }

    // If not a 401 or already retried, just reject the error
    return Promise.reject(error);
  }
);

export default api;