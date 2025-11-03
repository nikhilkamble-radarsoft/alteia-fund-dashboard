import { Layout, Button, Avatar, Space, Typography } from "antd";
import { MenuOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { PiAlignLeft, PiBellRinging, PiBellRingingFill } from "react-icons/pi";
import { createRoutesConfig } from "../../routes/routes";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../form/CustomButton";
import { BiChevronLeft } from "react-icons/bi";
import { FiChevronLeft } from "react-icons/fi";
import TableTitle from "../table/TableTitle";

const { Header } = Layout;
const { Title, Paragraph } = Typography;

export default function Topbar({ onToggleSidebar, sidebarWidth, collapsed }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const location = useLocation();
  const navigate = useNavigate();

  const routes = createRoutesConfig();

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

  // Values with inherited fallback
  const title = effectiveRoute?.title;
  const subtitle = effectiveRoute?.subtitle;

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
                showIcon={
                  lineage.length > 1 ? (
                    <CustomButton
                      showIcon
                      icon={<FiChevronLeft size={30} className="text-primary" />}
                      width=""
                      className="!p-[6px] !rounded-full"
                      onClick={() => navigate(-1)}
                      btnType="secondary"
                    />
                  ) : (
                    !isMobile && <effectiveRoute.icon size={30} className="text-primary" />
                  )
                }
                titleColor="!text-primary"
                subtitleColor="text-text-secondary"
                titleLevel={4}
              />
              {/* {lineage.length > 1 && (
                <CustomButton
                  showIcon
                  icon={<FiChevronLeft size={30} className="text-primary" />}
                  width=""
                  className="!p-[6px] !rounded-full"
                  onClick={() => navigate(-1)}
                  btnType="secondary"
                />
              )} */}
              {/* <div className="flex flex-col justify-center h-full max-w-[175px] sm:max-w-full">
                <Title level={4} className="mb-0 !text-primary font-bold truncate">
                  {title}
                </Title>
                {subtitle && (
                  <Paragraph className="mb-0 text-text-secondary truncate">{subtitle}</Paragraph>
                )}
              </div> */}
            </div>
          )}
        </div>

        <Space size="middle" className="flex items-center">
          <div>
            {<PiBellRingingFill fill="var(--color-primary)" style={{ fontSize: "24px" }} />}
          </div>
        </Space>
      </div>
    </Header>
  );
}
