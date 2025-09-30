"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Switch,
} from "@heroui/react";

// ❤️ Heart Icon
const HeartIcon = ({ fill = "currentColor", filled, size, height, width, ...props }: any) => (
  <svg
    fill={filled ? fill : "none"}
    height={size || height || 24}
    width={size || width || 24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

// 💬 Comment Icon
const CommentIcon = ({ size = 16, ...props }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ✏️ Pencil Icon for Editing
const PencilIcon = ({ size = 16, ...props }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);


// ✅ API'den kullanıcıları çek
const handleGetUser = async () => {
  try {
    const response = await fetch("/api/user/usersfordashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      toast.error("Sunucu hatası");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error(`Kullanıcı alınamadı: ${error}`);
    return null;
  }
};

// ✅ Tüm notları getir
const handleGetAllNotes = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token bulunamadı");
      return [];
    }
    const response = await fetch("/api/notes/allnotes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMsg = `API hatası: ${response.status}`;
      try {
        const data = await response.json();
        errorMsg = data.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    toast.error(error.message || "Notlar alınamadı");
    return [];
  }
};

const Page = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [isPublicComment, setIsPublicComment] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // State for editing comment
  const [editingComment, setEditingComment] = useState<any>(null);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure();

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("role") || "user";
    setUserRole(role);

    async function fetchAllData() {
      console.log("Veri çekme işlemi başlatılıyor...");
      
      // Kullanıcı verilerini getir
      const userData = await handleGetUser();
      console.log("Kullanıcı verisi:", userData);
      
      // Tüm notları getir
      const notesData = await handleGetAllNotes();
      console.log("Not verisi:", notesData);
      
      setAllNotes(notesData || []);

      if (Array.isArray(userData)) {
        // Tüm public notları topla ve beğeni sayısına göre sırala
        const allPublicNotes = userData.flatMap((user) => {
          const publicNotes = user.notes?.filter((note: any) => note.isPublic) || [];
          return publicNotes.map((note: any) => ({
            ...user,
            note: note,
            comment: null
          }));
        }).sort((a, b) => (b.note?.likes || 0) - (a.note?.likes || 0))
        .slice(0, 5);

        // Tüm public yorumları topla ve beğeni sayısına göre sırala
        const allPublicComments = userData.flatMap((user) => {
          const publicComments = user.comments?.filter((comment: any) => comment.isPublic) || [];
          return publicComments.map((comment: any) => ({
            ...user,
            note: null,
            comment: comment
          }));
        }).sort((a, b) => (b.comment?.likes || 0) - (a.comment?.likes || 0))
        .slice(0, 5);

        // Her iki listeyi birleştir
        const allTopUsers = [...allPublicNotes, ...allPublicComments];
        
        setTopUsers(allTopUsers);
      }
    }

    fetchAllData();
  }, []);

  const handleLike = async(noteId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      newSet.has(noteId) ? newSet.delete(noteId) : newSet.add(noteId);
      return newSet;
    });

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/user/updatelike", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
      } else {
        toast.success("Beğeni başarılı");
      }
    } catch (error) {
      toast.error(`Hata: ${error}`);
    }
  };

  const handleDeleteComment = async(commentId: string) => {
    if (!commentId) {
      toast.error("ID bilgisi alınamadı");
      return;
    }

    const confirmed = confirm("Bu yorumu silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/comments/deletecomment", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: commentId }),
      });

      if (!response.ok) {
        toast.error("Silme işlemi başarısız");
      } else {
        toast.success("Yorum başarıyla silindi");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(`Hata: ${error}`);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!noteId) {
      toast.error("ID bilgisi alınamadı");
      return;
    }

    const confirmed = confirm("Bu notu silmek istediğinize emin misiniz? Not çöp kutusuna taşınacak.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notes/deletenote", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: noteId }),
      });

      if (!response.ok) {
        toast.error("Silme işlemi başarısız");
      } else {
        toast.success("Not silindi ve çöp kutusuna taşındı");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(`Hata: ${error}`);
    }
  };

  const handleAddComment = (noteId: string) => {
    setSelectedNoteId(noteId);
    setCommentText("");
    setIsPublicComment(true);
    onOpen();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Yorum boş olamaz");
      return;
    }
     
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/comments/createcomments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: selectedNoteId,
          text: commentText,
          isPublic: isPublicComment
        })
      });

      if (!response.ok) {
        toast.error("Yorum eklenemedi");
        return;
      }

      toast.success("Yorum başarıyla eklendi!");
      setCommentText("");
      onOpenChange();
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingComment(comment);
    onEditModalOpen();
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.text.trim()) {
      toast.error("Yorum boş olamaz");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/comments/editcomment", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: editingComment.id,
          isPublic: editingComment.isPublic,
          text: editingComment.text
        })
      });
      if (!response.ok) {
        toast.error("Yorum güncellenemedi");
      } else {
        toast.success("Yorum başarıyla güncellendi!");
        onEditModalOpenChange();
        // Sayfayı yenile
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(`Bir hata oluştu: ${error}`);
    } finally {
      setIsSubmitting(false);
      setEditingComment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };
  const handleLikeComment = async(commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Lütfen giriş yapın");
        return;
      }

      const response = await fetch("/api/comments/commentlike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        toast.error("Sunucu ile iletişim sağlanamadı");
      } else {
        toast.success("İşlem başarılı");
      }
    } catch (error) {
      toast.error(`Hata: ${error}`);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-pulse-custom {
          animation: pulse 2s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .glass-effect {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 193, 7, 0.8), 0 0 40px rgba(255, 193, 7, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 193, 7, 1), 0 0 60px rgba(255, 193, 7, 0.6);
          }
        }
        
        .ranking-badge-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Sol Panel - NOTLAR */}
        <div className="w-1/2 h-screen fixed left-0 bg-gradient-to-br from-purple-800/90 to-indigo-900/90 text-white overflow-y-auto p-8 shadow-2xl border-r border-purple-500/30 glass-effect animate-slide-in-left">
          <div className="mb-8 text-center">
            <div className="animate-pulse-custom mb-4">
              <h3 className="text-3xl font-bold gradient-text drop-shadow-2xl">
                🏆 En Çok Beğenilen Public Notlar
              </h3>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 mx-auto rounded-full shimmer-effect"></div>
          </div>

          {/* Debug bilgisi */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-white/60 mb-6 text-center bg-black/30 p-3 rounded-xl border border-white/10 animate-fade-in-up">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Debug: {topUsers.filter(u => u.note).length} public not gösteriliyor
              </span>
            </div>
          )}

          {topUsers.filter(user => user.note && user.note.isPublic).slice(0, 5).length > 0 ? (
            <div className="space-y-6">
              {topUsers.filter(user => user.note && user.note.isPublic).slice(0, 5).map((user: any, index: number) => {
                const isLiked = likedPosts.has(user.note.id);
                const currentLikes = user.note.likes + (isLiked ? 1 : 0);

                return (
                  <Card 
                    key={user.note.id} 
                    className="glass-effect border-white/20 backdrop-blur-md relative rounded-2xl shadow-2xl card-hover animate-fade-in-up" 
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {/* Ranking Badge */}
                    <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl border-4 border-white/30 z-10 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 ranking-badge-glow' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700' :
                      'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800'
                    }`}>
                      <span className="drop-shadow-lg text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </div>
                    
                    <CardHeader className="justify-between pt-6 pl-6 pb-4">
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          <img
                            src={user.photo ? `http://localhost:3000${user.photo}` : "/default-avatar.png"}
                            width={56}
                            height={56}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                            alt="user photo"
                            className="ring-4 ring-white/30 shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-lg font-bold text-white">{user.name}</h4>
                          <h5 className="text-sm text-white/70 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            {formatDate(user.note.createdAt)}
                          </h5>
                        </div>
                      </div>
                    </CardHeader>

                    <CardBody className="px-6 py-4 text-white">
                      <h6 className="text-xl font-bold mb-3 text-white">{user.note.header}</h6>
                      <p className="mb-4 text-white/90 leading-relaxed">{user.note.text || user.note.content || "İçerik yok"}</p>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-sm bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-4 py-2 rounded-full text-white border border-white/20">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {user.note.classname}
                        </span>

                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                            onPress={() => handleAddComment(user.note.id)}
                          >
                            <CommentIcon size={16} />
                            <span className="text-sm font-medium">Yorum</span>
                          </Button>

                          <Button
                            size="sm"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                              isLiked
                                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25"
                                : "bg-gray-200/20 text-white border border-white/30 hover:bg-white/30"
                            }`}
                            onPress={() => handleLike(user.note.id)}
                          >
                            <HeartIcon
                              filled={isLiked}
                              fill={isLiked ? "#ffffff" : "currentColor"}
                              size={16}
                              className={`transition-all ${isLiked ? "animate-pulse" : ""}`}
                            />
                            <span className="text-sm font-bold">{formatNumber(currentLikes)}</span>
                          </Button>

                          {userRole === "admin" && (
                            <Button
                              size="sm"
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                              onPress={() => handleDeleteNote(user.note.id)}
                            >
                              <span className="text-sm font-medium">🗑️ Sil</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-white/70 animate-fade-in-up">
              <div className="mb-4 text-6xl animate-float">📝</div>
              <p className="text-xl mb-2">Henüz public not yok</p>
              <p className="text-sm text-white/50">
                Tüm public notlar beğeni sayısına göre sıralanır
              </p>
            </div>
          )}
        </div>

        {/* Sağ Panel - YORUMLAR */}
        <div className="w-1/2 h-screen fixed right-0 bg-gradient-to-br from-red-800/90 to-pink-900/90 text-white overflow-y-auto p-8 shadow-2xl border-l border-red-500/30 glass-effect animate-slide-in-right">
          <div className="mb-8 text-center">
            <div className="animate-pulse-custom mb-4">
              <h3 className="text-3xl font-bold gradient-text drop-shadow-2xl">
                🏆 En Çok Beğenilen Public Yorumlar
              </h3>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 mx-auto rounded-full shimmer-effect"></div>
          </div>

          {/* Debug bilgisi */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-white/60 mb-6 text-center bg-black/30 p-3 rounded-xl border border-white/10 animate-fade-in-up">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Debug: {topUsers.filter(u => u.comment).length} public yorum gösteriliyor
              </span>
            </div>
          )}

          {topUsers.filter(user => user.comment && user.comment.isPublic).slice(0, 5).length > 0 ? (
            <div className="space-y-6">
              {topUsers.filter(user => user.comment && user.comment.isPublic).slice(0, 5).map((user: any, index: number) => (
                <Card 
                  key={user.comment.id} 
                  className={`glass-effect border-white/20 backdrop-blur-md relative rounded-2xl shadow-2xl card-hover animate-fade-in-up cursor-pointer transition-all duration-300 ${
                    selectedCommentId === user.comment.id ? 'ring-2 ring-blue-400/50 bg-blue-600/20' : ''
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => setSelectedCommentId(selectedCommentId === user.comment.id ? null : user.comment.id)}
                >
                  {/* Ranking Badge */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl border-4 border-white/30 z-10 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 ranking-badge-glow' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700' :
                    'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800'
                  }`}>
                    <span className="drop-shadow-lg text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </div>

                  <CardBody className="p-6">
                    {/* Hangi nota yapıldığı bilgisi */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-xs text-blue-300 font-semibold">Bu nota yapılan yorum:</span>
                      </div>
                      <div className="ml-6">
                        <h6 className="text-sm font-bold text-white mb-1">"{user.comment.note?.header || 'Başlık bulunamadı'}"</h6>
                        <p className="text-xs text-white/70 italic line-clamp-2">
                          {user.comment.note?.text || user.comment.note?.content ? 
                            (user.comment.note.text || user.comment.note.content).slice(0, 80) + '...' : 
                            'İçerik bulunamadı'
                          }
                        </p>
                        <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {user.comment.note?.classname || 'Sınıf bilgisi yok'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={user.photo ? `http://localhost:3000${user.photo}` : "/default-avatar.png"}
                          width={48}
                          height={48}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                          alt="user photo"
                          className="ring-4 ring-white/30 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-white">{user.name}</span>
                          <span className="inline-flex items-center bg-gradient-to-r from-green-500/30 to-emerald-500/30 px-3 py-1 rounded-full text-green-200 text-xs border border-green-400/30">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            Public
                          </span>
                        </div>
                        <p className="text-white/90 mb-3 leading-relaxed text-sm">{user.comment.text}</p>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                              </svg>
                              {formatDate(user.comment.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon size={12} fill="currentColor" />
                              {formatNumber(user.comment.likes)} beğeni
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {userRole === "admin" && (
                              <>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                                  onPress={() => handleEditComment(user.comment)}
                                >
                                  <PencilIcon size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg rounded-full px-3 py-1 hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                                  onPress={() => handleDeleteComment(user.comment.id)}
                                >
                                  <span className="text-xs">🗑️</span>
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              className={`rounded-full px-3 py-1 transition-all duration-300 transform hover:scale-105 ${
                                likedComments.has(user.comment.id) 
                                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25' 
                                  : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLikeComment(user.comment.id);
                              }}
                            >
                              <span className="text-xs flex items-center gap-1">
                                {likedComments.has(user.comment.id) ? "❤️" : "🤍"} {formatNumber(user.comment.likes)}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/70 animate-fade-in-up">
              <div className="mb-4 text-6xl animate-float">💬</div>
              <p className="text-xl mb-2">Henüz public yorum yok</p>
              <p className="text-sm text-white/50">
                Tüm public yorumlar beğeni sayısına göre sıralanır
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yorum Ekleme Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        backdrop="blur"
        placement="center"
        classNames={{
          base: "bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl animate-fade-in-up",
          header: "border-b border-gray-700/50 pb-6",
          footer: "border-t border-gray-700/50 pt-6",
          body: "py-8",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-4 text-white">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                  <CommentIcon size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Yorum Yap</h3>
                  <p className="text-sm text-gray-400 font-normal">
                    Düşüncelerini paylaş ve tartışmaya katıl ✨
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Textarea
                      label="Yorumunuz"
                      labelPlacement="outside"
                      placeholder="Düşüncelerini paylaş..."
                      value={commentText}
                      onValueChange={setCommentText}
                      minRows={4}
                      maxRows={6}
                      variant="faded"
                      className="w-full"
                      classNames={{
                        inputWrapper: "bg-gray-800/50 hover:border-purple-400 focus-within:border-purple-400 transition-all duration-300 min-h-[100px] max-h-[150px] rounded-xl border-2",
                        label: "text-gray-300 mb-3 font-semibold text-base",
                        input: "text-white resize-none placeholder:text-gray-500 text-base leading-relaxed",
                      }}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={`transition-colors ${commentText.length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
                        En az 10 karakter
                      </span>
                      <span 
                        className={`font-mono transition-colors ${
                          commentText.length < 10 ? 'text-red-400' : 
                          commentText.length > 500 ? 'text-yellow-400' : 'text-green-400'
                        }`}
                      >
                        {commentText.length}/1000
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isPublicComment ? 'bg-green-400/20' : 'bg-gray-600/20'}`}>
                          {isPublicComment ? (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-base font-bold text-white">
                            {isPublicComment ? "Herkese Açık" : "Özel Yorum"}
                          </span>
                          <p className="text-sm text-gray-400 mt-1">
                            {isPublicComment
                              ? "Herkes görebilir ve yanıtlayabilir"
                              : "Sadece sen görebilirsin"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        isSelected={isPublicComment}
                        onValueChange={setIsPublicComment}
                        color="secondary"
                        size="lg"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-purple-600 group-data-[selected=true]:to-pink-600"
                        }}
                      />
                    </div>
                  </div>

                  {/* Yorum İpuçları */}
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm text-blue-200/90">
                        Saygılı olun ve topluluk kurallarına uyun 🤝
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="gap-4">
                <Button 
                  variant="flat" 
                  color="danger" 
                  onPress={onClose}
                  className="font-semibold px-8 py-3 rounded-xl"
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  Vazgeç
                </Button>
                <Button
                  color="secondary"
                  variant="shadow"
                  onPress={handleSubmitComment}
                  isLoading={isSubmitting}
                  disabled={!commentText.trim() || commentText.length < 10}
                  className="font-semibold px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
                  startContent={
                    !isSubmitting && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )
                  }
                >
                  {isSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Yorum Düzenleme Modal */}
      {editingComment && (
        <Modal
          isOpen={isEditModalOpen}
          onOpenChange={onEditModalOpenChange}
          size="lg"
          backdrop="blur"
          placement="center"
          classNames={{
            base: "bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl",
            header: "border-b border-gray-700/50 pb-4",
            footer: "border-t border-gray-700/50 pt-4",
            body: "py-6",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <PencilIcon size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Yorumu Düzenle</h3>
                    <p className="text-sm text-gray-400 font-normal">
                      Yorumunu güncelle
                    </p>
                    
                  </div>
                </ModalHeader>

                <ModalBody>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Textarea
                        label="Yorumunuz"
                        labelPlacement="outside"
                        placeholder="Düşüncelerini paylaş..."
                        value={editingComment.text}
                        onValueChange={(value) => setEditingComment({ ...editingComment, text: value })}
                        minRows={3}
                        maxRows={5}
                        variant="faded"
                        className="w-full border-none"
                        classNames={{
                          inputWrapper: "bg-gray-800/50 hover:border-yellow-400 focus-within:border-yellow-400 transition-colors min-h-[80px] max-h-[120px]",
                          label: "text-gray-300 mb-2 font-medium text-sm",
                          input: "text-white resize-none placeholder:text-gray-500 text-sm leading-relaxed",
                        }}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded-lg ${editingComment.isPublic ? 'bg-green-400/20' : 'bg-gray-600/20'}`}>
                            {editingComment.isPublic ? (
                              <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white">{editingComment.isPublic ? "Herkese Açık" : "Özel Yorum"}</span>
                            <p className="text-xs text-gray-400 mt-0.5">{editingComment.isPublic ? "Herkes görebilir" : "Sadece sen görebilirsin"}</p>
                          </div>
                        </div>
                        <Switch
                          isSelected={editingComment.isPublic}
                          onValueChange={(isSelected) => setEditingComment({ ...editingComment, isPublic: isSelected })}
                          color="secondary"
                          size="sm"
                          classNames={{ wrapper: "group-data-[selected=true]:bg-purple-600" }}
                        />
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="gap-3">
                  <Button variant="flat" color="danger" onPress={onClose} className="font-semibold px-6">
                    Vazgeç
                  </Button>
                  <Button
                    color="secondary"
                    variant="shadow"
                    onPress={handleUpdateComment}
                    isLoading={isSubmitting}
                    disabled={!editingComment.text.trim()}
                    className="font-semibold px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Page;