import { lazy } from "react";
import { BiHome } from "react-icons/bi";
import { FaRegUser, FaVoteYea } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Login from "../pages/auth/Login";
import SMERegister from "../pages/auth/SMERegister";
import {
  PiBellRingingFill,
  PiChartLineUp,
  PiGridFour,
  PiHandshakeFill,
  PiMoneyWavyFill,
  PiRowsPlusTop,
} from "react-icons/pi";
import { logout } from "../redux/authSlice";
import { LuLogOut } from "react-icons/lu";
import Dashboard from "../pages/Dashboard";
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
import FundPurchases from "../pages/fund_purchase/FundPurchases";
import ViewPurchase from "../pages/fund_purchase/ViewPurchase";
import TradeInterests from "../pages/trade_interest/TradeInterests";
import CreateNotification from "../pages/CreateNotification";
import FundCategories from "../pages/fund_category/FundCategories";

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
      label: ctx.t?.("sidebar.dashboard"),
      title: ctx.t?.("titles.welcome_back", { name: ctx.user?.full_name || "Admin" }),
      subtitle: ctx.t?.("titles.dashboard_overview"),
      icon: RxDashboard,
      Component: Dashboard,
      showInSidebar: "top",
      isPrivate: inProdMode,
    },
    {
      path: "/investors",
      label: ctx.t?.("sidebar.investors"),
      icon: FaRegUser,
      Component: Investors,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.customers_mgmt"),
      subtitle: ctx.t?.("titles.customers_subtitle"),
      children: [
        {
          path: "/investors/create",
          label: ctx.t?.("actions.create_investor"),
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewInvestor,
          title: ctx.t?.("titles.add_customer"),
          subtitle: ctx.t?.("titles.add_customer_subtitle"),
        },
        {
          path: "/investors/:id",
          label: ctx.t?.("actions.view_investor"),
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewInvestor,
          title: ctx.t?.("titles.investor_details"),
          subtitle: ctx.t?.("titles.investor_details_subtitle"),
        },
      ],
    },
    {
      path: "/funds",
      label: ctx.t?.("sidebar.funds"),
      icon: PiChartLineUp,
      Component: Trades,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.funds_mgmt"),
      subtitle: ctx.t?.("titles.funds_subtitle"),
      children: [
        {
          path: "/funds/create",
          label: ctx.t?.("actions.create_fund"),
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewTrade,
          title: ctx.t?.("titles.add_fund"),
          subtitle: ctx.t?.("titles.add_fund_subtitle"),
        },
        {
          path: "/funds/:id",
          label: ctx.t?.("actions.view_fund"),
          icon: CgAdd,
          // showInSidebar: "top",
          Component: ViewTrade,
          title: ctx.t?.("titles.fund_details"),
          subtitle: ctx.t?.("titles.fund_details_subtitle"),
        },
      ],
    },
    {
      path: "/roi",
      label: ctx.t?.("sidebar.fund_performance"),
      icon: RiCoinsLine,
      Component: ROIOverview,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.roi_overview"),
      subtitle: ctx.t?.("titles.roi_subtitle"),
      children: [
        {
          path: "/roi/update",
          label: ctx.t?.("actions.view_update_roi"),
          icon: CgAdd,
          Component: ViewUpdateROI,
          title: ctx.t?.("titles.monthly_roi_input"),
          subtitle: ctx.t?.("titles.monthly_roi_subtitle"),
        },
      ],
    },
    {
      path: "/purchase",
      label: ctx.t?.("sidebar.fund_allocation"),
      icon: PiMoneyWavyFill,
      Component: FundPurchases,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.fund_allocation_title"),
      subtitle: ctx.t?.("titles.fund_allocation_subtitle"),
      children: [
        {
          path: "/purchase/create",
          label: ctx.t?.("actions.create_purchase"),
          icon: CgAdd,
          Component: ViewPurchase,
          title: ctx.t?.("titles.add_purchase"),
          subtitle: ctx.t?.("titles.add_fund_subtitle"),
        },
        {
          path: "/purchase/:id",
          label: ctx.t?.("actions.view_purchase"),
          icon: CgAdd,
          Component: ViewPurchase,
          title: ctx.t?.("titles.purchase_details"),
          subtitle: ctx.t?.("titles.purchase_details_subtitle"),
        },
      ],
    },
    {
      path: "/fund-interest",
      label: ctx.t?.("sidebar.fund_interest"),
      icon: PiHandshakeFill,
      Component: TradeInterests,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.interested_investors"),
      subtitle: ctx.t?.("titles.interested_investors_subtitle"),
      children: [
        {
          path: "/fund-interest/:id",
          label: ctx.t?.("actions.view_investor"),
          icon: CgAdd,
          title: ctx.t?.("titles.investor_details"),
          subtitle: ctx.t?.("titles.review_kyc"),
          Component: ViewInvestor,
          showBack: true,
        },
      ],
    },
    {
      path: "/leads",
      label: ctx.t?.("sidebar.leads"),
      icon: HiOutlineUserGroup,
      Component: Leads,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.leads_mgmt"),
      subtitle: ctx.t?.("titles.leads_subtitle"),
      children: [
        {
          path: "/leads/:id",
          label: ctx.t?.("actions.view_lead"),
          icon: CgAdd,
          title: ctx.t?.("titles.lead_details"),
          subtitle: ctx.t?.("titles.review_kyc"),
          Component: ViewLead,
          showBack: true,
        },
      ],
    },
    {
      path: "/fund-categories",
      label: ctx.t?.("sidebar.fund_categories"),
      icon: PiRowsPlusTop,
      Component: FundCategories,
      showInSidebar: "top",
      isPrivate: inProdMode,
      title: ctx.t?.("titles.fund_categories_title"),
      subtitle: ctx.t?.("titles.fund_categories_subtitle"),
    },
    {
      path: "/create-notification",
      Component: CreateNotification,
      isPrivate: inProdMode,
      title: ctx.t?.("titles.create_notification"),
      subtitle: ctx.t?.("titles.create_notification_subtitle"),
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
      label: ctx.t?.("sidebar.settings"),
      showInSidebar: "bottom",
    },
    {
      key: "logout",
      onClick: () => {
        ctx.dispatch?.(logouctx.t?.());
        ctx.navigate?.("/login");
      },
      icon: (props) => <LuLogOut {...props} className="text-danger" />,
      label: <span className="text-red-500">{ctx.t?.("sidebar.logout")}</span>,
      showInSidebar: "bottom",
    },
  ];
};
