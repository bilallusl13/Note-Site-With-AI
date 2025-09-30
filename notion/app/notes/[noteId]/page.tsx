"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Note {
  id: string;
  header: string;
  content: string;
}

const NotePage = ({ params }: { params: { noteId: string } }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }
        const response = await fetch(`/api/notes/${params.noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          let errorMsg = "Not getirilemedi.";
          try {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
          } catch {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setNote(data);
        
        // Content'i doğru şekilde yükle
        if (data.content) {
          if (typeof data.content === 'string') {
            setContent(data.content);
          } else {
            // Eğer content object ise, JSON olarak göster
            setContent(JSON.stringify(data.content, null, 2));
          }
        } else {
          setContent(''); // Boş content için
        }
      } catch (error: any) {
        toast.error(error.message || "Not yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.noteId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notes/${params.noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content }),
      });

      if (!response.ok) {
        throw new Error("Kaydetme başarısız.");
      }
      toast.success("Not kaydedildi!");
    } catch (error) {
      toast.error("Not kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Tab desteği
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const insertMarkdownSyntax = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = selectedText || placeholder;
    
    let beforeText = content.substring(0, start);
    let afterText = content.substring(end);
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
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Gelişmiş Markdown preview renderer
  const renderMarkdownPreview = (text: string) => {
    return text
      // Kod blokları
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
      // Inline kod
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm">$1</code>')
      // Başlıklar
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-6 text-gray-900">$1</h1>')
      // Kalın ve italik
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Liste
      .replace(/^- (.*$)/gm, '<li class="ml-6 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 mb-1">$1. $2</li>')
      // Linkler
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      // Yeni satırlar
      .replace(/\n/g, '<br>');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Not bulunamadı</h2>
          <p className="text-gray-500">Bu not mevcut değil veya erişim yetkiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Geri
              </button>
              <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">
                {note?.header || 'Not Yükleniyor...'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isPreview 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isPreview ? '📝 Düzenle' : '👁️ Önizleme'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </span>
                ) : (
                  '💾 Kaydet'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isPreview && (
          /* Toolbar */
          <div className="bg-white rounded-lg shadow-sm border mb-4 p-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => insertMarkdownSyntax('bold', 'kalın yazı')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
                title="Kalın (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => insertMarkdownSyntax('italic', 'eğik yazı')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm italic transition-colors"
                title="İtalik (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => insertMarkdownSyntax('code', 'kod')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-mono transition-colors"
                title="Kod"
              >
                &lt;/&gt;
              </button>
              <button
                onClick={() => insertMarkdownSyntax('codeblock', 'kod bloğu')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                title="Kod Bloğu"
              >
                📄
              </button>
              <button
                onClick={() => insertMarkdownSyntax('heading', 'Başlık')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
                title="Başlık"
              >
                H2
              </button>
              <button
                onClick={() => insertMarkdownSyntax('list', 'Liste öğesi')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                title="Liste"
              >
                •
              </button>
              <button
                onClick={() => insertMarkdownSyntax('link', 'bağlantı metni')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                title="Bağlantı"
              >
                🔗
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isPreview ? (
            /* Preview Mode */
            <div className="p-6">
              <div className="prose prose-gray max-w-none">
                <div 
                  className="min-h-96 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdownPreview(content) 
                  }}
                />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="relative">
              <textarea
                id="content-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Notunuzu buraya yazın... (Markdown desteklenir)

📝 Örnek kullanım:
## Başlık
**Kalın yazı**
*İtalik yazı*
\`kod\`
- Liste öğesi
[Bağlantı](url)

\`\`\`
kod bloğu
\`\`\`

### Alt başlık
Normal metin devam eder...`}
                className="w-full p-6 border-0 resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-6 placeholder-gray-400"
                style={{ 
                  minHeight: '600px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
              />
              
              {/* Character count and status */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm border">
                  {content.length} karakter
                </div>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm border border-green-200">
                  ✓ Otomatik kaydet aktif
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keyboard shortcuts */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="font-medium mb-3 text-gray-900">⌨️ Klavye Kısayolları</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Kaydet</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Girinti</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd>
              </div>
              <div className="flex justify-between">
                <span>Önizleme</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + P</kbd>
              </div>
            </div>
          </div>

          {/* Markdown syntax help */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="font-medium mb-3 text-gray-900">📚 Markdown Sözdizimi</div>
            <div className="space-y-2 text-sm text-gray-600">
              <div><code className="bg-gray-100 px-1 rounded">**kalın**</code> → <strong>kalın</strong></div>
              <div><code className="bg-gray-100 px-1 rounded">*italik*</code> → <em>italik</em></div>
              <div><code className="bg-gray-100 px-1 rounded">`kod`</code> → <code className="bg-gray-100 px-1 rounded">kod</code></div>
              <div><code className="bg-gray-100 px-1 rounded">## Başlık</code> → Başlık</div>
              <div><code className="bg-gray-100 px-1 rounded">- Liste</code> → • Liste</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
