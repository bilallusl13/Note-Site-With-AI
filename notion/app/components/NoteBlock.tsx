"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Eye, EyeOff, Plus, ChevronDown, ChevronUp } from "lucide-react";

// Mock store hook for demo
const useNoteStore = (selector?: any) => {
  const [aiResponses] = useState([
    { id: 1, text: "Bu örnek bir AI cevabıdır. Matematik problemi hakkında...", isUser: false },
    { id: 2, text: "Teşekkürler, çok yardımcı oldu!", isUser: true },
    { id: 3, text: "Size yardımcı olabildiğim için mutluyum. Başka sorunuz var mı?", isUser: false }
  ]);
  return aiResponses;
};

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
  autoContent?: string; // Otomatik eklenen içerik için
}

const NoteBlock: React.FC<NoteBlockProps> = ({ onSave, aiResponses = [], autoContent = "" }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI cevabı otomatik eklendiğinde
  useEffect(() => {
    if (autoContent && autoContent.trim()) {
      setContent(prev => (prev ? prev + "\n\n" + autoContent : autoContent));
      setIsExpanded(true); // Otomatik genişlet
    }
  }, [autoContent]);

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
    
    setUploadedFiles((prev: File[]) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number): void => {
    setUploadedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
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

            {/* File Upload Button */}
            <div className="px-6 pb-4">
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
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <span className="mr-2">📁</span>
                Yüklenen Dosyalar ({uploadedFiles.length})
              </h4>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{file.name}</p>
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
            </div>
            <div className="flex space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setContent("");
                  setUploadedFiles([]);
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

export default NoteBlock;
