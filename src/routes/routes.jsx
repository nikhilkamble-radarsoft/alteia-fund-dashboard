import { lazy } from "react";
import { BiHome } from "react-icons/bi";
import { FaRegUser, FaVoteYea } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Login from "../pages/auth/Login";
import SMERegister from "../pages/auth/SMERegister";
import { PiBellRingingFill, PiChartLineUp, PiGridFour } from "react-icons/pi";
import { logout } from "../redux/authSlice";
import { LuLogOut } from "react-icons/lu";
import Dashboard from "../pages/Dashboard";
import CreateInvestor from "../pages/investor/CreateInvestor";
import ViewInvestor from "../pages/investor/ViewInvestor";
import Investors from "../pages/investor/Investors";
import Leads from "../pages/lead/Leads";
import ViewLead from "../pages/lead/ViewLead";
import { RxDashboard } from "react-icons/rx";
import { HiOutlineUserGroup } from "react-icons/hi";
import Trades from "../pages/trade/Trades";
import ViewTrade from "../pages/trade/ViewTrade";
import { FiSettings } from "react-icons/fi";
import { RiCoinsLine } from "react-icons/ri";
import ROIOverview from "../pages/fund_performance/ROIOverview";
import { inProdMode } from "../utils/constants";
import ViewUpdateROI from "../pages/fund_performance/ViewUpdateROI";

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
      icon: RxDashboard,
      Component: Dashboard,
      showInSidebar: "top",
      isPrivate: inProdMode,

      title: `Welcome back, ${ctx.user?.full_name || "Admin"}!`,
      subtitle: "Dashboard Overview",
    },
    {
      path: "/investors",
      label: "Investors",
      icon: FaRegUser,
      Component: Investors,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: "Customers management",
      subtitle: "Track customer verification, investment activity, and key details.",
      children: [
        {
          path: "/investors/create",
          label: "Create Investor",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: CreateInvestor,
          title: "Add New Customer",
          subtitle:
            "Fill in the details below to register a new customer and initiate KYC verification.",
        },
        {
          path: "/investors/:id",
          label: "View Investor",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewInvestor,
          title: "Investor Details",
          subtitle: "View and manage investor details.",
        },
      ],
    },
    {
      path: "/trades",
      label: "Funds",
      icon: PiChartLineUp,
      Component: Trades,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: "Trades management",
      subtitle: "Browse and explore every available investment opportunity in one place.",
      children: [
        {
          path: "/trades/create",
          label: "Create Trade",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewTrade,
          title: "Add New Trade",
          subtitle:
            "Fill in the details below to create or update an investment opportunity. Ensure all information is accurate before saving.",
        },
        {
          path: "/trades/:id",
          label: "View Trade",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewTrade,
          title: "Trade Details",
          subtitle: "View and manage trade details.",
        },
      ],
    },
    {
      path: "/roi",
      label: "Fund Performance",
      icon: RiCoinsLine,
      Component: ROIOverview,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: "ROI Overview",
      subtitle: "Track your portfolio’s performance and analyze monthly returns at a glance.",
      children: [
        {
          path: "/roi/update/:id",
          label: "View Update ROI",
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewUpdateROI,
          title: "Monthly ROI Input",
          subtitle: "Enter monthly ROI percentages to update investor reports.",
        },
      ],
    },
    {
      path: "/leads",
      label: "Leads",
      icon: HiOutlineUserGroup,
      Component: Leads,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: "Leads management",
      subtitle: "Manage and track lead status, and follow up efficiently.",
      children: [
        {
          path: "/leads/:id",
          label: "View Lead",
          icon: CgAdd,
          // showInSidebar: "top",
          title: "Lead Details",
          subtitle: "Review KYC and registration details before approval.",
          Component: ViewLead,
          showBack: true,
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
      key: "settings",
      onClick: () => {},
      icon: FiSettings,
      label: "Settings",
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
