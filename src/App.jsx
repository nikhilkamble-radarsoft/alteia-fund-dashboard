import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { createRoutesConfig } from "./routes/routes";
import { Suspense, useEffect } from "react";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ModalProvider } from "./logic/ModalProvider";
import "./App.css";
import "./logic/i18n";
import { useLanguage } from "./logic/useLanguage";
import { useAxios } from "./logic/useAxios";
import { logout, setAuth } from "./redux/authSlice";
import { useTranslation } from "react-i18next";

const wrapWithAuth = (element, { isPrivate, isPublic }) => {
  if (isPrivate) return <PrivateRoute>{element}</PrivateRoute>;
  if (isPublic) return <PublicRoute>{element}</PublicRoute>;
  return element;
};

const flattenRoutes = (routes, t) => {
  return routes.reduce((acc, route) => {
    const { path, Component, children, isPrivate, isPublic, withLayout = true } = route;
    if (!Component) return acc;

    const element = wrapWithAuth(
      <Suspense fallback={<div>{t("loading")}</div>}>
        <Component />
      </Suspense>,
      { isPrivate, isPublic },
    );

    acc.push({ path, element, withLayout });

    if (children) {
      acc.push(...flattenRoutes(children, t));
    }

    return acc;
  }, []);
};

const getCssVariable = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function App() {
  const { t, i18n } = useTranslation();
  const { locale, direction, currentLang } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const axios = useAxios();

  const routesConfig = createRoutesConfig();
  const allRoutes = flattenRoutes(routesConfig, t);
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
      element: <div>{t("pageNotFound")}</div>,
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
  }, [currentLang]);

  useEffect(() => {
    if (!user && i18n.language !== "en") {
      i18n.changeLanguage("en");
    }
  }, [user, i18n]);

  useEffect(() => {
    document.title = t("appTitle");
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction, t]);

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
