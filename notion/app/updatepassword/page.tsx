"use client"
import React, { useState } from "react";

const PasswordChangeForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Lütfen email giriniz.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    // Burada API isteği yapabilirsin
    try {
      const res = await fetch("/api/updatepassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      if (res.ok) {
        setSuccess("Şifre başarıyla değiştirildi.");
        setEmail("");
        setNewPassword("");
        setNewPasswordConfirm("");
      } else {
        const data = await res.json();
        setError(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200">
        <h2 className="text-3xl mb-6 font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text drop-shadow">Şifre Değiştir</h2>

        {error && <div className="mb-4 text-red-600 text-center font-medium animate-pulse">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center font-medium animate-pulse">{success}</div>}

        <div className="mb-5">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          required
        />
      </div>

        <div className="mb-5">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="newPassword">Yeni Şifre</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
          minLength={6}
          required
        />
      </div>

        <div className="mb-8">
          <label className="block mb-1 font-semibold text-gray-700" htmlFor="newPasswordConfirm">Yeni Şifre (Tekrar)</label>
        <input
          id="newPasswordConfirm"
          type="password"
          value={newPasswordConfirm}
          onChange={e => setNewPasswordConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          minLength={6}
          required
        />
      </div>

      <button
        type="submit"
          className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg transition-all text-lg tracking-wide"
      >
        Şifreyi Güncelle
      </button>
        <a
          href="/login"
          className="mt-6 block w-full text-center py-3 rounded-lg font-bold text-white bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 hover:from-green-500 hover:via-blue-500 hover:to-purple-600 shadow-md transition-all text-lg tracking-wide cursor-pointer"
        >
          Girişe Dön
        </a>
    </form>
    </div>
  );
};

export default PasswordChangeForm;
