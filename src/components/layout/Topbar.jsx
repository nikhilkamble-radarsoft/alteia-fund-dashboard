import { Layout, Button, Avatar, Space, Typography } from "antd";
import { MenuOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import {
  PiAlignLeft,
  PiBellFill,
  PiBellRinging,
  PiBellRingingBold,
  PiBellRingingFill,
  PiBellZBold,
} from "react-icons/pi";
import { createRoutesConfig } from "../../routes/routes";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../form/CustomButton";
import { BiChevronLeft } from "react-icons/bi";
import { FiChevronLeft } from "react-icons/fi";
import TableTitle from "../table/TableTitle";
import { useSelector } from "react-redux";
import { useTopData } from "./AppLayout";

const { Header } = Layout;

export default function Topbar({ onToggleSidebar, sidebarWidth }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    title: contextTitle,
    subtitle: contextSubtitle,
    showBack: contextShowBack,
  } = useTopData();

  const routes = createRoutesConfig({ user });

  const findActiveRoute = (routes, pathname, parents = []) => {
    for (const route of routes) {
      const lineage = [...parents, route];

      if (route.path && matchPath(route.path, pathname)) {
        return { route, lineage };
      }

      if (route.children) {
        const match = findActiveRoute(route.children, pathname, lineage);
        if (match) return match;
      }
    }
    return null;
  };

  const { route: activeRoute, lineage = [] } = findActiveRoute(routes, location.pathname) || {};

  // Find first route in lineage that has a title (closest child wins)
  const effectiveRoute = [...lineage].reverse().find((r) => r.title) || activeRoute;

  // Should we hide?
  const hideDetails = activeRoute?.hideTopDetails;

  // Values with context override, then route fallback
  const title = contextTitle ?? effectiveRoute?.title;
  const subtitle = contextSubtitle ?? effectiveRoute?.subtitle;
  const showBack = contextShowBack ?? effectiveRoute.showBack;

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        left: !isMobile ? sidebarWidth : 0,
        right: 0,
        // background: "transparent",
        background: "var(--color-background)",
        height: "auto",
        zIndex: 999,
        padding: "10px 16px",
        transition: "left 0.2s",
      }}
    >
      <div className="flex justify-between items-center w-full bg-white px-4 py-2 rounded-2xl shadow-sm">
        <div className="flex gap-3 items-center">
          {isMobile && lineage.length <= 1 && (
            <Button type="text" icon={<MenuOutlined />} onClick={onToggleSidebar} />
          )}

          {!hideDetails && (
            <div className="flex gap-4 items-center">
              <TableTitle
                title={title}
                subtitle={subtitle}
                // this is back button
                showIcon={
                  showBack ? (
                    <CustomButton
                      showIcon
                      icon={<FiChevronLeft size={30} className="text-primary" />}
                      width=""
                      className="!p-[6px] !rounded-full"
                      onClick={() => navigate(-1)}
                      btnType="secondary"
                    />
                  ) : null
                  // !isMobile && <effectiveRoute.icon size={30} className="text-primary" />
                }
                titleColor="!text-primary"
                subtitleColor="text-text-secondary"
                titleLevel={4}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#4E67271A] p-2">
            {<PiBellFill fill="#4E6727" style={{ fontSize: "24px" }} />}
          </div>
          <Avatar className="m-0" size={40} icon={<UserOutlined />} />
        </div>
      </div>
    </Header>
  );
}
