"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, X, FileText } from "lucide-react";
import NoteBlock from "../components/NoteBlock";

// JWT token'dan userId'yi decode eden yardımcı fonksiyon
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
}

export default function NewNotePage(): JSX.Element {
  const [header, setHeader] = useState<string>("");
  const [classname, setClassname] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [processedAiIds, setProcessedAiIds] = useState<Set<number>>(new Set());
  
  // AI responses state
  const [aiResponses] = useState([
    { id: 1, text: "Bu örnek bir AI cevabıdır. Matematik problemi hakkında...", isUser: false },
    { id: 2, text: "Teşekkürler, çok yardımcı oldu!", isUser: true },
    { id: 3, text: "Size yardımcı olabildiğim için mutluyum. Başka sorunuz var mı?", isUser: false }
  ]);
  const [showAiResponses, setShowAiResponses] = useState(false);

  // Otomatik AI cevabı ekleme
  const [autoAiContent, setAutoAiContent] = useState<string>("");

  // AI cevaplarını otomatik olarak izle ve editöre ekle
  useEffect(() => {
    if (aiResponses.length > 0) {
      const lastAiResponse = aiResponses[aiResponses.length - 1];
      
      // Sadece AI mesajlarını işle (kullanıcı mesajları değil) ve daha önce işlenmemiş olanları
      if (!lastAiResponse.isUser && !processedAiIds.has(lastAiResponse.id)) {
        setAutoAiContent(lastAiResponse.text);
        setProcessedAiIds(prev => new Set(prev).add(lastAiResponse.id));
      }
    }
  }, [aiResponses, processedAiIds]);

  const handleNoteSave = (noteData: any): void => {
    const newNote = {
      id: Date.now(),
      ...noteData,
      createdAt: new Date().toISOString()
    };
    setSavedNotes(prev => [...prev, newNote]);
    // Auto content'i temizle
    setAutoAiContent("");
  };

  const handleFinalSave = async (): Promise<void> => {
    if (!header.trim() || savedNotes.length === 0) {
      alert("Başlık ve en az bir not bloğu gerekli!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      // Notları birleştir
      const combinedText = savedNotes.map(note => note.content).join("\n\n");

      const response = await fetch("/api/notes/addnote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          header,
          text: combinedText,
          classname,
          isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Not eklenirken hata oluştu");
      }

      alert("Not başarıyla kaydedildi!");
      
      // Formu temizle
      setHeader("");
      setClassname("");
      setIsPublic(false);
      setSavedNotes([]);
      setProcessedAiIds(new Set());
      setAutoAiContent("");
      
      // Ana sayfaya yönlendir
      window.location.href = "/main";
    } catch (error: any) {
      console.error("Save error:", error);
      alert("Beklenmeyen bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Main Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10 border-2 border-blue-100 backdrop-blur-sm bg-white/95 transform hover:scale-[1.01] transition-transform">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-6">
              <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 via-purple-700 to-pink-700 bg-clip-text mb-4 leading-tight">
                ✨ Yeni Not Oluştur
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-gray-600 text-xl font-medium">Notion tarzı blok editörü ile notunuzu oluşturun</p>
            {aiResponses.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 rounded-2xl border-2 border-green-300 shadow-lg">
                <p className="text-green-800 font-bold flex items-center justify-center space-x-2">
                  <span className="text-2xl">🤖</span>
                  <span>AI cevapları otomatik olarak editöre eklenmektedir!</span>
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            {/* Title Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-blue-700 flex items-center space-x-2">
                <span className="text-lg">📝</span>
                <span>Not Başlığı</span>
              </label>
              <input
                type="text"
                value={header}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeader(e.target.value)}
                placeholder="Başlık giriniz..."
                className="w-full px-6 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-white to-blue-50 text-lg font-medium"
              />
            </div>

            {/* Class Code Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-blue-700 flex items-center space-x-2">
                <span className="text-lg">🎓</span>
                <span>Ders Kodu</span>
              </label>
              <input
                type="text"
                value={classname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClassname(e.target.value)}
                placeholder="örneğin: CSCI-101"
                className="w-full px-6 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-white to-blue-50 text-lg font-medium"
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-lg">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="sr-only"
                />
                <div
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-16 h-8 rounded-full cursor-pointer transition-all duration-300 shadow-lg ${
                    isPublic ? 'bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 shadow-xl' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 bg-white rounded-full shadow-xl transform transition-transform duration-300 ${
                      isPublic ? 'translate-x-8' : 'translate-x-0.5'
                    } mt-0.5 border-2 ${isPublic ? 'border-green-400' : 'border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {isPublic ? 
                  <Eye size={24} className="text-green-600" /> : 
                  <EyeOff size={24} className="text-gray-400" />
                }
                <div>
                  <span className="text-lg font-bold text-gray-700">
                    {isPublic ? '🌍 Herkese Açık' : '🔒 Gizli'}
                  </span>
                  <p className="text-sm text-gray-500 font-medium">
                    {isPublic ? 'Herkes görebilir ve yorumlayabilir' : 'Sadece siz görebilirsiniz'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note Blocks */}
        <div className="space-y-8">
          {/* AI Responses Section - sadece geçmişi görmek için */}
          {aiResponses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-indigo-100 backdrop-blur-sm bg-white/95 transform hover:scale-[1.01] transition-transform">
              <button
                onClick={() => setShowAiResponses(!showAiResponses)}
                className="mb-6 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 transition-all duration-200 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-indigo-500"
              >
                {showAiResponses ? "🔽 AI Geçmişini Gizle" : "🔼 AI Geçmişini Göster"} ({aiResponses.length})
              </button>
              {showAiResponses && (
                <div className="overflow-y-auto max-h-96 p-6 bg-gradient-to-br from-gray-50 via-white to-indigo-50 rounded-2xl border-2 border-gray-200 space-y-4">
                  {aiResponses.map((msg) => (
                    <div key={msg.id} className={`flex flex-col p-6 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] ${msg.isUser ? "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 text-purple-800 border-2 border-purple-200" : "bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 text-green-800 border-2 border-green-200"}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <strong className="text-lg flex items-center space-x-2 font-bold">
                          <span className="text-2xl">{msg.isUser ? "👤" : "🤖"}</span>
                          <span>{msg.isUser ? "Sen: " : "AI: "}</span>
                        </strong>
                        {!msg.isUser && processedAiIds.has(msg.id) && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">
                            ✅ Otomatik Eklendi
                          </span>
                        )}
                      </div>
                      <span className="text-sm leading-relaxed break-words font-medium">{msg.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Notes */}
          {savedNotes.map((note, index) => (
            <div key={note.id} className="rounded-2xl shadow-2xl p-8 border-2 transition-all duration-200 hover:shadow-2xl transform hover:scale-[1.01] bg-white border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg font-medium">{note.content}</p>
                </div>
                <button
                  onClick={() => setSavedNotes(prev => prev.filter(n => n.id !== note.id))}
                  className="ml-6 p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-red-200 hover:border-red-500"
                >
                  <X size={20} />
                </button>
              </div>
              {note.files && note.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                    <span className="mr-2">📁</span>
                    Ekli Dosyalar ({note.files.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {note.files.map((file: any, fileIndex: number) => (
                      <div key={fileIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* New Note Block */}
          <NoteBlock onSave={handleNoteSave} aiResponses={aiResponses} autoContent={autoAiContent} />
        </div>

        {/* Final Save Button */}
        {(header.trim() || savedNotes.length > 0) && (
          <div className="sticky bottom-6 mt-12 text-center">
            <button
              onClick={handleFinalSave}
              disabled={!header.trim() || savedNotes.length === 0}
              className="px-12 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none border-4 border-green-500 hover:border-green-600"
            >
              🚀 Notu Kaydet ve Tamamla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
