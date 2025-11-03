import { useState } from "react";
import { Layout, Drawer } from "antd";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useMediaQuery } from "react-responsive";

const { Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const sidebarWidth = collapsed ? 80 : 256;

  const toggleSidebar = () => {
    if (isMobile) setDrawerVisible(!drawerVisible);
    else setCollapsed(!collapsed);
  };

  return (
    <Layout className="bg-background min-h-screen">
      {/* Fixed Sidebar */}
      {!isMobile && (
        <div
          style={{
            width: sidebarWidth,
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            background: "var(--color-primary)",
            transition: "width 0.2s",
            zIndex: 1000,
          }}
        >
          <Sidebar collapsed={collapsed} />
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={250}
          styles={{ body: { padding: 0 } }}
          className="bg-primary"
        >
          <Sidebar collapsed={false} toggleSidebar={toggleSidebar} />
        </Drawer>
      )}

      {/* Main Content */}
      <Layout
        style={{
          marginLeft: !isMobile ? sidebarWidth : 0,
          transition: "margin-left 0.2s",
        }}
      >
        <Topbar collapsed={collapsed} sidebarWidth={sidebarWidth} onToggleSidebar={toggleSidebar} />

        <Content className="p-3 sm:p-4 mt-[70px]">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-sm">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
