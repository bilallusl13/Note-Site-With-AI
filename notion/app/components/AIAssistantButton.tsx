"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNoteStore } from "@/store/useNoteStore";
// İkonlar (BotIcon, CloseIcon, SendIcon) aynen kalabilir

const BotIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const CloseIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const SendIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13" />
  </svg>
);

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ id: number; text: string; isUser: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<string[]>([]);
  const [recomments, setRecomments] = useState<string[]>([]);
  const [hasNewResponse, setHasNewResponse] = useState(false); // Yeni cevap geldi mi?
  const setAiResponse = useNoteStore(state => state.setAiResponse);
  const setApprovedAI = useNoteStore(state => state.setApprovedAI); // yeni: onaylanmış AI cevabı
  const selectedNoteId = useNoteStore(state => state.selectedNoteId);
  const [pendingAI, setPendingAI] = useState<any>(null); // yeni: onay bekleyen AI cevabı
  // Burada önemli olan, mesajı parametre olarak almak
  const handleSaveUserMessage = async (msg: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token bulunamadı");
        return;
      }
      const response = await fetch("/api/aiserver/getmessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg }),
      });

      if (!response.ok) {
        toast.error("Mesaj DB'ye kaydedilemedi");
      }
    } catch (error) {
      toast.error(`DB hatası: ${error}`);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message; // mesajı burada yakala
    const userMessage = { id: Date.now(), text: currentMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setMessage(""); // input temizleme burada, async işlemlerden önce olabilir.

    try {
      // Mesajı DB'ye kaydet (mesaj parametre olarak geçiliyor)
      await handleSaveUserMessage(currentMessage);

      // AI'a mesaj gönder
      const response = await fetch("/api/aiserver/submitmessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        toast.error("Sunucudan cevap alınamadı");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // API dönüş yapısı doğru mu diye kontrol etmeliyiz
      const aiText =
        data?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Cevap alınamadı";

      const aiMessage = {
        id: Date.now() + 1,
        text: aiText,
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
       setAiResponse(aiMessage);
      setPendingAI(aiMessage); // yeni: onay bekleyen AI cevabı
      setHasNewResponse(true); // Yeni cevap geldi!
      
      // 3 saniye sonra yeni cevap efektini kapat
      setTimeout(() => setHasNewResponse(false), 3000);
      
    
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Mesajları çek ve allMessages'a ata
  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Token bulunamadı");
          return;
        }

        const response = await fetch("/api/aiserver/getallmessages", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          toast.error("Mesajlar alınamadı");
          return;
        }

        const resData = await response.json();

        // Burada API yanıtındaki doğru alanı kullanalım: 'message'
        const messageList = resData.data.map((m: any) => m.message);
        setAllMessages(messageList);
        console.log("Tüm mesajlar yüklendi:", messageList);
      } catch (error) {
        toast.error("Mesajlar yüklenirken hata oluştu");
      }
    };
    getAllMessages();
  }, []);

  // Enter ile gönderme (Shift+Enter yeni satır)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Öneriler için API çağrısı (isteğe bağlı)
  const handleGetRecommends = async () => {
    try {
      console.log("all messages", allMessages);
      const response = await fetch("http://127.0.0.1:8000/recommender/analyze/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
        }),
      });

      if (!response.ok) {
        toast.error("Sunucu hatası");
        return;
      }

      const data = await response.json();
      console.log("Öneriler:", data.öneriler[0].konu);
      const recommentList = data.öneriler.map((m: any) => m.konu);
      setRecomments(recommentList);

    } catch (error) {
      toast.error(`Hata: ${error}`);
    }
  };

  useEffect(() => {
    if (allMessages.length > 0) {
      handleGetRecommends();
    }
  }, [allMessages]); // sadece allMessages güncellendiğinde çalışır

  useEffect(() => {
    console.log("Recomments güncellendi:", recomments);
  }, [recomments]);

  // Öneri seçme fonksiyonu
  const handleRecommendClick = (recommend: string) => {
    setMessage(recommend);
  };

  // Yeni not oluşturma fonksiyonu
  const createNewNoteWithAI = async (aiText: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token bulunamadı");
        return;
      }
      // JWT'den userId'yi decode et
      let userId: string | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch {
        toast.error("Kullanıcı kimliği alınamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      if (!userId) {
        toast.error("Kullanıcı kimliği alınamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      const response = await fetch("/api/notes/savenote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          header: "AI Destekli Not",
          content: aiText,
          isPublic: false,
          classname: "Genel",
          userId: userId
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Not oluşturulamadı");
      }
      const newNote = await response.json();
      toast.success("Yeni not AI cevabıyla oluşturuldu!");
      return newNote;
    } catch (error: any) {
      console.error("Note creation error:", error);
      toast.error(error.message || "Not oluşturulurken hata oluştu");
      return null;
    }
  };

  return (
    <>
      {/* Chat Penceresi */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md h-96 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-900 rounded-2xl shadow-2xl border border-indigo-300 dark:border-indigo-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-t-2xl shadow">
            <div className="flex items-center gap-2">
              <BotIcon className="h-5 w-5" />
              <span className="font-semibold">AI Asistan</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Öneriler Bölümü */}
          {recomments.length > 0 && (
            <div className="p-3 border-b border-indigo-100 dark:border-indigo-700 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900 rounded-b-xl">
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Önerilen Konular</h4>
              <div className="flex flex-wrap gap-1">
                {recomments.map((recommend: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleRecommendClick(recommend)}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full transition-colors duration-200 border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    {recommend}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mesajlar */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-900 rounded-b-xl">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className="relative group">
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.isUser ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}
                  >
                    {msg.text}
                    {/* AI cevabı ise ve onay bekliyorsa ✓✕ butonları göster */}
                    {!msg.isUser && pendingAI && pendingAI.id === msg.id && (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="text-green-600 hover:text-green-800 font-bold text-sm px-2 py-1 bg-green-100 dark:bg-green-900 rounded transition-colors"
                          title="Onayla"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!selectedNoteId) {
                              // Yeni not oluştur
                              const newNote = await createNewNoteWithAI(pendingAI.text);
                              if (newNote) {
                                setPendingAI(null);
                                toast.success("AI cevabı yeni not olarak kaydedildi!");
                              }
                            } else {
                              // Mevcut nota ekle
                              setApprovedAI({ ...pendingAI, noteId: selectedNoteId });
                              setPendingAI(null);
                              toast.success("AI cevabı mevcut nota eklendi!");
                            }
                          }}
                        >
                          ✓ Onayla
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 font-bold text-sm px-2 py-1 bg-red-100 dark:bg-red-900 rounded transition-colors"
                          title="Reddet"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPendingAI(null);
                            toast("AI cevabı reddedildi.");
                          }}
                        >
                          ✕ Reddet
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Mesaj silme butonu - tüm mesajlar için */}
                  <button
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Mesajı Sil"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMessages(prev => prev.filter(m => m.id !== msg.id));
                      if (pendingAI && pendingAI.id === msg.id) {
                        setPendingAI(null);
                      }
                      toast.success("Mesaj silindi");
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mesajları temizle butonu */}
            {messages.length > 0 && (
              <div className="flex justify-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="text-xs text-gray-500 hover:text-red-500 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMessages([]);
                    setPendingAI(null);
                    toast.success("Tüm mesajlar temizlendi");
                  }}
                >
                  🗑️ Tüm Mesajları Temizle
                </button>
              </div>
            )}
          </div>

          {/* Mesaj Gönderme */}
          <div className="p-4 border-t border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-900 rounded-b-xl">
            <div className="flex items-center gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="flex-1 p-2 border border-indigo-300 dark:border-indigo-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 border-4 border-white ${
          hasNewResponse ? 'animate-pulse bg-gradient-to-br from-green-500 to-emerald-600' : ''
        }`}
        aria-label="AI Assistant"
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className={`absolute inset-0 transition-all duration-500 ${isLoading ? 'animate-spin' : 'scale-100'}`}>
            {/* Yıldız 1 */}
            <span
              className="absolute text-2xl transition-all duration-300"
              style={{
                left: '50%',
                top: '50%',
                transform: isLoading
                  ? 'translate(-50%, -50%) translateY(-20px) scale(0.8)'
                  : 'translate(-50%, -50%)',
                color: '#fbbf24'
              }}
            >⭐</span>
            {/* Yıldız 2 */}
            <span
              className="absolute text-2xl transition-all duration-300"
              style={{
                left: '50%',
                top: '50%',
                transform: isLoading
                  ? 'translate(-50%, -50%) rotate(120deg) translateY(-20px) rotate(-120deg) scale(0.8)'
                  : 'translate(-50%, -50%)',
                color: '#f59e0b'
              }}
            >⭐</span>
            {/* Yıldız 3 */}
            <span
              className="absolute text-2xl transition-all duration-300"
              style={{
                left: '50%',
                top: '50%',
                transform: isLoading
                  ? 'translate(-50%, -50%) rotate(240deg) translateY(-20px) rotate(-240deg) scale(0.8)'
                  : 'translate(-50%, -50%)',
                color: '#d97706'
              }}
            >⭐</span>
          </div>
        </div>
        
        {/* Yeni cevap geldiğinde çember efekti */}
        {hasNewResponse && (
          <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-75"></div>
        )}
        
        {/* Loading durumunda merkez çember */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin opacity-30"></div>
        )}
      </button>
    </>
  );
};

export default AIAssistantButton;