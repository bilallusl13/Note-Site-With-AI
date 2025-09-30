"use client"
import { Textarea, Button } from '@heroui/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRef } from 'react';
// Kullanıcı tipi
interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface GetUserResponse {
  user: User;
}

// Hata mesajı işleyici
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if ((error as any)?.message) return (error as any).message;
  return 'Bilinmeyen hata oluştu';
};

// Kullanıcı verisini getir
const handleUser = async (): Promise<GetUserResponse | null> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token bulunamadı");
      return null;
    }

    const response = await fetch("/api/user/getuser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error('Get user error:', response.status, response.statusText);
      toast.error("Sunucu ile iletişim kurulamadı");
      return null;
    }

    const result: GetUserResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Get user catch error:', error);
    toast.error(`Kullanıcı bilgisi alınamadı: ${getErrorMessage(error)}`);
    return null;
  }
};

// Fotoğraf güncelleme
const handleUpdatePhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/user/updateuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photo: photoUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update error:', errorData);
      toast.error("Fotoğraf güncellenemedi");
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update catch error:', error);
    toast.error("Güncelleme hatası: " + getErrorMessage(error));
    return false;
  }
};

// Ana bileşen
const Page = () => {
  const [data, setData] = useState<User | null>(null);
  const [photoInput, setPhotoInput] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
     const fileInputRef = useRef<any>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem("token");
      try {
        toast.loading("Fotoğraf yükleniyor...", { id: "upload" });
        const response = await fetch("/api/user/uploadphoto", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          toast.error("Fotoğraf yüklenemedi", { id: "upload" });
          setIsUploading(false);
          return;
        }

        const result = await response.json();

        if (result.url) {
          toast.loading("Fotoğraf güncelleniyor...", { id: "upload" });
          const updateSuccess = await handleUpdatePhoto(result.url);

          if (updateSuccess) {
            const userData = await handleUser();
            if (userData && userData.user) {
              setData(userData.user);
              toast.success("Fotoğraf başarıyla güncellendi!", { id: "upload" });
            }
          }
        } else {
          toast.error("Fotoğraf URL'si alınamadı", { id: "upload" });
        }
      } catch (error) {
        toast.error("Bir hata oluştu: " + getErrorMessage(error), { id: "upload" });
      } finally {
        setIsUploading(false);
        setSelectedImage(null);
      }
    }
  };

  useEffect(() => {
    async function fetchUser() {
      const result = await handleUser();
      if (result && result.user) {
        setData(result.user);
        setName(result.user.name || '');
        setEmail(result.user.email || '');
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleUpdateUser = async (type: 'name' | 'email' | 'both' = 'both') => {
    if ((type === 'name' || type === 'both') && !name.trim()) {
      toast.error("İsim boş olamaz");
      return;
    }

    if ((type === 'email' || type === 'both')) {
      if (!email.trim()) {
        toast.error("Email boş olamaz");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Geçerli bir email adresi girin");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const updateData: Partial<User> = {
        ...(type === 'name' || type === 'both' ? { name: name.trim() } : {}),
        ...(type === 'email' || type === 'both' ? { email: email.trim() } : {})
      };

      const response = await fetch("/api/user/updateuser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result: GetUserResponse = await response.json();
        setData(result.user);
        setName(result.user.name);
        setEmail(result.user.email);
        toast.success("Güncelleme başarılı!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || "Sunucu hatası");
      }
    } catch (error) {
      toast.error(`Güncelleme hatası: ${getErrorMessage(error)}`);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div style={{ 
        backgroundImage: "url('/ng.jpg')", 
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center', 
        minHeight: '100vh', 
        minWidth:'100wh',
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
      }}>
       <div className='bg-gradient-to-l from-indigo-500 via-sky-500 to-pink-500 w-[700px] min-h-[650px] text-white border-2 border-white/30 rounded-2xl shadow-2xl backdrop-blur-sm p-8'>
         {data && (
           <div className="flex flex-col items-center space-y-6">
             {/* Profil Fotoğrafı */}
             <div className="relative group">
               {data.photo ? (
                 <div className="relative">
                   <Image 
                     src={data.photo} 
                     alt="profile photo" 
                     width={150} 
                     height={150} 
                     className="rounded-full border-4 border-white/50 shadow-lg object-cover transition-all duration-300 hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full flex items-center justify-center cursor-pointer">
                     <span className="text-white text-sm font-medium hover:underline" 
                              onClick={() => fileInputRef.current.click()}
                     >Fotoğrafı Değiştir</span>
                   </div>
                 </div>
               ) : (
                 <div className="w-[150px] h-[150px] bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-gray-600 text-4xl font-bold border-4 border-white/50 shadow-lg">
                   ?
                 </div>
               )}
             </div>
             {/* Kullanıcı Adı */}
             <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
               {data.name}
             </h2>
             {/* Fotoğraf Güncelleme Seçenekleri */}
             <div className="w-full max-w-md space-y-4">
               {/* Dosya Yükleme */}
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow">
                 <label className="block text-sm font-medium mb-2 text-white/90">
                   💾 Dosyadan Yükle
                 </label>
                 <input 
                 ref={fileInputRef}
                   type="file" 
                   accept="image/*" 
                   onChange={handleFileChange}
                   className="w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r from-white/20 to-pink-200 file:text-white hover:file:bg-white/30 file:transition-all file:duration-200 cursor-pointer"
                   disabled={isUploading}
                 />
                 {isUploading && (
                   <div className="mt-2 flex items-center space-x-2">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                     <span className="text-sm text-white/80">Yükleniyor...</span>
                   </div>
                 )}
               </div>
               {/* İsim Güncelleme */}
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow">
                 <label className="block text-sm font-medium mb-2 text-white/90">
                   ✏️ İsim Düzenle
                 </label>
                 <Textarea 
                   value={name} 
                   onChange={(e) => setName(e.target.value)} 
                   label="Adınız" 
                   placeholder={data.name}
                   className="mb-3"
                   variant="bordered"
                   classNames={{
                     inputWrapper: "bg-white/20 text-white border border-white/30 rounded-lg shadow focus:ring-2 focus:ring-indigo-400",
                     input: "text-white placeholder:text-white/70",
                   }}
                 />
                 <Button 
                   onClick={() => handleUpdateUser('name')}
                   disabled={isUpdating || !name.trim() || name === data.name}
                   className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-700 hover:to-pink-700 text-white border border-white/30 shadow"
                   isLoading={isUpdating}
                 >
                   {isUpdating ? "Güncelleniyor..." : "İsmi Güncelle"}
                 </Button>
               </div>
               {/* Email Güncelleme */}
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow">
                 <label className="block text-sm font-medium mb-2 text-white/90">
                   📧 Email Düzenle
                 </label>
                 <Textarea 
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)} 
                   label="Email" 
                   placeholder={data.email}
                   className="mb-3"
                   variant="bordered"
                   classNames={{
                     inputWrapper: "bg-white/20 text-white border border-white/30 rounded-lg shadow focus:ring-2 focus:ring-pink-400",
                     input: "text-white placeholder:text-white/70",
                   }}
                 />
                 <Button 
                   onClick={() => handleUpdateUser('email')}
                   disabled={isUpdating || !email.trim() || email === data.email}
                   className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-700 hover:to-indigo-700 text-white border border-white/30 shadow"
                   isLoading={isUpdating}
                 >
                   {isUpdating ? "Güncelleniyor..." : "Email Güncelle"}
                 </Button>
               </div>
               {/* Seçilen Fotoğraf Önizlemesi */}
               {selectedImage && (
                 <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow">
                   <label className="block text-sm font-medium mb-2 text-white/90">
                     👁️ Önizleme
                   </label>
                   <div className="flex justify-center">
                     <img
                       src={selectedImage}
                       alt="Seçilen"
                       className="w-32 h-32 object-cover rounded-lg border-2 border-white/30 shadow-lg"
                     />
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}
       </div>
      </div>
    </>
  )
}

export default Page
