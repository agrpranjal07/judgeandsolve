import axios from 'axios';
import { redirect } from 'next/navigation';
import useAuthStore from '@/_store/auth';

// Track if a refresh is in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

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
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
        
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);

          // Update the authorization header of the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        // Refresh failed, clear state and redirect to login
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        redirect('/auth/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If not a 401 or already retried, just reject the error
    return Promise.reject(error);
  }
);

export default api;