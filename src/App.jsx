import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { createRoutesConfig } from "./routes/routes";
import { Suspense, useEffect } from "react";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ModalProvider } from "./logic/ModalProvider";
import "./App.css";
import "./logic/i18n"; // Initialize i18n
import { useLanguage } from "./logic/useLanguage";
import { useAxios } from "./logic/useAxios";
import { logout, setAuth } from "./redux/authSlice";

const wrapWithAuth = (element, { isPrivate, isPublic }) => {
  if (isPrivate) return <PrivateRoute>{element}</PrivateRoute>;
  if (isPublic) return <PublicRoute>{element}</PublicRoute>;
  return element;
};

const flattenRoutes = (routes) => {
  return routes.reduce((acc, route) => {
    const { path, Component, children, isPrivate, isPublic, withLayout = true } = route;
    if (!Component) return acc;

    const element = wrapWithAuth(
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>,
      { isPrivate, isPublic },
    );

    acc.push({ path, element, withLayout });

    if (children) {
      acc.push(...flattenRoutes(children));
    }

    return acc;
  }, []);
};

const getCssVariable = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function App() {
  const { locale, direction } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const axios = useAxios();

  const routesConfig = createRoutesConfig();
  const allRoutes = flattenRoutes(routesConfig);
  const layoutRoutes = allRoutes.filter((r) => r.withLayout);
  const nonLayoutRoutes = allRoutes.filter((r) => !r.withLayout);
  const isAuthenticated = !!user?._id;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: layoutRoutes.map(({ path, element }) => ({ path, element })),
    },
    ...nonLayoutRoutes.map(({ path, element }) => ({ path, element })),
    {
      path: "*",
      element: <div>404 - Page Not Found</div>,
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/user/profile`);
        dispatch(setAuth({ user: res.data?.data }));
      } catch (err) {
        if (err?.response?.status === 401) dispatch(logout());
      }
    };

    fetchProfile();
  }, []);

  return (
    <StyleProvider layer>
      <ConfigProvider
        locale={locale}
        direction={direction}
        theme={{
          token: {
            colorLink: getCssVariable("--color-primary"),
            colorPrimary: getCssVariable("--color-primary"),
            colorSecondary: getCssVariable("--color-secondary"),
            colorBackground: getCssVariable("--color-background"),
            colorBgLayout: getCssVariable("--color-background"),
            colorTextPrimary: getCssVariable("--color-text-primary"),
            colorTextSecondary: getCssVariable("--color-text-secondary"),

            fontFamily: `"Source Sans Pro", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
          },
          components: {
            Form: {
              labelFontSize: 14,
              verticalLabelPadding: 0,
              size: "large",
              labelColor: getCssVariable("--color-primary"),
            },
            Input: {
              fontSizeLG: 14,
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
            InputNumber: {
              fontSizeLG: 14,
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
            Select: {
              fontSizeLG: 14,
              optionSelectedBg: getCssVariable("--color-light-primary"),
              optionSelectedColor: "#fff",
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
            DatePicker: {
              fontSizeLG: 14,
              cellActiveWithRangeBg: getCssVariable("--color-light-primary"),
              cellActiveWithRangeColor: "#fff",
              cellHoverBg: "rgba(0,0,0,0.04)",
              cellActiveBg: getCssVariable("--color-light-primary"),
              cellSelectedBg: getCssVariable("--color-light-primary"),
              cellSelectedColor: "#fff",
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
            TimePicker: {
              fontSizeLG: 14,
              cellActiveBg: getCssVariable("--color-light-primary"),
              cellHoverBg: "rgba(0,0,0,0.04)",
              cellSelectedBg: getCssVariable("--color-light-primary"),
              cellSelectedColor: "#fff",
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
            Segmented: {
              fontSizeLG: 14,
              itemSelectedColor: getCssVariable("--color-light-primary"),
              itemSelectedBg: "#fff",
              itemSelectedFontWeight: 600,
              colorTextDisabled: getCssVariable("--color-text-disabled"),
            },
          },
        }}
      >
        <ModalProvider>
          <RouterProvider router={router} />
        </ModalProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}
