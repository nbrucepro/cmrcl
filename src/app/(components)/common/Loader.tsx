'use client'

import React from "react";
import {motion } from "framer-motion"

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex justify-center items-center py-10">
       <motion.div
        className="relative flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      >
        <div className="h-12 w-12 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400"></div>
        <div className="absolute h-8 w-8 rounded-full border-4 border-transparent border-t-blue-300 border-r-blue-200 blur-sm opacity-60"></div>
      </motion.div>

      {/* <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
      <span className="text-gray-700 font-medium">{text}</span> */}
    </div>
  );
};

export default Loader;
