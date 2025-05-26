"use client";

import React , {useState} from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';

const Login:React.FC = () => {
    const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

   const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (id === "admin" && password === "123@admin") {
         sessionStorage.setItem("userId", id);
        router.push("/dashboard"); // redirect to main page
      } else {
        setError("Invalid ID or password");
        setLoading(false);
      }
    }, 1500); // simulate delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8">
        {/* Logo + Title */}
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/images/logo/logo-icon.svg"
            alt="MPPC Logo"
            width={50}
            height={50}
          />
          <h1 className="ml-3 text-2xl font-bold text-[#184e93]">VMCCP Login</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#184e93] focus:border-[#184e93]"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#184e93] focus:border-[#184e93]"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span></span>
            <a href="#" className="text-[#184e93] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;