"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Eye, EyeOff, Plus, ChevronDown, ChevronUp, Mic, MicOff } from "lucide-react";
import { useNoteStore } from "@/store/useNoteStore";
import { stat } from "fs";
import toast from "react-hot-toast";

// Editor component props interface
interface EditorProps {
  onChange: (content: string) => void;
  editable: boolean;
  initialContent: string;
  isExpanded: boolean;
}

// Mock Editor component for demo
const Editor: React.FC<EditorProps> = ({ onChange, editable, initialContent, isExpanded }) => {
  return (
    <textarea
      value={initialContent}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Notunuzu buraya yazın..."
      className={`w-full p-4 border-0 resize-none outline-none transition-all duration-300 bg-gradient-to-br from-white to-gray-50 focus:from-white focus:to-blue-50 focus:ring-2 focus:ring-blue-400 rounded-lg shadow-sm hover:shadow-md ${
        isExpanded ? 'h-64' : 'h-12'
      }`}
      disabled={!editable}
    />
  );
};

interface NoteBlockProps {
  onSave: (data: any) => void;
  aiResponses?: any[];
}

const NoteBlock: React.FC<NoteBlockProps> = ({ onSave, aiResponses = [] }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // AI cevabı eklendiğinde editörde anında göster
  const handleAddAIResponse = (aiText: string) => {
    setContent(prev => (prev ? prev + "\n\n" + aiText : aiText));
    toast.success("AI cevabı not editörüne eklendi!");
  };

  // Ses kaydı fonksiyonları
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Tarayıcınız sesli not alma özelliğini desteklemiyor.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR"; // Türkçe dil desteği
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk + " ";
        } else {
          interimTranscript += transcriptChunk;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setContent(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast.error("Ses tanıma hatası: " + event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Ses kaydı başlatıldı!");
      } catch (error) {
        console.error("Ses kaydı başlatılamadı:", error);
        toast.error("Ses kaydı başlatılamadı!");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success("Ses kaydı durduruldu!");
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList): void => {
    const fileList: File[] = Array.from(files);
    const validFiles: File[] = fileList.filter((file: File) => {
      const validTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    
    if (validFiles.length > 0) {
      setUploadedFiles((prev: File[]) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} dosya eklendi!`);
    }
    
    const invalidFiles = fileList.length - validFiles.length;
    if (invalidFiles > 0) {
      toast.error(`${invalidFiles} dosya geçersiz format/boyut nedeniyle eklenmedi!`);
    }
  };

  const removeFile = (index: number): void => {
    setUploadedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
    toast.success("Dosya kaldırıldı!");
  };

  const handleBlockClick = (): void => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSave = (): void => {
    if (content.trim() || uploadedFiles.length > 0) {
      onSave({ content, files: uploadedFiles });
      setContent("");
      setUploadedFiles([]);
      setTranscript("");
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={`relative group border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer ${
        dragActive 
          ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-blue-50 shadow-2xl transform scale-[1.02]' 
          : isExpanded 
            ? 'border-gray-300 bg-white shadow-2xl ring-4 ring-blue-100/50' 
            : 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-gray-50 to-white hover:bg-white shadow-lg hover:shadow-2xl hover:scale-[1.01]'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleBlockClick}
      style={{ minHeight: 80 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept="image/*,.pdf,.txt"
      />

      {!isExpanded ? (
        // Collapsed State
        <div className="p-10 text-center">
          <div className="flex items-center justify-center space-x-6 text-gray-500 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Plus size={28} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Yeni not ekle veya dosya sürükle</span>
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
              <Upload size={28} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-gray-400 italic font-medium">
            Tıklayarak genişlet • JPG, PNG, GIF, PDF, TXT desteklenir
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      ) : (
        // Expanded State
        <div className="relative z-20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-3xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-700">Not Editörü</span>
                <p className="text-sm text-gray-500">Notion tarzı zengin editör</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="p-3 hover:bg-blue-100 rounded-xl transition-all group shadow-md hover:shadow-lg"
            >
              <ChevronUp size={24} className="text-blue-500 group-hover:text-blue-700 transform group-hover:scale-110 transition-all" />
            </button>
          </div>

          {/* AI Buttons - Sadece expanded durumda */}
          {Array.isArray(aiResponses) && aiResponses.length > 0 && (
            <div className="p-4 flex flex-wrap gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
              <span className="text-sm font-bold text-gray-700 mr-2">AI Cevapları:</span>
              {aiResponses.map((ai: any) => (
                <button
                  key={ai.id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-sm text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-blue-300"
                  onClick={e => {
                    e.stopPropagation();
                    handleAddAIResponse(ai.text);
                  }}
                >
                  ✨ Editöre Ekle
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="relative">
            {/* File Drop Zone Indicator */}
            {dragActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center z-30 shadow-2xl backdrop-blur-sm">
                <div className="text-center p-8">
                  <Upload className="mx-auto h-20 w-20 text-blue-500 mb-6 animate-bounce" />
                  <p className="text-blue-600 font-bold text-xl mb-2">Dosyaları buraya bırak</p>
                  <p className="text-blue-500 text-sm">Desteklenen formatlar: JPG, PNG, GIF, PDF, TXT</p>
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Editor */}
            <Editor 
              onChange={setContent} 
              editable={true} 
              initialContent={content}
              isExpanded={isExpanded}
            />

            {/* File Upload & Voice Recording Buttons */}
            <div className="px-6 pb-4 flex items-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center space-x-3 px-6 py-3 text-sm font-bold text-blue-600 hover:text-white hover:bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-200 hover:border-transparent transform hover:scale-105"
              >
                <Upload size={18} />
                <span>📎 Dosya Ekle</span>
              </button>

              {/* Ses Kaydı Butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isRecording ? stopRecording() : startRecording();
                }}
                className={`inline-flex items-center space-x-3 px-6 py-3 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 transform hover:scale-105 ${
                  isRecording 
                    ? 'text-red-600 bg-red-100 border-red-200 hover:bg-red-200 animate-pulse' 
                    : 'text-green-600 hover:text-white hover:bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 border-green-200 hover:border-transparent'
                }`}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isRecording ? '🛑 Kaydı Durdur' : '🎤 Ses Kaydı'}</span>
              </button>
            </div>
          </div>

          {/* Uploaded Files - Sadece dosya varsa göster */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-700 flex items-center">
                  <span className="mr-2">📁</span>
                  Yüklenen Dosyalar ({uploadedFiles.length})
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFiles([]);
                    toast.success("Tüm dosyalar temizlendi!");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  🗑️ Tümünü Temizle
                </button>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] animate-in slide-in-from-top duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 truncate max-w-48">{file.name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <span className="mr-1">📊</span>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                      title="Dosyayı kaldır"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 rounded-b-3xl">
            <div className="text-sm text-gray-500 font-medium flex items-center space-x-3">
              {content.length > 0 && (
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-full text-blue-700 font-bold shadow-sm">
                  📝 {content.length} karakter
                </span>
              )}
              {uploadedFiles.length > 0 && (
                <span className="bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-2 rounded-full text-indigo-700 font-bold shadow-sm">
                  📎 {uploadedFiles.length} dosya
                </span>
              )}
              {isRecording && (
                <span className="bg-gradient-to-r from-red-100 to-pink-100 px-3 py-2 rounded-full text-red-700 font-bold shadow-sm animate-pulse">
                  🎤 Kayıt yapılıyor...
                </span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContent("");
                  setUploadedFiles([]);
                  setTranscript("");
                  setIsExpanded(false);
                }}
                className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-white hover:bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl shadow-lg transition-all duration-200 border-2 border-gray-300 hover:border-transparent transform hover:scale-105"
              >
                ❌ İptal
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={!content.trim() && uploadedFiles.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-blue-500"
              >
                ✅ Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  // AI responses state
  const aiResponses = useNoteStore(state => state.aiResponses);
  const [showAiResponses, setShowAiResponses] = useState(false);

  // Function to add AI response to current note content
  const handleAddAIToNote = (aiText: string) => {
    const newNote = {
      id: Date.now(),
      content: aiText,
      files: [],
      createdAt: new Date().toISOString(),
      isAIGenerated: true
    };
    setSavedNotes(prev => [...prev, newNote]);
    toast.success("AI cevabı nota eklendi!");
  };

  const handleNoteSave = (noteData: any): void => {
    const newNote = {
      id: Date.now(),
      ...noteData,
      createdAt: new Date().toISOString()
    };
    setSavedNotes(prev => [...prev, newNote]);
  };

  const handleFinalSave = async (): Promise<void> => {
    if (!header.trim() || savedNotes.length === 0) {
      alert("Başlık ve en az bir not bloğu gerekli!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken(token);
      if (!userId) {
        alert("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      
      // Content'i string olarak birleştir, JSON değil
      const combinedContent = savedNotes.map(note => note.content).join('\n\n');
      
      // DEBUG: Gönderilen veriyi logla
      const requestData = {
        header,
        classname,
        isPublic,
        userId,
        text: combinedContent, // content yerine text field'ı kullan
      };
      console.log("API'ye gönderilen veri:", requestData);
      
      const response = await fetch("/api/notes/savenote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        console.log("API hatası:", data);
        alert(data.error || "Not kaydedilemedi!");
        return;
      }
      
      const savedNote = await response.json();
      console.log("Kaydedilen not:", savedNote);
      
      alert("Not başarıyla kaydedildi!");
      setHeader("");
      setClassname("");
      setIsPublic(false);
      setSavedNotes([]);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Beklenmeyen bir hata oluştu!");
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-100 p-6 overflow-y-auto">
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
          {/* AI Responses Section */}
          {aiResponses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-indigo-100 backdrop-blur-sm bg-white/95 transform hover:scale-[1.01] transition-transform">
              <button
                onClick={() => setShowAiResponses(!showAiResponses)}
                className="mb-6 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 transition-all duration-200 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-indigo-500"
              >
                {showAiResponses ? "🔽 AI Cevaplarını Gizle" : "🔼 AI Cevaplarını Göster"} ({aiResponses.length})
              </button>
              {showAiResponses && (
                <div
                  className="overflow-y-auto max-h-[400px] min-h-[140px] p-6 bg-gradient-to-br from-gray-50 via-white to-indigo-50 rounded-2xl border-2 border-gray-200 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 shadow-inner"
                  style={{ overscrollBehavior: "contain" }}
                >
                  {aiResponses.map((msg) => (
                    <div key={msg.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] ${msg.isUser ? "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 text-purple-800 border-2 border-purple-200" : "bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 text-green-800 border-2 border-green-200"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <strong className="text-lg flex items-center space-x-2 font-bold">
                            <span className="text-2xl">{msg.isUser ? "👤" : "🤖"}</span>
                            <span>{msg.isUser ? "Sen: " : "AI: "}</span>
                          </strong>
                        </div>
                        <span className="text-sm leading-relaxed break-words font-medium">{msg.text}</span>
                      </div>
                      {!msg.isUser && (
                        <button
                          className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl text-sm text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-500"
                          onClick={() => handleAddAIToNote(msg.text)}
                        >
                          ➕ Nota Ekle
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Notes */}
          {savedNotes.map((note, index) => (
            <div key={note.id} className={`rounded-2xl shadow-2xl p-8 border-2 transition-all duration-200 hover:shadow-2xl transform hover:scale-[1.01] ${note.isAIGenerated ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-8 border-green-500' : 'bg-white border-gray-100'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {note.isAIGenerated && (
                    <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white shadow-xl border-2 border-green-500">
                      <span className="mr-2 text-lg">🤖</span>
                      AI Cevabı
                    </div>
                  )}
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
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">📎</span>
                    Ekli Dosyalar ({note.files.length})
                  </h4>
                  {note.files.map((file: File, fileIndex: number) => (
                    <div key={fileIndex} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl shadow-lg">
                      <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 font-bold">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* New Note Block */}
          <NoteBlock onSave={handleNoteSave} aiResponses={aiResponses} />
        </div>

        {/* Final Save Button */}
        {savedNotes.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleFinalSave}
              className="px-12 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white font-black text-xl rounded-2xl hover:from-green-700 hover:via-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-3xl border-4 border-green-500 hover:border-green-400"
            >
              <span className="mr-3 text-2xl">💾</span>
              Tüm Notları Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}