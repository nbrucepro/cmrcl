'use client'

import React from "react";

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
      <span className="text-gray-700 font-medium">{text}</span>
    </div>
  );
};

export default Loader;
