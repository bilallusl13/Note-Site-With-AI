"use client"
import React, { useState, useEffect } from 'react'
import { 
  WhatsappShareButton, 
  FacebookShareButton, 
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  EmailShareButton
} from 'react-share';
import { 
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  EmailIcon
} from 'react-share';
import { Copy, Share2, CheckCircle, Upload, File } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import FileUpload from '@/components/ui/FileUpload';

const SharePage = () => {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const title = "Bu harika notu sizinle paylaşmak istiyorum!";
  const description = "Notion benzeri uygulamamda oluşturduğum bu notu inceleyin.";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Bağlantı kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
      toast.error('Kopyalama başarısız oldu');
    }
  };

  // Manuel paylaşım fonksiyonları
  const shareManually = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} ile paylaşılıyor...`);
  };

  // Dosya yüklendiğinde çalışacak fonksiyon
  const handleFileUploaded = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
    toast.success(`${file.originalName} başarıyla yüklendi!`);
  };

  // Dosya silindiğinde çalışacak fonksiyon
  const handleFileDeleted = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('Dosya başarıyla silindi!');
  };

  const shareButtons = [
    {
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      name: 'WhatsApp',
      color: '#25D366',
      props: { url, title },
      platform: 'whatsapp'
    },
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      name: 'Facebook',
      color: '#1877F2',
      props: { url, quote: title },
      platform: 'facebook'
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      name: 'Twitter',
      color: '#1DA1F2',
      props: { url, title },
      platform: 'twitter'
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      name: 'LinkedIn',
      color: '#0A66C2',
      props: { url, title, summary: description },
      platform: 'linkedin'
    },
    {
      Component: TelegramShareButton,
      Icon: TelegramIcon,
      name: 'Telegram',
      color: '#26A5E4',
      props: { url, title },
      platform: 'telegram'
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      name: 'E-posta',
      color: '#D44638',
      props: { url, subject: title, body: description },
      platform: 'email'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Share2 className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Not Paylaş</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Bu harika notu arkadaşlarınla paylaş ve birlikte keşfedin
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* URL Copy Section */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3 text-lg">
              📎 Bağlantı Kopyala
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-black/20 rounded-lg p-3 border border-white/10">
                <input
                  type="text"
                  value={url || 'URL yükleniyor...'}
                  readOnly
                  className="w-full bg-transparent text-white text-sm outline-none"
                  placeholder="URL yükleniyor..."
                />
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!url}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  copied 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : url 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white font-semibold text-lg">
                📁 Dosya Yükleme
              </label>
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{showFileUpload ? 'Gizle' : 'Dosya Yükle'}</span>
              </button>
            </div>
            
            {showFileUpload && (
              <div className="bg-black/20 rounded-xl border border-white/10 p-6">
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onFileDeleted={handleFileDeleted}
                  maxFiles={5}
                  maxSizeInMB={10}
                />
              </div>
            )}

            {/* Uploaded Files Summary */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <File className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">
                    {uploadedFiles.length} dosya yüklendi
                  </span>
                </div>
                <div className="text-sm text-green-300">
                  Dosyalarınız güvenle kaydedildi ve paylaşıma hazır.
                </div>
              </div>
            )}
          </div>

          {/* Social Share Section */}
          <div>
            <label className="block text-white font-semibold mb-4 text-lg">
              🌐 Sosyal Medyada Paylaş
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shareButtons.map(({ Component, Icon, name, color, props, platform }) => (
                <div key={name} className="group">
                  {/* React Share Button */}
                  <Component
                    {...props}
                    onShareWindowClose={() => {
                      console.log(`${name} paylaşım penceresi kapandı`);
                    }}
                    className="hidden" // React share butonunu gizle, sadece manuel paylaşım kullan
                  >
                    <div></div>
                  </Component>
                  
                  {/* Manuel Paylaşım Butonu */}
                  <div 
                    onClick={() => url && shareManually(platform)}
                    className={`bg-white/10 border border-white/20 rounded-xl p-4 transition-all duration-300 ${
                      url 
                        ? 'hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-transform ${
                        url ? 'group-hover:scale-110' : ''
                      }`}>
                        <Icon size={32} round />
                      </div>
                      <span className="text-white font-medium text-sm">{name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Preview */}
          <div className="mt-8 p-6 bg-black/20 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">📝</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Paylaşılan Not</h3>
                <p className="text-gray-400 text-sm">Notion benzeri uygulama</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bu not, güçlü ve kullanıcı dostu arayüzümüz ile oluşturulmuştur. 
              Kolayca düzenleyebilir, organize edebilir ve arkadaşlarınızla paylaşabilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            💡 Notlarınızı organize edin, paylaşın ve birlikte çalışın
          </p>
        </div>
      </div>
    </div>
  )
}

export default SharePage