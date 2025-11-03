import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { localStorageTokenKey } from "../utils/constants";

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem(localStorageTokenKey);
  const dispatch = useDispatch();
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    dispatch(logout());
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
