import { Divider, Layout, Menu } from "antd";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { useState, useEffect } from "react";
import { createRoutesConfig } from "../../routes/routes";
import { useMediaQuery } from "react-responsive";
import AppLogo from "../common/AppLogo";
import { useDispatch } from "react-redux";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CustomButton from "../form/CustomButton";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

const { Sider } = Layout;

export default function Sidebar({ collapsed, toggleSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const routesConfig = createRoutesConfig({ dispatch, navigate });

  const getMenuItems = (routes) => {
    const menuItemsArray = [];
    routes.forEach((route, index) => {
      const IconComponent = route.icon;
      const Icon =
        typeof IconComponent === "function" ? (
          IconComponent({ size: 20 }) // dynamic icon renderer
        ) : IconComponent ? (
          <IconComponent size={20} /> // normal component usage
        ) : null;

      const children = route.children ? getMenuItems(route.children) : undefined;
      if (!route.showInSidebar && (!children || children.length === 0)) return;

      menuItemsArray.push({
        key: route.path,
        icon: Icon,
        label: route.label,
        onClick:
          children && children.length
            ? undefined
            : route.onClick
            ? () => {
                isMobile && toggleSidebar();
                route.onClick();
              }
            : () => {
                isMobile && toggleSidebar();
                navigate(route.path);
              },
        children: children && children.length ? children : undefined,
      });

      if (route.dividerAfter) {
        menuItemsArray.push({
          key: `divider-${index}`,
          type: "divider",
        });
      }
    });

    return menuItemsArray;
  };

  const topMenuItems = getMenuItems(routesConfig.filter((r) => r.showInSidebar === "top"));
  const bottomMenuItems = getMenuItems(routesConfig.filter((r) => r.showInSidebar === "bottom"));

  const getSelectedKeys = (routes, pathname) => {
    for (const route of routes) {
      if (!route.path) continue;

      // If route has children, check them first
      if (route.children) {
        const childKey = getSelectedKeys(route.children, pathname);

        // ✅ Child matched
        if (childKey.length) {
          // If child is visible → return child
          const visibleChild = route.children.find(
            (c) => matchPath({ path: c.path, end: true }, pathname) && c.showInSidebar
          );
          if (visibleChild) return [visibleChild.path];

          // ❌ Child is hidden → return parent
          return [route.path];
        }
      }

      // ✅ Exact match for this route
      if (matchPath({ path: route.path, end: true }, pathname)) {
        return [route.path];
      }
    }

    return [];
  };

  const selectedKeys = getSelectedKeys(routesConfig, location.pathname);
  // console.log("selectedKeys", selectedKeys);

  const getOpenKeys = (routes, pathname) => {
    let keys = [];

    for (const route of routes) {
      if (!route.showInSidebar) continue;
      if (!route.path) continue;

      // If route has children, check if pathname starts with parent
      if (route.children && pathname.startsWith(route.path)) {
        keys.push(route.path);
        keys = [...keys, ...getOpenKeys(route.children, pathname)];
      }
    }

    return keys;
  };

  useEffect(() => {
    const newOpenKeys = getOpenKeys(routesConfig, location.pathname);
    // console.log("newOpenKeys", newOpenKeys);
    setOpenKeys(newOpenKeys);
  }, [location.pathname]);

  const sidebarClasses = `!bg-primary !text-white flex flex-col h-screen overflow-hidden`;
  const menuClasses = `!bg-primary !text-white !text-md px-4 flex-1 overflow-auto flex-1`;

  return (
    <Sider collapsed={collapsed} width={256} className={sidebarClasses}>
      <div className="relative flex flex-col h-full overflow-hidden">
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            touchAction: isMobile ? "pan-y" : "auto",
          }}
        >
          <AppLogo width={collapsed ? 40 : 208} />
        </div>

        <Divider className="border-[#FFFFFF1A] min-w-[80%] w-[80%] mx-auto text-gray-500">
          {/* MAIN */}
        </Divider>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys)}
            items={topMenuItems}
            className="!bg-primary !text-white !text-md px-4"
          />
        </div>

        {!isMobile && (
          <CustomButton
            showIcon
            icon={
              <FiChevronLeft
                size={14}
                className={`text-white transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            }
            width=""
            onClick={toggleSidebar}
            className="!p-1.5 fixed top-[74px] h-auto z-[2000]"
            style={{
              left: collapsed ? 68 : 244,
              transition: "left 0.2s",
            }}
            btnType="light-primary"
          />
        )}
      </div>

      {/* Bottom section */}
      <div className="">
        {!collapsed && (
          <div className="bg-[#FFFFFF1A] rounded-2xl p-4 gap-3 mx-4 flex flex-col justify-center items-center">
            <Title level={5} className="text-white">
              Push notifications
            </Title>
            <CustomButton
              showIcon
              text="Add new"
              onClick={() => navigate("/create-notification")}
              btnType="light-primary"
            />
          </div>
        )}
        <Divider className="border-[#FFFFFF1A] min-w-[80%] w-[80%] mx-auto mb-2" />

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={bottomMenuItems}
          className={menuClasses}
        />
      </div>
    </Sider>
  );
}
