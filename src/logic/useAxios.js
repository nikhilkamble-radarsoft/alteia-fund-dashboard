import axios from "axios";

import { localStorageTokenKey } from "../utils/constants";

export function useAxios() {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  // request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(localStorageTokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
