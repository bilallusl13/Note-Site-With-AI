"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const noTurkishChars = /^[a-zA-Z0-9@._-]*$/;

  const isStrongPassword = (password: string) => {
    return password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStrongPassword(password)) {
      toast.error("Şifre en az 6 karakter, sayı ve harf içermeli.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Bir hata oluştu.");
        return;
      }

      toast.success("Kayıt başarılı!");

      // Formu sıfırla
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Sunucu hatası");
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{ backgroundImage: `url('/3.jpeg')` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full h-[32rem] max-w-lg hover:scale-105 transition-transform duration-300">
        <h2 className="text-2xl font-semibold mb-6 text-center bg-gray-100 rounded-xl py-2 hover:scale-105 transition-transform duration-300">
          Create An Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => {
              const value = e.target.value;
              if (noTurkishChars.test(value)) {
                setUsername(value);
              }
            }}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Yeni Şifre (Tekrar)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-semibold text-black bg-gradient-to-r from-green-300 to-cyan-300 hover:from-green-500 hover:to-green-700 transition-colors"
          >
            Kayıt Ol
          </button>

          <div className="mt-4 text-center hover:scale-105 transition-transform duration-300">
            <Link
              href="/login"
              className="text-black-600 font-semibold hover:text-blue-800 transition no-underline"
            >
              Zaten hesabın var mı?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
