"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import EventNoteIcon from "@mui/icons-material/EventNote";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import NoteDetailModal from "./NoteDetailModal";
import NotificationsModal from "./NotificationsModal";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { useNoteStore } from "@/store/useNoteStore";

type TypewriterProps = {
  text: string;
  speed?: number;
  gradientStart?: number;
  gradientEnd?: number;
};

const handleContent = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token bulunamadı");
      return;
    }
    const response = await fetch("/api/notes/allnotes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // JSON'u sadece bir kere oku:
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `Hata: ${response.status} ${response.statusText}`;
      throw new Error(errorMsg);
    }

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    // Eğer data boşsa boş dizi dönebiliriz
    return [];
  } catch (error: any) {
    console.error("Fetch error (handleContent):", error);
    toast.error(error.message || "Bilinmeyen hata");
    return [];
  }
};

const handleUpdate = async (id: string, newClassname: string) => {
  if (!newClassname || newClassname.trim() === "") {
    toast.error("Boş değer girilemez!");
    return false;
  }
  try {
    const response = await fetch("/api/updateclassname", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, classname: newClassname }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `Sunucu hatası: ${response.status}`;
      throw new Error(errorMsg);
    }

    toast.success("İşlem başarılı!");
    return true;
  } catch (error: any) {
    toast.error(error.message || "Beklenmeyen hata oluştu.");
    return false;
  }
};

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 200, gradientStart, gradientEnd }) => {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  let content: React.ReactNode[] = [];
  if (gradientStart !== undefined && gradientEnd !== undefined && displayed.length > gradientStart) {
    const before = displayed.slice(0, gradientStart);
    const gradient = displayed.slice(gradientStart, Math.min(gradientEnd, displayed.length));
    const after = displayed.slice(Math.min(gradientEnd, displayed.length));
    if (before) content.push(<span key="before">{before}</span>);
    if (gradient)
      content.push(
        <span key="gradient" className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          {gradient}
        </span>
      );
    if (after) content.push(<span key="after">{after}</span>);
  } else {
    content = [displayed];
  }

  return (
    <span className="font-mono text-2xl">
      {content}
      <span className={"ml-1 blink-cursor"} style={{ opacity: index < text.length ? 1 : 0 }}>
        |
      </span>
    </span>
  );
};

const Main = () => {
  const router = useRouter();
  const [username, setUsername] = useState("User");
  const [text, setText] = useState("Hello User, Good Afternoon");
  const [gradientStart, setGradientStart] = useState(6);
  const [gradientEnd, setGradientEnd] = useState(10);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
    const newText = `Hello ${storedUsername}, Good Afternoon`;
    setText(newText);
    const start = newText.indexOf(storedUsername);
    const end = start + storedUsername.length;
    setGradientStart(start);
    setGradientEnd(end);

    // 🎉 Karşılama efektleri
    const isFirstVisit = !localStorage.getItem("hasVisited");
    if (isFirstVisit) {
      localStorage.setItem("hasVisited", "true");
      setTimeout(() => setShowWelcomeModal(true), 1000);
      setTimeout(() => setShowMotivation(true), 3000);
    }

    // Her girişte konfeti göster
    setTimeout(() => setShowConfetti(true), 1500);

    // 💡 Günlük ipucu gösterimi
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % appTips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  const [data, setData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const aiResponses = useNoteStore(state => state.aiResponses);
  const approvedAI = useNoteStore(state => state.approvedAI);
  const setApprovedAI = useNoteStore(state => state.setApprovedAI);

  // 🎉 Yeni state'ler
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showTourModal, setShowTourModal] = useState(false);

  const motivationalQuotes = [
    "✨ Bugün harika notlar alabilirsin!",
    "🌟 Her not, geleceğin için bir adım!",
    "🚀 Fikirlerini kaydetmeye hazır mısın?",
    "💡 Yaratıcılığın bugün doruklarda!",
    "🎯 Hedeflerine odaklan, notlarını al!",
    "🌈 Her yeni not, yeni bir başlangıç!",
    "⭐ Sen harikasın, notların da öyle olacak!"
  ];

  const appTips = [
    "💡 İpucu: Ctrl+K ile hızlı arama yapabilirsin!",
    "🔍 İpucu: Sol menüden notlarına kolayca ulaşabilirsin!",
    "📝 İpucu: AI asistanını kullanarak notlarını geliştirebilirsin!",
    "🗂️ İpucu: Notlarını sınıflara göre organize edebilirsin!",
    "🔗 İpucu: Notlarını arkadaşlarınla paylaşabilirsin!"
  ];

  useEffect(() => {
    async function fetchData() {
      const result = await handleContent();
      if (result) setData(result);
    }
    fetchData();
  }, []);

  // 🎊 Confetti otomatik kapatma
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Onaylanmış AI cevabı geldiğinde ilgili notun içeriğine ekle
  useEffect(() => {
    if (!approvedAI) return;
    // Eğer modal açıksa, NoteDetailModal zaten ekleyecek, burada ekleme
    if (isModalOpen && selectedNoteId) return;
    // Doğru notu id ile bul
    const note = data.find(n => n.id === approvedAI.noteId);
    if (note) {
      handleAddAiResponseToNote(note, approvedAI.text);
    }
    setApprovedAI(null);
  }, [approvedAI]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/notes/deletenote", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Silme işlemi başarısız");
      }

      toast.success("Silme işlemi başarılı");
      setData((prev) => prev.filter((note) => note.id !== id));
    } catch (error: any) {
      console.log("hata")
    }
  };

  const startEditing = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditValue(currentValue || "");
  };

  const saveEdit = async (index: number) => {
    const note = data[index];
    const success = await handleUpdate(note.id, editValue);

    if (success) {
      setData((prevData) =>
        prevData.map((item, i) => (i === index ? { ...item, classname: editValue } : item))
      );
    }

    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      saveEdit(index);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const openNoteDetail = async (noteId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token bulunamadı");
      return;
    }
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Not detayı getirilemedi.";
        throw new Error(errorMsg);
      }

      setSelectedNoteId(noteId); // not açıldığında global store'a yaz
      setIsModalOpen(true);
      // İstersen not detayını state'e alabilirsin
    } catch (error: any) {
      console.error("Fetch error (openNoteDetail):", error);
      toast.error(error.message || "Not detayı yüklenirken bir hata oluştu.");
    }
  };

  const closeNoteDetail = () => {
    setIsModalOpen(false);
    setSelectedNoteId(null); // modal kapanınca sıfırla
    setSelectedNoteId(null);
  };

  // AI cevabını notun içeriğine ekle ve güncelle
  const handleAddAiResponseToNote = async (note: any, aiText: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token bulunamadı");
        return;
      }
      const response = await fetch(`/api/notes/updatenote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: note.id,
          header: note.header,
          isPublic: note.isPublic,
          text: (note.text || "") + "\n" + aiText,
        }),
      });
      if (!response.ok) {
        let errorMsg = "AI cevabı eklenemedi.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const updatedNote = await response.json();
      setData(prevData => prevData.map(n => n.id === note.id ? { ...n, text: updatedNote.text } : n));
      toast.success("AI cevabı notunuza eklendi!");
    } catch (error: any) {
      toast.error(error.message || "AI cevabı eklenirken hata oluştu.");
    }
  };

  return (
    <>
      {/* 🎊 Confetti Efekti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                transform: `translateY(${Math.random() * 100}vh)`,
              }}
            >
              {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* 🎉 Karşılama Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl shadow-2xl text-white text-center max-w-md mx-4 animate-pulse">
            <CelebrationIcon style={{ fontSize: 60, marginBottom: 16 }} />
            <h2 className="text-3xl font-bold mb-4">🎉 Hoş Geldin {username}! 🎉</h2>
            <p className="text-lg mb-6">Not defterine başarıyla giriş yaptın!</p>
            <button
              onClick={() => {
                setShowWelcomeModal(false);
                setShowTourModal(true);
              }}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mr-4"
            >
              Uygulamayı Keşfet! 🚀
            </button>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
            >
              Atla
            </button>
          </div>
        </div>
      )}

      {/* 🗺️ Uygulama Turu Modal */}
      {showTourModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Hızlı Tur</h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <span>Sol menüden notlarına ve araçlara ulaşabilirsin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <span>&quot;Yeni Not&quot; butonuyla hızlıca not oluşturabilirsin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <span>AI asistanından yardım alabilirsin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <span>Notlarını organize etmek için sınıf ekleyebilirsin</span>
              </div>
            </div>
            <button
              onClick={() => setShowTourModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Anladım, Başlayalım! 🎯
            </button>
          </div>
        </div>
      )}

      <div>
        <NoteDetailModal noteId={selectedNoteId} isOpen={isModalOpen} onClose={closeNoteDetail} />
        <NotificationsModal open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        
        {/* 🌟 Motivasyon Mesajı */}
        {showMotivation && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full shadow-2xl z-1000 animate-bounce">
            <div className="flex items-center gap-2">
              <CelebrationIcon style={{ fontSize: 24 }} />
              <span className="font-semibold">{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</span>
              <button
                onClick={() => setShowMotivation(false)}
                className="ml-2 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Yeni Not Ekleme Butonu - Sol tarafa taşındı */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Yeni not butonuna tıklandı");
            window.location.href = "/newnote";
          }}
          className="fixed bottom-8 left-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 z-1000 animate-pulse"
          title="Yeni Not Ekle"
        >
          <AddIcon style={{ fontSize: 28 }} />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            +
          </div>
        </button>
        
        {/* Container genişliği artırıldı ve overflow eklendi */}
        <div className="w-full max-w-[1400px] mx-auto text-white flex flex-col items-center overflow-hidden pr-8">
          <img src="2.jpg" alt="header photo" className="w-full h-[200px] object-cover" />

          <div className="mt-[50px]">
            <Typewriter text={text} speed={200} gradientStart={gradientStart} gradientEnd={gradientEnd} />
          </div>
          <div className="mt-20 w-full px-10">
            <div className="flex items-center justify-between mb-4 gap-4">
              <p className="text-6xl text-gray-600 flex-shrink-0">
                <EventNoteIcon className="w-5 h-5" style={{ fontSize: "4.25rem" }} /> Class Notes
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Büyük yeni not butonuna tıklandı");
                  window.location.href = "/newnote";
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-2xl px-6 py-3 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2 font-bold text-base relative overflow-hidden group flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <AddIcon style={{ fontSize: 20 }} className="relative z-10" />
                <span className="relative z-10">✨ Yeni Not</span>
                <div className="relative z-10 bg-white/20 rounded-full p-1">
                  <span className="text-xs">🚀</span>
                </div>
              </button>
            </div>
            <p className="mb-2">
              Bu bölümde, kullanıcıların not ekleyebilmesi için tasarlanmış alan yer almaktadır. Buraya metin,
              açıklama ya veya önemli bilgiler girilebilir.
            </p>
            <p>
              Notlar, içerik üzerinde daha sonra kolay erişim ve düzenleme imkanı sağlamak amacıyla tutulur. Kullanıcılar
              diledikleri zaman bu alanları güncelleyebilir veya silebilir.
            </p>

            {/* Table container overflow eklendi */}
            <div className="overflow-x-auto">
              <table className="border-collapse border border-gray-300 w-full mt-10 text-white min-w-[1200px]">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-6 py-2 text-left w-1/3 min-w-[350px]">
                      <span className="font-sans text-sm mr-2">Aa</span>Name
                    </th>
                    <th className="border border-gray-300 px-6 py-2 text-left w-1/6 min-w-[150px]">
                      <span className="mr-2">
                        <WatchLaterIcon />
                      </span>
                      Created
                    </th>
                    <th className="border border-gray-300 px-6 py-2 text-left w-1/6 min-w-[150px]">
                      <span className="mr-2">
                        <ArrowDownwardIcon />
                      </span>
                      Class
                    </th>
                    <th className="border border-gray-300 px-6 py-2 text-left w-1/3 min-w-[300px]">
                      <span className="mr-2">
                        <AltRouteIcon />
                      </span>
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-8">
                        Not bulunamadı
                      </td>
                    </tr>
                  ) : (
                    data.slice(0, 10).map((note: any, index: number) => (
                      <tr 
                        key={note.id || index}
                        className="group hover:bg-gray-50/10 transition-colors duration-200"
                      >
                        {/* Name Column - Genişlik ve buton optimizasyonu */}
                        <td className="relative border border-gray-300 px-6 py-3 group-hover:bg-gray-100/5 min-w-[350px]">
                          <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 font-semibold text-gray-800 dark:text-gray-200 pr-40">
                            {note.header || ""}
                          </div>
                          
                          {/* Optimized Hover Buttons - İkonlar ve küçük boyutlar */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-20">
                            <button
                              className="rounded-full w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-lg flex items-center justify-center"
                              onClick={() => openNoteDetail(note.id)}
                              title="Notu Aç"
                            >
                              👁️
                            </button>
                            <button
                              className="rounded-full w-8 h-8 bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg flex items-center justify-center"
                              onClick={() => handleDelete(note.id)}
                              title="Notu Sil"
                            >
                              🗑️
                            </button>
                            <button
                              className="rounded-full w-8 h-8 bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors shadow-lg flex items-center justify-center"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Paylaş butonuna tıklandı, note id:", note.id);
                                window.location.href = `/share?id=${note.id}`;
                              }}
                              title="Notu Paylaş"
                            >
                              🔗
                            </button>
                          </div>
                        </td>

                        {/* Created Date Column */}
                        <td className="border border-gray-300 px-6 py-3 min-w-[150px]">
                          <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString("tr-TR") : ""}
                          </div>
                        </td>

                        {/* Class Column */}
                        <td className="relative border border-gray-300 px-6 py-3 min-w-[150px]">
                          {editingIndex === index ? (
                            <div className="flex items-center gap-2 z-30">
                              <input
                                className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex-1"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, index)}
                                autoFocus
                              />
                              <button
                                className="rounded-lg px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors shadow-lg"
                                onClick={() => saveEdit(index)}
                              >
                                ✓
                              </button>
                              <button
                                className="rounded-lg px-2 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium transition-colors shadow-lg"
                                onClick={cancelEdit}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-full bg-purple-100 dark:bg-purple-900 rounded-lg px-3 py-2 text-purple-800 dark:text-purple-200 pr-12">
                                {note.classname || "-"}
                              </div>
                              
                              {/* Edit Button for Class Column - İkon button */}
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                <button
                                  className="rounded-full w-7 h-7 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors shadow-lg flex items-center justify-center"
                                  onClick={() => startEditing(index, note.classname || "")}
                                  title="Sınıf Düzenle"
                                >
                                  ✏️
                                </button>
                              </div>
                            </>
                          )}
                        </td>

                        {/* Others Column */}
                        <td className="border border-gray-300 px-6 py-3 min-w-[300px]">
                          <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200">
                            {note.text ? (note.text.length > 50 ? note.text.substring(0, 50) + "..." : note.text) : "İçerik yok"}
                          </div>
                          
                          {/* AI Response Buttons */}
                          {Array.isArray(aiResponses) && aiResponses.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {aiResponses.map((ai: any) => (
                                <button
                                  key={ai.id}
                                  className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-xs text-white font-medium transition-colors shadow-sm"
                                  onClick={() => handleAddAiResponseToNote(note, ai.text)}
                                >
                                  AI Cevabını Ekle
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;