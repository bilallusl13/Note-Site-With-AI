"use client"
import React, { useEffect, useState, RefObject } from 'react';
import toast from 'react-hot-toast';
import { Textarea, Button } from '@heroui/react';

// Props tipi
interface CommentProps {
  commentId: any;
  onClose: () => void;
  isOpen: boolean;
  anchorRef?: RefObject<HTMLButtonElement>;
}

// Icon component
const HeartIcon = ({ fill = "currentColor", filled, size, height, width, ...props }: any) => {
  return (
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
};

// API: yorum gönderme
const postComment = async (noteId: string, commentText: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const response = await fetch("/api/comments/createcomments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        noteId: noteId,
        text: commentText,
        isPublic: true
      }),
    });

    if (!response.ok) {
      toast.error("Sunucu hatası oluştu!");
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    toast.error(`${error}`);
    return null;
  }
};

// Component
const AddComment: React.FC<CommentProps> = ({ commentId, onClose, isOpen, anchorRef }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPopoverStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      });
    }
  }, [isOpen, anchorRef]);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Yorum boş olamaz!");
      return;
    }

    if (!commentId) {
      toast.error("Not ID bulunamadı!");
      return;
    }

    setLoading(true);
    const result = await postComment(commentId, commentText);

    if (result?.response) {
      toast.success("Yorum gönderildi!");
      setCommentText('');
      onClose(); // Modal'ı kapat
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={popoverStyle} className="overflow-visible">
      <div className="w-full max-w-md bg-gradient-to-bl from-purple-800 to-red-700 rounded-2xl shadow-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl font-bold hover:scale-110 transition"
        >
          ×
        </button>

        <h3 className="text-white text-2xl font-bold mb-4 text-center">Yorum Ekle ✨</h3>

        <Textarea
          label="Yorumunuz"
          placeholder="Yorumunuzu girin..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          minRows={3}
          className="mb-4"
        />

        <div className="flex gap-2 mb-6">
          <Button
            onClick={handleAddComment}
            disabled={loading || !commentText.trim()}
            className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg flex-1"
          >
            <HeartIcon filled={true} fill="#e11d48" size={20} width={20} height={25} />
            <span className="ml-2">Gönder</span>
          </Button>

          <Button
            onClick={onClose}
            className="bg-gradient-to-tr from-red-500 to-yellow-500 text-white shadow-lg flex-1"
          >
            Kapat
          </Button>
        </div>

        {/* İsteğe bağlı olarak yorumlar burada listelenebilir */}
        <div className="bg-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 className="text-white font-semibold mb-2">Yorumlar</h4>
          <div className="text-white/70">Henüz yorum gösterimi eklenmedi.</div>
        </div>
      </div>
    </div>
  );
};

export default AddComment;
