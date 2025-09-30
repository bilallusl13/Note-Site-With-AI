"use client"
import React, { useEffect, useState } from "react";

interface TrashItem {
  id: string;
  noteId: string | null;
  eventId: string | null;
  noteHeader: string | null;
  eventTitle: string | null;
  deletedAt: string;
}

const TrashPage = () => {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePermanentDelete = async (trashId: string) => {
    if (!confirm("Bu öğeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      const res = await fetch("/api/trash/permanent-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trashId }),
      });

      if (res.ok) {
        // Remove item from state
        setItems(items.filter(item => item.id !== trashId));
        alert("Öğe kalıcı olarak silindi");
      } else {
        const error = await res.json();
        alert("Hata: " + (error.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Error permanently deleting:", error);
      alert("Silme işlemi başarısız");
    }
  };

  useEffect(() => {
    async function fetchTrash() {
      try {
        const res = await fetch("/api/trash/all");
        const data = await res.json();
        console.log("TRASH RESPONSE:", data);
        if (data.success && data.data) {
          setItems(data.data);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("Error fetching trash:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrash();
  }, []);
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 ml-40">
      <h1 className="text-2xl font-bold mb-6">Çöp Kutusu</h1>
      {/* İlk trash kaydının detayları */}
      {items && Array.isArray(items) && items.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div><b>Toplam Silinen Öğe:</b> {items.length}</div>
          <div><b>Son Silinen:</b> {items[0].noteHeader || items[0].eventTitle || 'Bilinmeyen'}</div>
        </div>
      )}
      {loading ? (
        <div>Yükleniyor...</div>
      ) : !Array.isArray(items) || items.length === 0 ? (
        <div>Çöp kutusu boş.</div>
      ) : (
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="p-3 text-left">Tip</th>
              <th className="p-3 text-left">Başlık</th>
              <th className="p-3 text-left">Silinme Tarihi</th>
              <th className="p-3 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: TrashItem) => (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="p-3">{item.noteId ? "Not" : "Event"}</td>
                <td className="p-3">{item.noteHeader || item.eventTitle || "-"}</td>
                <td className="p-3">{new Date(item.deletedAt).toLocaleString("tr-TR")}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Kalıcı Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrashPage; 