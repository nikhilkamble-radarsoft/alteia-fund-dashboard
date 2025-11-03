import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useThemedModal } from "./useThemedModal";
import { localStorageTokenKey } from "../utils/constants";

export function useAxios() {
  const navigate = useNavigate();
  const { showError } = useThemedModal();

  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
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
      if (!error.response) {
        console.error("Network or CORS error:", error);
        showError("Network error. Please try again later.");
        return Promise.reject(error);
      }

      const status = error.response?.status;

      if (status === 401) {
        localStorage.removeItem(localStorageTokenKey);
        showError("Session expired. Please login again.", {
          onOk: () => {
            navigate("/login");
          },
          onOkText: "Go to Login",
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
