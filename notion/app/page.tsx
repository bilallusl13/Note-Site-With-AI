"use client";
import Link from "next/link";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Notion Clone
          </h1>
          <p className="text-xl text-purple-200 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Düşüncelerinizi organize edin, projelerinizi yönetin ve yaratıcılığınızı serbest bırakın
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-purple-200 text-sm">Notlar</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
              <span className="text-2xl">🚀</span>
            </div>
            <p className="text-purple-200 text-sm">Projeler</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-purple-200 text-sm">AI Yardımcı</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/login"
            className="group bg-white text-purple-700 font-semibold py-4 px-8 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:bg-gray-50 flex items-center justify-center gap-3 min-w-[160px]"
          >
            <span className="text-xl group-hover:animate-bounce">🔑</span>
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-3 min-w-[160px]"
          >
            <span className="text-xl group-hover:animate-bounce">🎉</span>
            Kayıt Ol
          </Link>
        </div>

        {/* Footer Text */}
        <div className="mt-16">
          <p className="text-purple-300/70 text-sm">
            Ücretsiz başlayın • Sınırsız not • AI desteği
          </p>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-50 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-60 animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default Welcome;
