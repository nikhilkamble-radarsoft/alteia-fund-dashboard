import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { localStorageTokenKey } from "../utils/constants";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem(localStorageTokenKey);
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
