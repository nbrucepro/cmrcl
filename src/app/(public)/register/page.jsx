"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    setError(""); // Clear previous error
    if(!name && !email){
        return;
    }
    try {
      await axios.post("https://cmrcl-server.onrender.com/api/admin/register", {
        name,
        email,
        password,
      });
      router.push("/adminlogin");
    } catch (err) {
      const message = err.response?.data?.error || "Registration failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-semibold mb-6 text-center text-blue-700">Register Admin</h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded mb-4 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <button
          onClick={handleRegister}
          className="bg-blue-600 w-full py-2.5 rounded-lg text-white font-medium hover:bg-blue-700 transition-all duration-200 cursor-pointer"
        >
          Register
        </button>

        <div className="mt-5 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/adminlogin"
              className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-all duration-200"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
