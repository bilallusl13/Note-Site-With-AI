"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  userId: string;
  senderId: string;
  noteId?: string;
  commentId?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      } catch (err) {
        toast.error("Bildirimler alınamadı");
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/markread`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Okundu olarak işaretlenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col items-center py-10">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🔔 Bildirimler
          </h2>
          <button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            onClick={() => router.back()}
          >
            ← Geri Dön
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Bildirimler yükleniyor...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-white/70">Henüz bildirimin yok</p>
              <p className="text-sm text-white/50 mt-2">Notlarını beğenenler ve yorum yapanlar burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n, index) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-all duration-300 hover:transform hover:scale-[1.02] ${
                    n.isRead 
                      ? "bg-gray-800/50 border-gray-600/30 text-white/70" 
                      : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30 text-white shadow-lg"
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${n.type === 'like' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                        {n.type === 'like' ? '❤️' : '💬'}
                      </div>
                      <div>
                        <p className="font-medium">{n.message}</p>
                        <div className="text-xs text-white/50 mt-2 flex items-center gap-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          {new Date(n.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        className="ml-4 px-3 py-1 bg-green-500 hover:bg-green-600 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        onClick={() => markAsRead(n.id)}
                      >
                        ✓ Okundu
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 