"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import toast from "react-hot-toast";

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

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-6 bg-gray-900 text-white">
        <h2 className="text-xl font-bold mb-4">Bildirimler</h2>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : notifications.length === 0 ? (
          <div>Hiç bildirimin yok.</div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className={`p-3 rounded ${n.isRead ? "bg-gray-700" : "bg-blue-700"}`}>
                <div className="flex justify-between items-center">
                  <span>{n.message}</span>
                  {!n.isRead && (
                    <button
                      className="ml-4 px-2 py-1 bg-green-500 rounded text-xs"
                      onClick={() => markAsRead(n.id)}
                    >
                      Okundu
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</div>
              </li>
            ))}
          </ul>
        )}
        <button className="mt-6 w-full bg-red-500 py-2 rounded" onClick={onClose}>Kapat</button>
      </div>
    </Dialog>
  );
};

export default NotificationsModal; 