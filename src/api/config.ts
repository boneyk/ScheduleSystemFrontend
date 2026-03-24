import { context, propagation } from '@opentelemetry/api';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

import { baseLayoutStore } from '@/stores/baseLayout.store';

declare const BASE_URL_AUTH: string;
declare const BASE_URL_OFFICE: string;
declare const BASE_URL_SCHEDULE: string;
declare const BASE_URL_EMPLOYEE: string;
declare const BASE_URL_APPLICATION: string;
declare const BASE_URL_CATALOG: string;

const baseConfig = {
  withCredentials: true,
  timeout: 60000
};

export const getErrorMessage = (status?: number | null): string => {
  if (!status) return 'Произошла неизвестная ошибка';
  if (status >= 500) return 'Ошибка сервера. Попробуйте позже';
  if ([400, 409].includes(status)) return 'Неверные данные запроса';
  return 'Произошла неизвестная ошибка';
};

let refreshPromise: Promise<string> | null = null;
const getFreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          baseLayoutStore.showWarning('Ошибка авторизации');
          throw new Error('No refresh token');
        }
        const response = await axios.post(
          `${BASE_URL_AUTH}auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            },
            timeout: 10000
          }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return accessToken;
      } catch (error) {
        localStorage.clear();
        window.location.href = '/login';
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

const refreshAuthLogic = async (failedRequest: any): Promise<void> => {
  const newAccessToken = await getFreshAccessToken();
  if (failedRequest.response?.config?.headers) {
    failedRequest.response.config.headers.Authorization = `Bearer ${newAccessToken}`;
  }
};

const injectTraceHeaders = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  if (config.headers) {
    Object.entries(carrier).forEach(([key, value]) => {
      config.headers.set(key, value);
    });
  }
  return config;
};

const createApiInstance = (baseURL: string, withRefresh: boolean = true): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    ...baseConfig
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return injectTraceHeaders(config);
  });

  if (withRefresh) {
    createAuthRefreshInterceptor(instance as any, refreshAuthLogic, {
      statusCodes: [401]
    });
  }
  return instance;
};

export const instance_auth = createApiInstance(BASE_URL_AUTH);
export const instance_office = createApiInstance(BASE_URL_OFFICE);
export const instance_schedule = createApiInstance(BASE_URL_SCHEDULE);
export const instance_employee = createApiInstance(BASE_URL_EMPLOYEE);
export const instance_application = createApiInstance(BASE_URL_APPLICATION);
export const instance_catalog = createApiInstance(BASE_URL_CATALOG);
