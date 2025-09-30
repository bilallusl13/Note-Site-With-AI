"use client";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import Main from "../main/page";
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    toast.error("Email ve şifre gerekli");
    return;
  }
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    toast.success("Giriş başarılı!");
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.name); // username'i kaydet
    localStorage.setItem("id", data.id);
    localStorage.setItem("role", data.role || "user"); // role'u kaydet
    

    window.location.href = "/main";
  }
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
        <h2 className="text-white text-2xl font-semibold">Yükleniyor...</h2>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-white mb-1 font-medium">Email</label>
            <input
              name="email"
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white mb-1 font-medium">Şifre</label>
            <input
              name="password"
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Şifre"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-md hover:scale-105 transition-transform"
          >
            Giriş Yap
          </button>
        </form>
        <div className="flex flex-col items-center mt-6 space-y-2">
          <Link href="/updatepassword" className="text-sm text-blue-300 hover:underline">Şifreni mi unuttun?</Link>
          <span className="text-white text-sm">
            Hesabın yok mu?
            <Link href="/register" className="ml-1 text-purple-300 hover:underline">Kayıt Ol</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
