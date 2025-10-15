"use client";

import { useAppDispatch, useAppSelector } from "@/app/(dashboard)/redux";
import { setIsSidebarCollapsed } from "@/state";
import { Logout } from "@mui/icons-material";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  LucideIcon,
  Menu,
  LayoutDashboard,
  Boxes,
  Package,
  ShoppingCart,
  Receipt,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface SidebarLinkProps {
  href?: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  children?: React.ReactNode;
  isChild?: boolean;
  openKey?: string;
  activeParent?: string | null;
  setActiveParent?: (key: string | null) => void;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  children,
  isChild,
  openKey,
  activeParent,
  setActiveParent
}: SidebarLinkProps) => {
  const pathname = usePathname();
  
  const isActive =
    href && (pathname === href || (pathname === "/" && href === "/inv/dashboard"));

  const hasChildren = !!children;
  const isOpen = activeParent === openKey;

  const handleClick = () => {
    if (hasChildren && setActiveParent && openKey) {
      setActiveParent(isOpen ? null : openKey);
    }
  };

  return (
    <div>
      {href ? (
        <Link href={href}>
          <div
            className={`cursor-pointer flex items-center ${
              isCollapsed
                ? "justify-center py-4"
                : "justify-between px-8 py-[12px]"
            }  ${isChild ? "pl-12" : ""}
            hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
              isActive ? "bg-blue-200 text-white" : ""
            }`}
          >
            <div className={`flex items-center gap-3 ${hasChildren && "pl-12"}}`}>
              <Icon className="w-6 h-6 !text-gray-700" />
              <span
                className={`${
                  isCollapsed ? "hidden" : "block"
                } text-sm font-medium text-gray-700`}
              >
                {label}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div
          onClick={handleClick}
          className={`cursor-pointer flex items-center ${
            isCollapsed
              ? "justify-center py-4"
              : "justify-between px-8 py-[12px]"
          }
          hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 !text-gray-700" />
            <span
              className={`${
                isCollapsed ? "hidden" : "block"
              } font-medium text-gray-700`}
            >
              {label}
            </span>
          </div>

          {/* Chevron Indicator */}
          {!isCollapsed && hasChildren && (
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      )}

      {/* Render children when open */}
      {!isCollapsed && isOpen && children && (
      <div className="flex flex-col gap-1 w-full">
       {React.Children.map(children, (child) =>
        React.isValidElement<SidebarLinkProps>(child)
          ? React.cloneElement(child, { isChild: true } as Partial<SidebarLinkProps>)
          : child
      )}

      </div>
    )}
    </div>
  );
};

const Sidebar = () => {
  const dispatch:any = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    document.cookie = "adminToken=; path=/; max-age=0;";
    router.push("/adminlogin");
  };
    React.useEffect(() => {
      const mediaQuery = window.matchMedia("(max-width: 1020px)");
  
      dispatch(setIsSidebarCollapsed(mediaQuery.matches));
  
      const handleResize = (e: MediaQueryListEvent) => {
        dispatch(setIsSidebarCollapsed(e.matches));
      };
  
      mediaQuery.addEventListener("change", handleResize);
  
      return () => mediaQuery.removeEventListener("change", handleResize);
    }, [dispatch]);
  
  
  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <Image
          src="https://cdn-icons-png.flaticon.com/512/2211/2211640.png"
          alt="logo"
          width={27}
          height={27}
          className="rounded w-8"
        />
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-xl`}
        >
          Dreamdoor
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8">
        <SidebarLink
          href="/inv/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        {/* <SidebarLink
         icon={Boxes}
         label="Inventory"
         isCollapsed={isSidebarCollapsed}
         openKey="inventory"
         activeParent={activeParent}
         setActiveParent={setActiveParent}
         >
          </SidebarLink> */}
          {/* <SidebarLink
            href="/inv/inventory"
            icon={Package}
            label="All Logs"
            isCollapsed={isSidebarCollapsed}
            isChild={true}
          /> */}
          <SidebarLink
            href="/inv/inventory/purchases"
            icon={ShoppingCart}
            label="Purchases"
            isCollapsed={isSidebarCollapsed}
            // isChild={true}
          />
          <SidebarLink
            href="/inv/inventory/sales"
            icon={Receipt}
            label="Sales"
            isCollapsed={isSidebarCollapsed}
            // isChild={true}
          />
            {/* <SidebarLink
            href="/inv/finance/payable"
            icon={ArrowDownCircle}
            label="Payables"
            isCollapsed={isSidebarCollapsed}
          /> */}
          <SidebarLink
            href="/inv/finance/receivable"
            icon={ArrowUpCircle}
            label="Receivables"
            isCollapsed={isSidebarCollapsed}
          />
        <SidebarLink
          href="/inv/products"
          icon={Package}
          label="Products"
          isCollapsed={isSidebarCollapsed}
        />
        {/* <SidebarLink
          href="/inv/profit-loss"
          icon={BarChart3}
          label="Profits & loss"
          isCollapsed={isSidebarCollapsed}
        /> */}
        
        {/* Finance Group */}
        {/* <SidebarLink
          icon={Wallet}
          label="Finance"
          isCollapsed={isSidebarCollapsed}
          openKey="finance"
          activeParent={activeParent}
          setActiveParent={setActiveParent}
        >
        </SidebarLink> */}
        {/* <SidebarLink
          href="/inv/categories"
          icon={Tags}
          label="Categories"
          isCollapsed={isSidebarCollapsed}
        /> */}
        {/* <SidebarLink
          href="/inv/users"
          icon={User}
          label="Users"
          isCollapsed={isSidebarCollapsed}
        /> */}
        {/* <SidebarLink
          href="/inv/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        /> */}
        {/* <SidebarLink
          href="/inv/expenses"
          icon={CircleDollarSign}
          label="Expenses"
          isCollapsed={isSidebarCollapsed}
        /> */}
      </div>

      {/* FOOTER */}
      {/* LOGOUT BUTTON */}
<div className={` mb-5 border-t border-gray-200 `}>
  <button
    onClick={handleLogout}
    className={`${isSidebarCollapsed ? "px-4" : "px-6"}"flex cursor-pointer items-start gap-3 w-full text-red-600 hover:bg-gray-100  py-2 rounded-md transition"`}
  >
    <Logout className="w-5 h-5" />
    <span className={`${isSidebarCollapsed ? "hidden" : "block"} text-sm font-medium`}>Logout</span>
  </button>
</div>

    </div>
  );
};

export default Sidebar;
