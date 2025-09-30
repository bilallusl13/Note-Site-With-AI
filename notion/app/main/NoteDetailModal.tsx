"use client";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@heroui/react"
import AddComment from "./notedetail/[id]/AddComment";
import { useRouter } from "next/navigation";
import {jwtDecode} from 'jwt-decode'; // düzeltme: import { jwtDecode } değil, default export
import { useNoteStore } from "@/store/useNoteStore"
import { jsPDF } from "jspdf";
import { CloudFog } from "lucide-react";
interface NoteDetailModalProps {
  noteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}
const handleMakePDF = async(header:string,text:string)=>{
  console.log("işlem başladı")
const doc = new jsPDF()
doc.setFontSize(18)
  doc.text(header,10,20);
  doc.setFontSize(12);
   const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 40);

    doc.save("note.pdf");
}
const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ noteId, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iscommentOpen, setIscommentOpen] = useState(false)
  const [commentId, setcommentId] = useState<string | null>('');
  const commentButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ header: '', text: '', isPublic: false });
  const [userRole, setUserRole] = useState<string>("user");
  const [isPreview, setIsPreview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const aiResponses = useNoteStore(state => state.aiResponses);
  const approvedAI = useNoteStore(state => state.approvedAI);
  const setApprovedAI = useNoteStore(state => state.setApprovedAI);
  const setSelectedNoteId = useNoteStore(state => state.setSelectedNoteId);

  // Yeni: AI cevaplarını göster/gizle toggle state
  const [showAiResponses, setShowAiResponses] = useState(false);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }
        const response = await fetch(`/api/notes/${noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          let errorMsg = "Not detayları getirilemedi.";
          try {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }
        const noteDetails = await response.json();
        console.log("Not Detay API:", noteDetails); // <-- DEBUG: API cevabını gör
        setData(noteDetails);
        setUserRole(noteDetails.role || "user");
        // İçerik alanı fallback ile doldurulsun
        setEditData({ 
          header: noteDetails.header, 
          text: noteDetails.text || noteDetails.content || noteDetails.body || noteDetails.description || "", 
          isPublic: noteDetails.isPublic 
        });
      } catch (error: any) {
        toast.error(error.message || "Not detayları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNoteDetails();
    }
  }, [noteId]);

  useEffect(() => {
    // Kullanıcı ID'sini JWT'den al
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload: any = jwtDecode(token);
        setCurrentUserId(payload.userId);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!approvedAI) return;
    if (isOpen && noteId && data) {
      // Not detayı açıkken ve veri geldiyse, AI cevabını ekle
      const newText = (data.text || "") + "\n" + approvedAI.text;
      setEditData((prev) => ({ ...prev, text: newText }));
      setIsEditing(true);
      toast.success("AI cevabı notunuza eklendi!");
    }
    setApprovedAI(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedAI]);

  // editData.text değişince otomatik kaydet
  useEffect(() => {
    if (isEditing && editData.text && approvedAI) {
      handleSaveEditWithText(editData.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData.text]);

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(`/api/notes/updatenote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: noteId,
          header: editData.header,
          isPublic: editData.isPublic,
          text: editData.text,
        }),
      });
      if (!response.ok) {
        let errorMsg = "Not kaydedilemedi.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const updatedNote = await response.json();
      setData({
        ...data,
        header: updatedNote.header || editData.header,
        text: updatedNote.text || editData.text,
        isPublic: updatedNote.isPublic !== undefined ? updatedNote.isPublic : editData.isPublic,
        updatedAt: updatedNote.updatedAt || new Date().toISOString()
      });
      setEditData({
        header: updatedNote.header || editData.header,
        text: updatedNote.text || editData.text,
        isPublic: updatedNote.isPublic !== undefined ? updatedNote.isPublic : editData.isPublic
      });
      toast.success("Not başarıyla kaydedildi!");
      setIsEditing(false);
      setIsPreview(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Not kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditWithText = async (newText: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await fetch(`/api/notes/updatenote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: noteId,
          header: editData.header,
          isPublic: editData.isPublic,
          text: newText,
        }),
      });
      if (!response.ok) {
        let errorMsg = "Not kaydedilemedi.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const updatedNote = await response.json();
      setData({
        ...data,
        header: updatedNote.header || editData.header,
        text: updatedNote.text || newText,
        isPublic: updatedNote.isPublic !== undefined ? updatedNote.isPublic : editData.isPublic,
        updatedAt: updatedNote.updatedAt || new Date().toISOString()
      });
      setEditData({
        header: updatedNote.header || editData.header,
        text: updatedNote.text || newText,
        isPublic: updatedNote.isPublic !== undefined ? updatedNote.isPublic : editData.isPublic
      });
      setIsEditing(false);
      setIsPreview(false);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Not kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      setEditData({ header: data.header, text: data.text, isPublic: data.isPublic });
    }
  };

  const handleDeleteNote = async () => {
    if (confirm("Bu notu silmek istediğinize emin misiniz?")) {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Not silinemedi.");
        toast.success("Not silindi!");
        onClose();
      } catch {
        toast.error("Not silinemedi.");
      }
    }
  };

  const handlecommentopen = (id: string) => {
    setcommentId(id);
    setIscommentOpen(true);
  };
  const handlecommentclose = () => setIscommentOpen(false);

  // Yeni not oluşturulduğunda liste yenileme tetikleyicisi
  useEffect(() => {
    // Parent component'e yenileme sinyali gönder (eğer varsa)
    // setRefreshNotes(false); // Bu satır kaldırıldı
  }, []);

  // Markdown ve diğer fonksiyonlar burada aynen devam...

  const insertMarkdownSyntax = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editData.text.substring(start, end);
    const newText = selectedText || placeholder;
    
    let beforeText = editData.text.substring(0, start);
    let afterText = editData.text.substring(end);
    let insertText = '';
    let cursorOffset = 0;
    
    switch (syntax) {
      case 'bold':
        insertText = `**${newText}**`;
        cursorOffset = newText ? insertText.length : 2;
        break;
      case 'italic':
        insertText = `*${newText}*`;
        cursorOffset = newText ? insertText.length : 1;
        break;
      case 'code':
        insertText = `\`${newText}\``;
        cursorOffset = newText ? insertText.length : 1;
        break;
      case 'codeblock':
        insertText = `\n\`\`\`\n${newText}\n\`\`\`\n`;
        cursorOffset = newText ? insertText.length : 5;
        break;
      case 'link':
        insertText = `[${newText || 'link text'}](url)`;
        cursorOffset = newText ? insertText.length - 4 : insertText.length - 4;
        break;
      case 'heading':
        insertText = `\n## ${newText || 'Başlık'}\n`;
        cursorOffset = newText ? insertText.length : insertText.length - 1;
        break;
      case 'list':
        insertText = `\n- ${newText || 'Liste öğesi'}\n`;
        cursorOffset = newText ? insertText.length : insertText.length - 1;
        break;
      default:
        insertText = newText;
        cursorOffset = insertText.length;
    }
    
    const newContent = beforeText + insertText + afterText;
    setEditData({...editData, text: newContent});
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const renderMarkdownPreview = (text: string) => {
    return text
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-4 rounded-lg overflow-x-auto border border-gray-600"><code class="text-green-400">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-2 py-1 rounded text-yellow-300 border border-gray-600">$1</code>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-blue-300">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-blue-200">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-6 text-blue-100">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-yellow-200">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-green-300">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 mb-1 text-gray-200">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 mb-1 text-gray-200">$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>')
      .replace(/\n/g, '<br>');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSaveEdit();
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = editData.text.substring(0, start) + '  ' + editData.text.substring(end);
      setEditData({...editData, text: newContent});
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  useEffect(() => {
    if (isOpen && noteId) {
      setSelectedNoteId(noteId);
    } else {
      setSelectedNoteId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, noteId]);

  if (!isOpen) return null;

  return (
    <>
      <AddComment
        commentId={commentId}
        onClose={handlecommentclose}
        isOpen={iscommentOpen}
        anchorRef={commentButtonRef}
      />
      {/* Modal ana kutusu ve içeriği için modern ve responsive tailwind classları uygula: */}
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl max-w-3xl w-full mx-4 max-h-[95vh] overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                {isEditing ? '📝 Not Düzenle' : '📄 Not Detayı'}
              </h2>
              {data && !isEditing && (
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                    {data.classname}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${data.isPublic ? 'bg-green-600' : 'bg-red-600'}`}>{data.isPublic ? '🌐 Herkese Açık' : '🔒 Özel'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isPreview ? 'bg-blue-600 text-white border border-blue-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {isPreview ? '📝 Düzenle' : '👁️ Önizleme'}
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                ✕ Kapat
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              </div>
            ) : data ? (
              <div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="w-full p-3 mb-4 text-xl font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData.header}
                      onChange={(e) => setEditData({...editData, header: e.target.value})}
                      placeholder="Başlık giriniz..."
                    />
                    {!isPreview ? (
                      <>
                        <div className="mb-2 flex flex-wrap gap-2">
                          {/* Markdown toolbar butonları aynı kalabilir */}
                        </div>
                        <textarea
                          id="edit-content-editor"
                          className="w-full h-64 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editData.text}
                          onChange={(e) => setEditData({...editData, text: e.target.value})}
                          onKeyDown={handleKeyDown}
                        />
                      </>
                    ) : (
                      <div className="prose prose-invert max-w-full overflow-x-auto whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(editData.text) }} />
                      </div>
                    )}
                    <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editData.isPublic}
                          onChange={(e) => setEditData({...editData, isPublic: e.target.checked})}
                          className="form-checkbox text-blue-600"
                        />
                        <span>Herkese Açık</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          Kaydet (Ctrl+S)
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-4">{data?.header}</h1>
                    <div className="prose prose-invert max-w-full whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      {data?.text && data.text.trim() !== "" ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(data?.text || '') }} />
                      ) : (
                        <div className="text-gray-400 italic">Not içeriği bulunamadı.</div>
                      )}
                    </div>
                    {/* AI cevapları göster/gizle butonu ve kutusu */}
                    {aiResponses.length > 0 && (
                      <div className="mt-8">
                        <button
                          onClick={() => setShowAiResponses(!showAiResponses)}
                          className="mb-3 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition-colors text-white font-medium"
                        >
                          {showAiResponses ? "AI Cevaplarını Gizle" : "AI Cevaplarını Göster"} ({aiResponses.length})
                        </button>
                        {showAiResponses && (
                          <div className="max-h-96 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                            {aiResponses.map((msg) => (
                              <div key={msg.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg shadow-sm ${msg.isUser ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700" : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700"}`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <strong className="text-sm">{msg.isUser ? "Sen: " : "AI: "}</strong>
                                  </div>
                                  <span className="text-sm leading-relaxed break-words">{msg.text}</span>
                                </div>
                                {!msg.isUser && (
                                  <button
                                    className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white font-medium transition-colors shadow-sm hover:shadow-md"
                                    onClick={async () => {
                                      const newText = (data?.text || "") + "\n" + msg.text;
                                      setEditData({ ...editData, text: newText });
                                      setIsEditing(true);
                                      try {
                                        await handleSaveEditWithText(newText);
                                        toast.success("AI cevabı notunuza eklendi!");
                                      } catch (e) {
                                        toast.error("AI cevabı eklenirken hata oluştu.");
                                      }
                                    }}
                                  >
                                    Onayla
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-xl text-gray-400 mb-2">❌ Not bulunamadı</p>
                  <p className="text-gray-500">Bu not mevcut değil veya erişim yetkiniz bulunmuyor.</p>
                </div>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-2 justify-end items-center">
            {!isEditing && (
              <>
                {(userRole === "admin" || currentUserId === data?.userId) && (
                  <>
                     <Button onClick={()=>handleMakePDF(data?.header,data?.text)} variant="solid" className="bg-gradient-to-br from-yellow-500 to-green-700 text-white rounded-lg px-4 py-2 font-medium mr-2">
                      PDF&apos;e Dönüştür
                    </Button>
                    <Button onClick={handleEditNote} variant="solid" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium mr-2">
                      Düzenle
                    </Button>
                    <Button onClick={handleDeleteNote} variant="solid" className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium">
                      Sil
                    </Button>
                  </>
                )}
                <Button onClick={() => handlecommentopen(data?.id)} variant="solid" className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-2 font-medium">
                  Yorumlar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteDetailModal;
