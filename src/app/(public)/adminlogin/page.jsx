"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async () => {
    setError("");
    if(!email && !password){
      return;
    }
    setLoading(true); 
    try {
      const res = await axios.post(
        `${API_URL}api/admin/login`,
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("adminName", res.data.admin?.name || "Admin");
      document.cookie = `adminToken=${res.data.token}; path=/; max-age=3600;`;
      setLoading(false);
      router.push("/inv/dashboard");
    } catch (err) {
      setLoading(false);
      const message = "Login failed. Please check your credentials.";
      setError(message);
    }
    // setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/inv/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-gray-700">
      <div className="bg-white p-8 rounded-2xl shadow-lg  w-md transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-semibold mb-6 text-center text-blue-700">
          Admin Login
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded mb-4 text-sm animate-fadeIn">
            {error}
          </div>
        )}
      <form
  onSubmit={(e) => {
    e.preventDefault(); 
    handleLogin();
  }}
>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* Password Field with Toggle */}
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={22} />
            ) : (
              <AiOutlineEye size={22} />
            )}
          </button>
        </div>
        
  <button
    type="submit" // <-- important for Enter key
    disabled={loading} 
    className={`w-full py-2.5 rounded-lg text-white font-medium transition-all duration-200 cursor-pointer ${
      loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    {loading ? "Logging in..." : "Login"}
  </button>
  </form>
        {/* <button
          onClick={handleLogin}
          disabled={loading} 
          className={`w-full py-2.5 rounded-lg text-white font-medium transition-all duration-200 cursor-pointer ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          >
          {loading ? "Logging in..." : "Login"}
        </button> */}

        <div className="mt-5 text-center hidden">
          <p className="text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-all duration-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
