import axios, { AxiosInstance } from "axios";

import { ApiClient } from "./types";
import API_CONFIG from "@/config/api.config";
import { useAuthStore } from "@/store/authStore";

export const apiClients = Object.entries(API_CONFIG).reduce(
  (acc, [key, config]) => {
    const client = axios.create({
      baseURL: config.BASE_URL,
      headers: config.DEFAULT_HEADERS,
      timeout: config.TIMEOUT,
    });

    // Add request interceptor to include auth token
    client.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState();

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const { refreshAuthToken, signOut } = useAuthStore.getState();
          try {
            const newToken = await refreshAuthToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return client(originalRequest);
            }
          } catch {
            // Refresh failed, redirect to login
            signOut();
          }
        }

        return Promise.reject(error);
      }
    );

    acc[key as ApiClient] = client;
    return acc;
  },
  {} as Record<ApiClient, AxiosInstance>
);
