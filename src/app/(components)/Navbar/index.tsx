"use client";

import { useAppDispatch, useAppSelector } from "@/app/(dashboard)/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Settings, Sun, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [user, setUser] = useState({ name: "Admin" }); // default fallback
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef: any = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle sidebar and dark mode
  const toggleSidebar = () =>
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkMode = () => dispatch(setIsDarkMode(!isDarkMode));

  // Get user info from token/localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("adminName");
    if (storedName) {
      setUser({ name: storedName });
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    document.cookie = "adminToken=; path=/; max-age=0;"; // clear cookie
    router.push("/adminlogin");
  };

  return (
    <div className="flex justify-between items-center w-full mb-3">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className=" md:flex justify-between items-center gap-5">
          {/* Dark mode toggle */}
          {/* <button onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Sun className="cursor-pointer text-gray-500" size={24} />
            ) : (
              <Moon className="cursor-pointer text-gray-500" size={24} />
            )}
          </button> */}

          {/* Notification */}
          {/* <div className="relative">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div> */}

          {/* <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" /> */}

          {/* USER INFO */}
          <div className="relative items-center gap-3 cursor-pointer" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 focus:outline-none cursor-pointer"
            >
              <Image
                src="https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/avatar-icon.svg"
                alt="Profile"
                width={45}
                height={45}
                className="rounded-full h-full object-cover"
                unoptimized
              />
              <span className="font-semibold">{user.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
