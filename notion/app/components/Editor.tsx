"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link, Image as ImageIcon, Code, Quote } from "lucide-react";

interface EditorProps {
  onChange: (content: string) => void;
  editable: boolean;
  initialContent: string;
  isExpanded: boolean;
  placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ 
  onChange, 
  editable, 
  initialContent, 
  isExpanded, 
  placeholder = "Notunuzu buraya yazın..." 
}) => {
  const [content, setContent] = useState(initialContent);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  const formatText = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    handleContentChange(newContent);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <div className="relative w-full">
      {/* Toolbar */}
      {isExpanded && editable && (
        <div className={`transition-all duration-300 ${showToolbar ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'} overflow-hidden`}>
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Kalın (Bold)"
              >
                <Bold size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="İtalik (Italic)"
              >
                <Italic size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
              <button
                onClick={() => formatText('code')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Kod (Code)"
              >
                <Code size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <button
                onClick={() => formatText('list')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Liste (List)"
              >
                <List size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
              <button
                onClick={() => formatText('quote')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Alıntı (Quote)"
              >
                <Quote size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Bağlantı Ekle"
              >
                <Link size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
              <button
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                title="Resim Ekle"
              >
                <ImageIcon size={16} className="text-gray-600 group-hover:text-blue-600" />
              </button>
            </div>
            
            <div className="ml-auto">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {content.length} karakter
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onFocus={() => setShowToolbar(true)}
          onBlur={() => setTimeout(() => setShowToolbar(false), 200)}
          placeholder={placeholder}
          className={`w-full p-4 border-0 resize-none outline-none transition-all duration-300 bg-gradient-to-br from-white to-gray-50 focus:from-white focus:to-blue-50 focus:ring-2 focus:ring-blue-400 rounded-lg shadow-sm hover:shadow-md ${
            isExpanded ? 'min-h-[200px]' : 'h-12'
          } ${!editable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={!editable}
          style={{
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            lineHeight: '1.6',
            fontSize: '14px'
          }}
        />
        
        {/* Placeholder enhancement for expanded mode */}
        {isExpanded && !content && editable && (
          <div className="absolute top-4 left-4 pointer-events-none text-gray-400 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>Fikirlerinizi yazın...</span>
              </div>
              <div className="text-xs text-gray-300">
                Markdown desteklenir: **kalın**, *italik*, `kod`,  alıntı
              </div>
            </div>
          </div>
        )}
        
        {/* Focus indicator */}
        {isExpanded && (
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {showToolbar && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Editör aktif</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Word count and stats for expanded mode */}
      {isExpanded && content && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-b-lg border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>📝 {content.split(/\s+/).filter(word => word.length > 0).length} kelime</span>
            <span>📄 {content.split('\n').length} satır</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full ${
              content.length < 100 ? 'bg-red-100 text-red-600' :
              content.length < 500 ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              {content.length} karakter
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
