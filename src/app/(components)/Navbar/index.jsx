"use client";

import { useAppDispatch, useAppSelector } from "@/app/(dashboard)/redux";
import { setIsDarkMode, setIsSidebarCollapsed, setSelectedMonth } from "@/state";
import { Bell, Menu, Moon, Settings, Sun, LogOut } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  
  const selectedMonth = useAppSelector((state) => state.global.selectedMonth);
  
  const pathname = usePathname();
  
  const isDashboard = pathname === "/inv/dashboard";

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const [user, setUser] = useState({ name: "Admin" }); // default fallback
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  
useEffect(() => {
  if (!selectedMonth?.month || !selectedMonth?.year) {
    dispatch(setSelectedMonth({
      month: dayjs().month() + 1,
      year: dayjs().year(),
    }));
  }
}, [dispatch, selectedMonth]);

    const handleMonthChange = (date) => {
    setSelectedDate(date);
    if (date) {
      dispatch(
        setSelectedMonth({
          month: date?.month() + 1, // month (1-12)
          year: date?.year(),
        })
      );
    }
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
        </div>
        {isDashboard && (
          <DatePicker
          picker="month"
          value={selectedDate}
          onChange={handleMonthChange}
          format="MMMM YYYY"
          allowClear={false}
          className="border rounded-md shadow-sm hover:shadow-md transition-all duration-150"
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
