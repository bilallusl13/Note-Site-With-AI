"use client";

import React, { useState, useRef, useEffect } from "react";

export default function EmojiPicker() {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Simple emoji list for testing
  const simpleEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬"
  ];

  const handleEmojiClick = (emoji: string) => {
    console.log("Emoji clicked:", emoji); // Debug log
    setText((prev) => {
      const newText = prev + emoji;
      console.log("New text:", newText); // Debug log
      return newText;
    });
    
    // Focus back to textarea
    setTimeout(() => {
      inputRef.current?.focus();
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 100);
  };

  // Focus textarea when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-700 to-purple-500 p-4" style={{ overflow: 'visible' }}>
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-white text-2xl font-bold text-center mb-4">Emoji Picker Test</h1>
        
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bir şeyler yaz... 😊"
          className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
        />

        <div className="flex justify-center">
          <button
            onClick={() => setShowPicker((prev) => !prev)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showPicker ? "Emoji Seçiciyi Kapat" : "Emoji Ekle"}
          </button>
        </div>

        {showPicker && (
          <div className="bg-white rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-10 gap-2">
              {simpleEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Debug info */}
        <div className="text-white text-sm bg-black bg-opacity-50 p-4 rounded-lg">
          <p><strong>Mevcut metin:</strong> {text}</p>
          <p><strong>Metin uzunluğu:</strong> {text.length}</p>
          <p><strong>Picker açık:</strong> {showPicker ? "Evet" : "Hayır"}</p>
        </div>
      </div>
    </div>
  );
}
