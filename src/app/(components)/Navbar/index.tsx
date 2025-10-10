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
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden">
          <input
            type="search"
            placeholder="Start typing to search groups & products"
            className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bell className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
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

          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />

          {/* USER INFO */}
          <div className="relative flex items-center gap-3 cursor-pointer" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
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

            {dropdownOpen && (
              <div className="absolute flex flex-col top-14 right-0 bg-white shadow-lg rounded-xl p-3 w-44 z-50">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={18} className="text-gray-600" /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <Link href="/inv/settings">
          <Settings
            className="cursor-pointer text-gray-500 md:hidden"
            size={24}
          />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
