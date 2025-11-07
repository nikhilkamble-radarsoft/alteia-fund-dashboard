import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "./ModalProvider.jsx";
import { useAxios } from "./useAxios.js";
import { inProdMode, localStorageTokenKey } from "../utils/constants.js";

const defaultAutoCloseTime = inProdMode ? 5 : 0;

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const navigationRef = useRef({ unauthorized: false, conflict: false }); // used to prevent multiple redirects
  const { showError, showSuccess } = useGlobalModal();
  const axios = useAxios();

  /**
   * @param {Object} options
   * @param {string} options.method - HTTP method: 'get', 'post', 'put', etc.
   * @param {string} options.url - API endpoint
   * @param {Object} options.data - Request body for POST/PUT
   * @param {Object} options.params - Query parameters for GET
   * @param {state} options.setParentLoading - setter for loading state from component
   */
  const callApi = useCallback(
    async ({
      method = "get",
      url,
      data = null,
      params = null,
      setParentLoading,
      successOptions = null, // for showing success modal : { message, onOk, onOkText }
      errorOptions = null, // for showing error modal : { message, onOk, onOkText }
    }) => {
      setParentLoading?.(true);
      setLoading(true);

      try {
        const res = await axios({ method, url, data, params });
        const successMessage =
          successOptions?.message || res?.data?.message || "Request completed successfully!";

        if (successOptions) {
          showSuccess(successMessage, successOptions.subMessage, {
            ...successOptions,
            autoCloseTime: successOptions.autoCloseTime || defaultAutoCloseTime,
            style: {
              zIndex: 3000,
            },
          });
        }
        return {
          response: res.data,
          error: null,
          status: true,
          actualResponse: res,
          code: res.status,
        };
      } catch (err) {
        const status = err.response?.status;
        const errorMessage =
          errorOptions?.message || err.response?.data?.message || "An unexpected error occurred.";

        if (!err.response) {
          console.error("Network or CORS error:", err);
          showError("Network error. Please try again later.");
        } else if (status === 401) {
          localStorage.removeItem(localStorageTokenKey);
          showError("Session expired. Please login again.", "", {
            onOk: () => {
              navigate("/login");
            },
            onOkText: "Go to Login",
          });
        } else if (status === 403 && !navigationRef.current.unauthorized) {
          navigationRef.current.unauthorized = true;
          navigate("/unauthorized");
        } else if (status === 409 && !navigationRef.current.conflict) {
          navigationRef.current.conflict = true;
          navigate(-1);
        } else {
          if (errorOptions) {
            showError(errorMessage, errorOptions.subMessage, {
              ...errorOptions,
              autoCloseTime: errorOptions.autoCloseTime || defaultAutoCloseTime,
              style: {
                zIndex: 3000,
              },
            });
          }
        }

        return {
          response: err.response?.data,
          error: err,
          status: false,
          actualResponse: err.response,
          code: err.response?.status,
        };
      } finally {
        setParentLoading?.(false);
        setLoading(false);
      }
    },
    [navigate, showError, showSuccess]
  );

  return { loading, callApi };
}
