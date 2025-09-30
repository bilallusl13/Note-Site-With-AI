'use client';

import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  noteId?: string;
  onFileUploaded?: (file: any) => void;
  onFileDeleted?: (fileId: string) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  noteId,
  onFileUploaded,
  onFileDeleted,
  maxFiles = 10,
  maxSizeInMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx'],
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUpLoading, setIsUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const url = noteId
          ? `/api/files/list?noteId=${noteId}`
          : '/api/files/list';
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files);
        }
      } catch (error: any) {
        toast.error('Dosyalar yüklenemedi: ' + (error.message || error));
      }
    };
    loadFiles();
  }, [noteId]);

  // Dosya tipini kontrol et
  const isFileTypeAllowed = (file: File): boolean => {
    return acceptedTypes.some((type) => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === 'text/*') return file.type.startsWith('text/');
      if (type.startsWith('.'))
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      return file.type === type;
    });
  };

  const isFileSizeAllowed = (file: File) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  };

  const uploadedFile = async (file: File) => {
    if (!isFileTypeAllowed(file)) {
      setError('Bu dosya tipi desteklenmiyor');
      return;
    }

    if (!isFileSizeAllowed(file)) {
      setError(`Dosya boyutu ${maxSizeInMB}MB'dan büyük olamaz`);
      return;
    }

    if (files.length >= maxFiles) {
      setError(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    setIsUpLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (noteId) {
        formData.append('noteId', noteId);
      }
      let token = localStorage.getItem('token');
      if (!token) {
        // test için demo token
        token = 'demo-token-for-testing';
      }
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yükleme başarısız');
      }

      const result = await response.json();
      const newFile = result.file;
      setFiles((prev) => [...prev, newFile]);
      onFileUploaded?.(newFile);
      toast.success('Dosya başarıyla yüklendi');
    } catch (error: any) {
      toast.error(error.message || 'Yükleme sırasında hata oluştu');
    } finally {
      setIsUpLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/delete?id=${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Silme başarısız');
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      onFileDeleted?.(fileId);
    } catch (error: any) {
      setError(error.message || 'Silme başarısız');
    }
  };

  // Drag event handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) {
      toast.error('Dosya bulunamadı');
      return;
    }
    droppedFiles.forEach((file) => {
      uploadedFile(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadedFile);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dosya ikonunu seç
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-600 mb-2">
          Dosyaları buraya sürükleyip bırakın
        </p>
        <p className="text-sm text-gray-500 mb-4">
          veya dosya seçmek için tıklayın
        </p>
        <p className="text-xs text-gray-400">
          Desteklenen formatlar: Resim, PDF, Word, Text dosyaları
          <br />
          Maksimum dosya boyutu: {maxSizeInMB}MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isUpLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-600 text-sm">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Dosya yükleniyor...
          </p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Yüklenen Dosyalar</h4>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => deleteFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`Delete file ${file.originalName}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
