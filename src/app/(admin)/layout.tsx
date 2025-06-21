"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";

import Backdrop from "@/layout/Backdrop";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "lg:ml-0 w-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-0";

  if (isLoginPage) {
    return <>{children}</>; // just render the login content
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
       
     
        <AppHeader />
        <div className="p-4 mx-auto max-w-[--breakpoint-2xl] md:p-6">{children}</div>
      
    </div>
  );
}