import { lazy } from "react";
import { BiHome } from "react-icons/bi";
import { FaVoteYea } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Login from "../pages/auth/Login";
import SMERegister from "../pages/auth/SMERegister";
import { PiBellRingingFill, PiGridFour } from "react-icons/pi";
import { logout } from "../redux/authSlice";
import { LuLogOut } from "react-icons/lu";
import Dashboard from "../pages/Dashboard";
import CreateInvestor from "../pages/CreateInvestor";
import ViewInvestor from "../pages/ViewInvestor";
import Investors from "../pages/Investors";

const inProdMode = import.meta.env.VITE_ENV !== "development";

/**
 * Route config generator
 *
 * Why function? Because we need access to external context:
 * - ctx.dispatch  -> redux dispatch
 * - ctx.navigate  -> react-router navigation
 * - (later: user roles, feature flags, screen size, etc.)
 *
 * Route Object Fields:
 *
 * Core navigation:
 * - path              Route path (string)
 * - Component         React component to render
 * - children          Nested routes (for sidebar & matching)
 *
 * Sidebar:
 * - label             Text in sidebar
 * - icon              Icon component (React Icon OR function returning element)
 * - showInSidebar     "top" | "bottom" | undefined (if undefined = hide)
 * - onClick           Custom click handler (for non-navigation entries like logout)
 *
 * Auth/Layout control:
 * - isPrivate         Protect route (auth required)
 * - isPublic          Public only (hide when logged in)
 * - withLayout        false = no layout wrapper (useful for login pages)
 *
 * Topbar UI:
 * - title             Page title (Topbar)
 * - subtitle          Subtitle text (Topbar)
 * - hideTopDetails    Completely hide Topbar title/subtitle for this route
 *
 * ⚠️ RULES:
 * - Child routes inherit title/subtitle unless they override
 * - If child has hideTopDetails, Topbar hides title/subtitle
 * - Sidebar only shows routes where showInSidebar is defined
 */

export const createRoutesConfig = (ctx = {}) => {
  // ctx can include whatever you need: user, isMobile, feature flags, etc.

  return [
    {
      path: "/",
      label: "Dashboard",
      icon: PiGridFour,
      Component: Dashboard,
      showInSidebar: "top",
      isPrivate: inProdMode,

      title: `Welcome back, ${ctx.user?.full_name || "Admin"}!`,
      subtitle: "Dashboard Overview",
    },
    {
      path: "/investors",
      label: "Investors",
      icon: FaVoteYea,
      Component: Investors,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: "Customers management",
      subtitle: "Track customer verification, investment activity, and key details.",
      children: [
        {
          path: "/investors/create",
          label: "Create PO",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: CreateInvestor,
          title: "Add New Customer",
          subtitle:
            "Fill in the details below to register a new customer and initiate KYC verification.",
        },
        {
          path: "/investors/:id",
          label: "View PO",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewInvestor,
        },
      ],
    },
    {
      path: "/login",
      Component: Login,
      isPublic: inProdMode,
      withLayout: false,
    },
    {
      path: "/register",
      Component: SMERegister,
      isPublic: inProdMode,
      withLayout: false,
    },
    {
      key: "notification",
      onClick: () => {},
      icon: PiBellRingingFill,
      label: "Notification",
      showInSidebar: "bottom",
    },
    {
      key: "logout",
      onClick: () => {
        ctx.dispatch?.(logout());
        ctx.navigate?.("/login");
      },
      icon: (props) => <LuLogOut {...props} className="text-danger" />,
      label: <span className="text-red-500">Logout</span>,
      showInSidebar: "bottom",
    },
  ];
};
