import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/utils/storage';
import { useUIStore } from '@/stores';

export const setupAuthInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const activeSchoolId = useUIStore.getState().activeSchoolId;
      if (activeSchoolId && config.headers) {
        config.headers['X-School-Id'] = activeSchoolId;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};
