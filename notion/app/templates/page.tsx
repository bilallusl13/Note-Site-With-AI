"use client";
import { useState } from "react";
import { Copy, Download, Star, Clock, BookOpen, Briefcase, Heart, FileText, Brain, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  icon: React.ReactNode;
  color: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: "1",
    title: "Ders Notları Şablonu",
    description: "Akademik dersler için yapılandırılmış not alma şablonu",
    category: "Eğitim",
    content: `# 📚 Ders Notları - [Ders Adı]

## 📅 Tarih: [TARİH]
## 👩‍🏫 Öğretmen: [ÖĞRETMEN ADI]
## 📖 Konu: [KONU]

---

## 🎯 Öğrenme Hedefleri
- [ ] 
- [ ] 
- [ ] 

## 📝 Ana Notlar

### 🔍 Önemli Kavramlar
- **Kavram 1:** 
- **Kavram 2:** 
- **Kavram 3:** 

### 💡 Örnekler
1. 
2. 
3. 

## ❓ Sorular
- 
- 
- 

## 📌 Ödev/Görevler
- [ ] 
- [ ] 

## 🔄 Özet
`,
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    tags: ["eğitim", "ders", "akademik"]
  },
  {
    id: "2",
    title: "Toplantı Notları",
    description: "İş toplantıları için profesyonel not şablonu",
    category: "İş",
    content: `# 🤝 Toplantı Notları

## 📅 Tarih: [TARİH]
## ⏰ Saat: [SAAT]
## 📍 Yer: [KONUM]
## 👥 Katılımcılar: [KATILIMCILAR]

---

## 🎯 Toplantı Amacı
[AMAÇ]

## 📋 Gündem
1. 
2. 
3. 

## 💬 Tartışma Konuları

### Konu 1:
- **Durum:** 
- **Öneriler:** 
- **Karar:** 

### Konu 2:
- **Durum:** 
- **Öneriler:** 
- **Karar:** 

## ✅ Aksiyonlar
| Görev | Sorumlu | Tarih |
|-------|---------|-------|
|       |         |       |
|       |         |       |

## 📝 Notlar
`,
    icon: <Briefcase className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    tags: ["iş", "toplantı", "profesyonel"]
  },
  {
    id: "3",
    title: "Günlük Planlama",
    description: "Günlük hedefler ve görevler için planlama şablonu",
    category: "Kişisel",
    content: `# 🌅 Günlük Plan - [TARİH]

## 🎯 Bugünün Hedefleri
1. 
2. 
3. 

## ⏰ Zaman Çizelgesi
| Saat | Aktivite | Durum |
|------|----------|-------|
| 09:00 |          | ⭕     |
| 10:00 |          | ⭕     |
| 11:00 |          | ⭕     |
| 12:00 |          | ⭕     |
| 13:00 |          | ⭕     |
| 14:00 |          | ⭕     |
| 15:00 |          | ⭕     |
| 16:00 |          | ⭕     |
| 17:00 |          | ⭕     |

## 📋 Yapılacaklar Listesi
- [ ] **Yüksek Öncelik:**
- [ ] **Orta Öncelik:**
- [ ] **Düşük Öncelik:**

## 💡 Bugünün Motivasyonu
"[MOTİVASYON SÖZÜ]"

## 🌟 Başarılar
- 
- 
- 

## 📝 Notlar
`,
    icon: <Calendar className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    tags: ["planlama", "günlük", "kişisel"]
  },
  {
    id: "4",
    title: "Proje Dokümantasyonu",
    description: "Yazılım projeleri için kapsamlı dokümantasyon şablonu",
    category: "Teknoloji",
    content: `# 🚀 Proje Dokümantasyonu - [PROJE ADI]

## 📋 Proje Bilgileri
- **Proje Adı:** [PROJE ADI]
- **Versiyon:** [VERSİYON]
- **Tarih:** [TARİH]
- **Geliştirici:** [İSİM]

---

## 🎯 Proje Amacı
[AMAÇ AÇIKLAMASI]

## ✨ Özellikler
- [ ] Özellik 1
- [ ] Özellik 2
- [ ] Özellik 3

## 🛠️ Teknolojiler
- **Frontend:** 
- **Backend:** 
- **Veritabanı:** 
- **Diğer:** 

## 📐 Kurulum
\`\`\`bash
# Gereksinimler
npm install

# Başlatma
npm start
\`\`\`

## 🏗️ Proje Yapısı
\`\`\`
src/
├── components/
├── pages/
├── utils/
└── styles/
\`\`\`

## 🔧 API Endpoints
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET    | /api/    | API durumu |
| POST   | /api/    | Veri ekleme |

## 🐛 Bilinen Sorunlar
- 
- 

## 📝 Changelog
### v1.0.0
- İlk sürüm
`,
    icon: <FileText className="w-6 h-6" />,
    color: "from-indigo-500 to-blue-500",
    tags: ["teknoloji", "proje", "dokümantasyon"]
  },
  {
    id: "5",
    title: "Araştırma Notları",
    description: "Akademik araştırmalar için detaylı not şablonu",
    category: "Araştırma",
    content: `# 🔬 Araştırma Notları

## 📚 Kaynak Bilgileri
- **Başlık:** [BAŞLIK]
- **Yazar(lar):** [YAZARLAR]
- **Yayın Tarihi:** [TARİH]
- **Kaynak:** [KAYNAK]
- **URL:** [URL]

---

## 🎯 Araştırma Sorusu
[ARAŞTIRMA SORUSU]

## 📋 Hipotez
[HİPOTEZ]

## 🔍 Metodoloji
- **Yöntem:** 
- **Örneklem:** 
- **Veri Toplama:** 

## 📊 Bulgular

### Ana Bulgular
1. 
2. 
3. 

### İstatistikler
- 
- 

## 💭 Analiz ve Yorum
[ANALİZ]

## 🔗 İlgili Kaynaklar
- [Kaynak 1]()
- [Kaynak 2]()
- [Kaynak 3]()

## 📝 Kişisel Notlar
`,
    icon: <Brain className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    tags: ["araştırma", "akademik", "bilim"]
  },
  {
    id: "6",
    title: "Kişisel Günlük",
    description: "Günlük yaşam için özel günlük şablonu",
    category: "Kişisel",
    content: `# 💖 Günlük - [TARİH]

## 🌤️ Bugünün Havası
**Hava Durumu:** [HAVA]
**Ruh Hali:** [RUH HALİ] 

---

## 🌅 Sabah Düşünceleri
[SABAH DÜŞÜNCELERİ]

## 📅 Bugün Yaşananlar
[GÜNÜN OLAYLARI]

## 😊 Minnettarlık
Bugün minnetar olduğum 3 şey:
1. 
2. 
3. 

## 🎯 Başarılar
- 
- 

## 🤔 Zorlanılan Konular
- 
- 

## 💡 Öğrendiklerim
[ÖĞRENİLENLER]

## 🌙 Akşam Düşünceleri
[AKŞAM DÜŞÜNCELERİ]

## 🔮 Yarın İçin
[YARINKI PLANLAR]

---
*"Her gün yeni bir başlangıçtır."*
`,
    icon: <Heart className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    tags: ["günlük", "kişisel", "yaşam"]
  }
];

const categories = ["Tümü", "Eğitim", "İş", "Kişisel", "Teknoloji", "Araştırma"];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === "Tümü" || template.category === selectedCategory;
    const searchMatch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  const copyTemplate = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`"${title}" şablonu panoya kopyalandı!`);
    } catch (error) {
      toast.error("Kopyalama işlemi başarısız!");
    }
  };

  const useTemplate = (template: Template) => {
    // Not oluşturma sayfasına şablon içeriği ile yönlendirme
    const templateData = {
      title: template.title,
      content: template.content
    };
    
    localStorage.setItem('templateData', JSON.stringify(templateData));
    window.location.href = '/newnote';
    toast.success(`"${template.title}" şablonu kullanılmak üzere hazırlandı!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6 ml-48">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text mb-4">
            📋 Not Şablonları
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Hazır şablonlarla notlarınızı hızlıca oluşturun
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
            />
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-purple-50 border border-purple-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-purple-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${template.color} p-6 text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  {template.icon}
                  <h3 className="text-xl font-bold">{template.title}</h3>
                </div>
                <p className="text-white/90 text-sm">{template.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => useTemplate(template)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Kullan
                  </button>
                  <button
                    onClick={() => copyTemplate(template.content, template.title)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all flex items-center justify-center"
                    title="Panoya Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Şablon bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Şablon İstatistikleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{templates.length}</div>
              <div className="text-gray-600">Toplam Şablon</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{categories.length - 1}</div>
              <div className="text-gray-600">Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{filteredTemplates.length}</div>
              <div className="text-gray-600">Filtrelenmiş</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">∞</div>
              <div className="text-gray-600">Kullanım</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
