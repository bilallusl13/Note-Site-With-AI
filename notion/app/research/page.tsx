"use client";
import { useState } from "react";
import { Search, BookOpen, Globe, User, Calendar, Star, ExternalLink, Download, Plus, Filter, Bookmark, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishDate: string;
  journal: string;
  doi: string;
  keywords: string[];
  category: string;
  citationCount: number;
  pdfUrl?: string;
  isBookmarked: boolean;
  rating: number;
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  relatedPapers: string[];
}

const samplePapers: ResearchPaper[] = [
  {
    id: "1",
    title: "Yapay Zeka ile Doğal Dil İşleme: Modern Yaklaşımlar ve Uygulamalar",
    authors: ["Dr. Ahmet Yılmaz", "Prof. Dr. Ayşe Kaya", "Doç. Dr. Mehmet Özkan"],
    abstract: "Bu çalışma, yapay zeka alanında doğal dil işleme teknolojilerinin son gelişmelerini incelemektedir. Transformer modelleri, BERT ve GPT gibi büyük dil modellerinin performans analizi yapılmıştır. Türkçe dil işleme konusunda özel odaklanma sağlanmış ve mevcut yöntemlerin karşılaştırmalı analizi sunulmuştur.",
    publishDate: "2024-03-15",
    journal: "Türkiye Bilişim Dergisi",
    doi: "10.1234/tbd.2024.001",
    keywords: ["yapay zeka", "doğal dil işleme", "transformer", "BERT", "GPT", "türkçe"],
    category: "Yapay Zeka",
    citationCount: 45,
    isBookmarked: true,
    rating: 4.8
  },
  {
    id: "2",
    title: "Blockchain Teknolojisi ve Fintech Uygulamaları: Güvenlik Perspektifi",
    authors: ["Prof. Dr. Elif Demir", "Dr. Can Arslan"],
    abstract: "Blockchain teknolojisinin finansal teknolojiler alanındaki uygulamaları ve güvenlik açısından değerlendirilmesi. Kripto para birimlerinin yanı sıra akıllı kontratlar, merkezi olmayan finans (DeFi) protokolleri ve güvenlik açıklarının detaylı analizi sunulmaktadır.",
    publishDate: "2024-02-28",
    journal: "Bilişim Güvenliği Araştırmaları",
    doi: "10.1234/bga.2024.007",
    keywords: ["blockchain", "fintech", "güvenlik", "kripto", "DeFi", "akıllı kontrat"],
    category: "Blockchain",
    citationCount: 32,
    isBookmarked: false,
    rating: 4.5
  },
  {
    id: "3",
    title: "Makine Öğrenmesi ile Tıbbi Görüntü Analizi: Kanser Teşhisinde Yeni Yaklaşımlar",
    authors: ["Dr. Zeynep Şahin", "Prof. Dr. Hasan Çelik", "Uzm. Dr. Fatma Yıldız"],
    abstract: "Derin öğrenme algoritmalarının tıbbi görüntü analizinde kullanımı ve kanser teşhisindeki başarı oranları incelenmektedir. CNN, ResNet ve Vision Transformer modellerinin karşılaştırmalı performans analizi yapılmış, gerçek hasta verilerinde test edilmiştir.",
    publishDate: "2024-01-10",
    journal: "Tıbbi Bilişim Dergisi",
    doi: "10.1234/tbd.2024.003",
    keywords: ["makine öğrenmesi", "tıbbi görüntü", "kanser teşhisi", "derin öğrenme", "CNN"],
    category: "Sağlık Teknolojileri",
    citationCount: 67,
    isBookmarked: true,
    rating: 4.9
  },
  {
    id: "4",
    title: "Nesnelerin İnterneti ve Akıllı Şehir Uygulamaları: Sürdürülebilirlik Analizi",
    authors: ["Doç. Dr. Murat Kılıç", "Dr. Selin Acar"],
    abstract: "IoT teknolojilerinin akıllı şehir projelerindeki rolü ve sürdürülebilirlik açısından değerlendirilmesi. Enerji verimliliği, trafik yönetimi, atık yönetimi ve çevre izleme sistemlerinin entegrasyonu üzerine kapsamlı bir analiz sunulmaktadır.",
    publishDate: "2023-12-20",
    journal: "Akıllı Sistemler Dergisi",
    doi: "10.1234/asd.2023.015",
    keywords: ["IoT", "akıllı şehir", "sürdürülebilirlik", "enerji verimliliği", "çevre"],
    category: "IoT",
    citationCount: 28,
    isBookmarked: false,
    rating: 4.3
  },
  {
    id: "5",
    title: "Kuantum Bilgisayarlar ve Kriptografi: Post-Kuantum Güvenlik Çözümleri",
    authors: ["Prof. Dr. Kemal Öztürk", "Dr. Ece Yalçın", "Arş. Gör. Deniz Kocak"],
    abstract: "Kuantum bilgisayarların mevcut kriptografik sistemlere potansiyel tehditleri ve post-kuantum kriptografi çözümlerinin analizi. Lattice tabanlı, kod tabanlı ve multivariate kriptografik yöntemlerin karşılaştırmalı güvenlik değerlendirmesi yapılmıştır.",
    publishDate: "2023-11-05",
    journal: "Kuantum Teknolojileri Araştırmaları",
    doi: "10.1234/kta.2023.008",
    keywords: ["kuantum bilgisayar", "kriptografi", "post-kuantum", "güvenlik", "lattice"],
    category: "Kuantum Teknolojileri",
    citationCount: 51,
    isBookmarked: true,
    rating: 4.7
  }
];

const sampleNotes: ResearchNote[] = [
  {
    id: "1",
    title: "Transformer Mimarisi Üzerine Notlar",
    content: "Transformer modeli, attention mekanizması kullanarak sekans-to-sekans öğrenme problemlerini çözen bir mimaridir. Self-attention, encoder-decoder yapısı ve positional encoding temel bileşenlerdir...",
    tags: ["transformer", "attention", "NLP"],
    createdAt: "2024-03-20",
    relatedPapers: ["1"]
  },
  {
    id: "2",
    title: "Blockchain Konsensüs Algoritmaları",
    content: "Proof of Work, Proof of Stake, Delegated Proof of Stake gibi konsensüs algoritmalarının karşılaştırmalı analizi. Her birinin avantaj ve dezavantajları...",
    tags: ["blockchain", "konsensüs", "PoW", "PoS"],
    createdAt: "2024-03-18",
    relatedPapers: ["2"]
  }
];

const categories = ["Tümü", "Yapay Zeka", "Blockchain", "Sağlık Teknolojileri", "IoT", "Kuantum Teknolojileri"];

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<"papers" | "notes">("papers");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "citations" | "rating">("date");
  const [papers, setPapers] = useState(samplePapers);
  const [notes, setNotes] = useState(sampleNotes);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });

  const filteredPapers = papers
    .filter(paper => {
      const categoryMatch = selectedCategory === "Tümü" || paper.category === selectedCategory;
      const searchMatch = 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "citations":
          return b.citationCount - a.citationCount;
        case "rating":
          return b.rating - a.rating;
        case "date":
        default:
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
    });

  const toggleBookmark = (paperId: string) => {
    setPapers(papers.map(paper => 
      paper.id === paperId 
        ? { ...paper, isBookmarked: !paper.isBookmarked }
        : paper
    ));
    toast.success("Yer imi güncellendi!");
  };

  const addNote = () => {
    if (!newNote.title || !newNote.content) {
      toast.error("Başlık ve içerik gerekli!");
      return;
    }

    const note: ResearchNote = {
      id: (notes.length + 1).toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString().split('T')[0],
      relatedPapers: []
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", tags: "" });
    setShowAddNote(false);
    toast.success("Araştırma notu eklendi!");
  };

  const exportNote = (note: ResearchNote) => {
    const content = `# ${note.title}\n\n${note.content}\n\n**Etiketler:** ${note.tags.join(", ")}\n**Tarih:** ${note.createdAt}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Not indirildi!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 ml-48">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text mb-4">
            🔬 Araştırma Merkezi
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Bilimsel makaleler ve araştırma notlarınız için merkezi platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-purple-100">
            <button
              onClick={() => setActiveTab("papers")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "papers"
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              📄 Makaleler
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === "notes"
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              📝 Notlarım
            </button>
          </div>
        </div>

        {activeTab === "papers" && (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Makale ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "citations" | "rating")}
                    className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 transition-all"
                  >
                    <option value="date">Tarihe göre</option>
                    <option value="citations">Alıntı sayısına göre</option>
                    <option value="rating">Puana göre</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-purple-50 border border-purple-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Papers Grid */}
            <div className="space-y-6">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{paper.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {paper.authors.join(", ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(paper.publishDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(paper.id)}
                        className={`p-2 rounded-full transition-all ${
                          paper.isBookmarked
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'
                        }`}
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">{paper.abstract}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {paper.journal}
                        </span>
                        <span className="flex items-center gap-1">
                          📊 {paper.citationCount} alıntı
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{paper.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
                          <Share2 className="w-4 h-4" />
                          Paylaş
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all">
                          <ExternalLink className="w-4 h-4" />
                          Detay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "notes" && (
          <>
            {/* Add Note Button */}
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Araştırma Notlarım</h2>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Yeni Not
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNote && (
              <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Yeni Araştırma Notu</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Not başlığı..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  />
                  <textarea
                    placeholder="Not içeriği..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Etiketler (virgülle ayırın)..."
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={addNote}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold transition-all hover:from-purple-600 hover:to-pink-600"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition-all hover:bg-gray-200"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{note.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">{note.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportNote(note)}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm"
                        >
                          <Download className="w-4 h-4" />
                          İndir
                        </button>
                        <button className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all text-sm">
                          Düzenle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Statistics */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📈 Araştırma İstatistikleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{papers.length}</div>
              <div className="text-gray-600">Toplam Makale</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{notes.length}</div>
              <div className="text-gray-600">Araştırma Notu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{papers.filter(p => p.isBookmarked).length}</div>
              <div className="text-gray-600">Yer İmi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{categories.length - 1}</div>
              <div className="text-gray-600">Kategori</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
