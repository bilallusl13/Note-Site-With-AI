"use client";
import React, { useEffect, useState } from "react";
import {
  Calculator,
  Calendar,
  Smile,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/Inbox";
import ShieldIcon from "@mui/icons-material/Shield";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CancelIcon from "@mui/icons-material/Cancel";
import ScienceIcon from "@mui/icons-material/Science";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import SettingsIcon from "@mui/icons-material/Settings";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import toast from "react-hot-toast";
import NoteDetailModal from "../main/NoteDetailModal";
import { useRouter } from "next/navigation";
import NotificationsModal from "../main/NotificationsModal";

// 🔸 Note tip tanımı
interface Note {
  id: string;
  header: string;
  text: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  classname: string;
}

// 🔸 Tüm notları çekme fonksiyonu
const handleContent = async (): Promise<Note[] | undefined> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/notes/allnotes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      toast.error("Sunucu ile bağlanılamadı");
      return;
    }
    const data: Note[] = await response.json();
    return data;
  } catch (error) {
    toast.error(`Hata: ${error}`);
  }
};

const Navlayout: React.FC = () => {
  const [showCommand, setShowCommand] = useState(false);
  const [data, setData] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [word, setWord] = useState("");
  const [id, setId] = useState("");
  const router=useRouter()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      const result = await handleContent();
      if (result) setData(result);
    }
    fetchData();
  }, []);
  
  const handleOpen = (noteId: string) => {
    setId(noteId);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setId("");
  };

  return (
    <>
      <NoteDetailModal
        onClose={handleClose}
        isOpen={isOpen}
        noteId={id}
      />
      <NotificationsModal open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      
      <div id="side-nav" className="fixed top-0 left-0 h-full w-56 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl border-r border-purple-500/30 z-40 overflow-y-auto backdrop-blur-xl">
        {/* Header with animated background */}
        <div className="relative p-4 border-b border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse"></div>
          <h1 className="relative text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            ✨ Midnight Note
          </h1>
        </div>

        <div className="p-4 flex flex-col h-full">
          {/* Yeni Not Butonu - Enhanced */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log("Yeni not butonuna tıklandı");
              window.location.href = '/newnote';
            }}
            className="group w-full mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 border border-purple-400/30"
          >
            <AddIcon sx={{ fontSize: 20 }} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-white">✍️ Yeni Not</span>
          </button>
          
          {/* Navigation Menu */}
          <div className="flex flex-col gap-2 mb-8">
            <div 
              onClick={() => setShowCommand(true)} 
              className="group cursor-pointer hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
            >
              <SearchIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
              <span className="text-purple-100 group-hover:text-white">🔍 Search</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.preventDefault();
                console.log("Home butonuna tıklandı");
                window.location.href = '/';
              }} 
              className="group cursor-pointer hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
            >
              <HomeIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
              <span className="text-purple-100 group-hover:text-white">🏠 Home</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.preventDefault();
                console.log("Dashboard butonuna tıklandı");
                window.location.href = '/dashboard';
              }} 
              className="group cursor-pointer hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
            >
              <EventNoteIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
              <span className="text-purple-100 group-hover:text-white">📊 Dashboard</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.preventDefault();
                console.log("Notifications butonuna tıklandı");
                window.location.href = '/notifications';
              }} 
              className="group cursor-pointer hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
            >
              <InboxIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
              <span className="text-purple-100 group-hover:text-white">📬 Inbox</span>
            </div>
          </div>

          {/* Private Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-3 font-semibold text-purple-300 text-sm mb-4 px-2">
              <ShieldIcon sx={{ fontSize: 18 }} className="text-purple-400" />
              🔒 Private Workspace
            </h3>
            <div className="space-y-2">
              <div 
                className="group flex items-center gap-3 cursor-pointer hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Class Notes butonuna tıklandı");
                  window.location.href = "/main";
                }}
              >
                <EventNoteIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
                <span className="text-purple-100 group-hover:text-white">📚 Class Notes</span>
              </div>
              
              <div 
                className="group flex items-center gap-3 hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm cursor-pointer backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Your Plan butonuna tıklandı");
                  window.location.href = "/calendar";
                }}
              >
                <CancelIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
                <span className="text-purple-100 group-hover:text-white">📅 Your Plan</span>
              </div>
              
              <div 
                className="group flex items-center gap-3 hover:bg-purple-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm cursor-pointer backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Research butonuna tıklandı");
                  window.location.href = "/research";
                }}
              >
                <ScienceIcon sx={{ fontSize: 18 }} className="text-purple-400 group-hover:text-purple-300" />
                <span className="text-purple-100 group-hover:text-white">🔬 Research</span>
              </div>
            </div>
          </div>
          
          {/* Share Section */}
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-pink-300 text-sm px-2">🚀 Collaboration</h3>
            <div 
              className="group hover:bg-pink-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 cursor-pointer backdrop-blur-sm border border-pink-500/20 hover:border-pink-400/40"
              onClick={(e) => {
                e.preventDefault();
                console.log("Start Sharing butonuna tıklandı");
                window.location.href = "/share";
              }}
            >
              <EmergencyShareIcon sx={{ fontSize: 18 }} className="text-pink-400 group-hover:text-pink-300" />
              <span className="text-pink-100 group-hover:text-white">🌐 Start Sharing</span>
            </div>
          </div>
          
          {/* Tools Section */}
          <div className="mb-8">
            <h3 className="mb-4 font-semibold text-cyan-300 text-sm px-2">⚙️ Tools & Settings</h3>
            <div className="space-y-2">
              <div 
                className="group cursor-pointer hover:bg-cyan-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Settings butonuna tıklandı");
                  window.location.href = "/editsettings";
                }}
              >
                <SettingsIcon sx={{ fontSize: 18 }} className="text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-cyan-100 group-hover:text-white">⚙️ Settings</span>
              </div>
              
              <div 
                className="group cursor-pointer hover:bg-cyan-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40" 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Templates butonuna tıklandı");
                  window.location.href = "/templates";
                }}
              >
                <TempleBuddhistIcon sx={{ fontSize: 18 }} className="text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-cyan-100 group-hover:text-white">📄 Templates</span>
              </div>
              
              <div 
                className="group cursor-pointer hover:bg-orange-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-orange-500/20 hover:border-orange-400/40"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Çöp Kutusu butonuna tıklandı");
                  window.location.href = "/trash";
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} className="text-orange-400 group-hover:text-orange-300" />
                <span className="text-orange-100 group-hover:text-white">🗑️ Çöp Kutusu</span>
              </div>
            </div>
          </div>

          {/* Logout Button - Fixed at bottom */}
          <div className="mt-auto pt-6 border-t border-purple-500/20">
            <div 
              className="group cursor-pointer hover:bg-red-700/30 rounded-xl px-4 py-3 transition-all duration-300 text-sm flex items-center gap-3 backdrop-blur-sm border border-red-500/20 hover:border-red-400/40 transform hover:scale-105"
              onClick={(e) => {
                e.preventDefault();
                localStorage.clear();
                toast.success("Çıkış yapıldı! 👋");
                setTimeout(() => { window.location.href = "/login"; }, 500);
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} className="text-red-400 group-hover:text-red-300" />
              <span className="font-bold text-red-300 group-hover:text-red-200">🚪 Logout</span>
            </div>
          </div>
        </div>
      </div>

      {showCommand && (
        <CommandDemo
          data={data}
          onClose={() => setShowCommand(false)}
          onNoteSelect={handleOpen}
          word={word}
          setWord={setWord}
        />
      )}
    </>
  );
};

// 🔷 Komut Paleti (CommandDemo) Bileşeni
interface CommandDemoProps {
  data: Note[];
  onClose: () => void;
  onNoteSelect: (id: string) => void;
  setWord: (text: string) => void;
  word: string;
}

const CommandDemo: React.FC<CommandDemoProps> = ({
  data,
  onClose,
  onNoteSelect,
  word,
  setWord
}) => {
  return (
    <CommandDialog open={true} onOpenChange={onClose} className="rounded-2xl shadow-2xl border border-purple-300/50 bg-gradient-to-br from-white to-purple-50 max-w-lg mx-auto backdrop-blur-xl">
      <CommandInput
        placeholder="🔍 Not başlığı ara..."
        value={word}
        onValueChange={setWord}
        className="rounded-xl border border-purple-300/50 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 bg-white/90 backdrop-blur-sm"
      />
      <CommandList className="rounded-xl bg-white/95 max-h-80 overflow-y-auto backdrop-blur-sm">
        <CommandEmpty className="text-gray-500 py-8 text-center text-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🔍</span>
            <span>Hiç not bulunamadı</span>
          </div>
        </CommandEmpty>
        
        <CommandGroup heading="⚡ Hızlı Erişim">
          <CommandItem className="hover:bg-purple-100 rounded-xl transition-all p-3 cursor-pointer border border-transparent hover:border-purple-200">
            <Calendar className="cursor-pointer text-purple-600 mr-3" size={18} onClick={()=>window.location.href='/calendar'}/>
            <span className="cursor-pointer text-sm font-medium" onClick={()=>window.location.href='/calendar'}>📅 Takvim</span>
          </CommandItem>
          <CommandItem className="hover:bg-pink-100 rounded-xl transition-all p-3 cursor-pointer border border-transparent hover:border-pink-200">
            <Smile className="cursor-pointer text-pink-600 mr-3" size={18} onClick={()=>window.location.href='/emoji'}/>
            <span className="cursor-pointer text-sm font-medium" onClick={()=>window.location.href='/emoji'}>😊 Emoji Bul</span>
          </CommandItem>
          <CommandItem className="hover:bg-green-100 rounded-xl transition-all p-3 cursor-pointer border border-transparent hover:border-green-200">
            <Calculator className="cursor-pointer text-green-600 mr-3" size={18} onClick={()=>window.location.href='/calculator'} />
            <span className="cursor-pointer text-sm font-medium" onClick={()=>window.location.href='/calculator'}>🧮 Hesap Makinesi</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />
        
        <CommandGroup heading="📚 Notlarınız">
          {data
            .filter(note => note.header.toLowerCase().includes(word.toLowerCase()))
            .slice(0, 5)
            .map(note => (
              <CommandItem
                key={note.id}
                onSelect={() => onNoteSelect(note.id)}
                className="hover:bg-purple-100 rounded-xl transition-all p-3 cursor-pointer border border-transparent hover:border-purple-200"
              >
                <EventNoteIcon className="mr-3 h-5 w-5 text-purple-600" />
                <span className="text-sm truncate font-medium">{note.header}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default Navlayout;
