import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coffee, 
  CupSoda, 
  CakeSlice, 
  Flame, 
  ChefHat, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Instagram, 
  Facebook, 
  MapPin, 
  Search, 
  X, 
  Leaf, 
  Clock, 
  Phone, 
  Share2 
} from "lucide-react";
import { MenuCategory, MenuItem, menuData as localMenuData } from "./data";

// Native Sound & Music Fallbacks
const BEAUTIFUL_GARDEN_MUSIC = "https://www.image2url.com/r2/default/audio/1779605277020-c303c35e-9a3a-48b9-9632-7122a3d4f357.mp3";

const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame size={22} className="text-amber-500 animate-pulse" />,
  ChefHat: <ChefHat size={22} className="text-emerald-500" />,
  CakeSlice: <CakeSlice size={22} className="text-amber-500" />,
  IceCream: <Leaf size={22} className="text-emerald-400" />,
  CupSoda: <CupSoda size={22} className="text-teal-400" />,
  Coffee: <Coffee size={22} className="text-yellow-600" />,
};

// Elegant responsive cover images for categories
const fallbackCategoryImages: Record<string, string> = {
  grills: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600",
  stone_oven: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
  crepes: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&q=80&w=600",
  waffles: "https://images.unsplash.com/photo-1562376502-0ac40ae8a105?auto=format&fit=crop&q=80&w=600",
  pancakes: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
  milkshakes: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600",
  smoothies: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600",
  mojitos: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600",
  fresh_drinks: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=600",
  hot_drinks: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
  soft_drinks: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
};

export default function UserMenu() {
  const [menuData, setMenuData] = useState<MenuCategory[]>(localMenuData);
  const [showSplash, setShowSplash] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load backend configurations
  useEffect(() => {
    fetch(`/api/menu?t=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error("API not available");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuData(data);
        }
      })
      .catch(e => {
        console.error("Using local fallback for menuData");
        setMenuData(localMenuData);
      });
  }, []);

  // Sync music settings
  useEffect(() => {
    if (!showSplash && audioRef.current && !isMusicPlaying) {
      const playOnInteract = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
        }
        document.removeEventListener('click', playOnInteract);
        document.removeEventListener('scroll', playOnInteract);
        document.removeEventListener('touchstart', playOnInteract);
      };
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsMusicPlaying(true);
        }).catch(() => {
          document.addEventListener('click', playOnInteract);
          document.addEventListener('scroll', playOnInteract);
          document.addEventListener('touchstart', playOnInteract);
        });
      }
    }
  }, [showSplash]);

  // Progressive Loading Screen trigger
  useEffect(() => {
    if (showSplash) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setShowSplash(false);
            }, 1000);
            return 100;
          }
          // Increment smaller, more graceful steps to increase loading/splash duration
          const increment = Math.floor(Math.random() * 3) + 2;
          return Math.min(prev + increment, 100);
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [showSplash]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToMain = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedCategory(null);
  };

  const handleSelectCategory = (category: MenuCategory) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedCategory(category);
    window.history.pushState({ hasCategory: true }, "", "");
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setSelectedCategory(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Searching logic across all categories
  const filteredCategories = menuData.map(cat => {
    const matchedItems = cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...cat, items: matchedItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <>
      <audio
        ref={audioRef}
        src={BEAUTIFUL_GARDEN_MUSIC}
        loop
        preload="auto"
      />

      {/* 🌳 ELEGANT OLIVE SPLASH PROGRESS SCREEN 🌳 */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070b07] text-center overflow-hidden px-6"
          >
            {/* Background nature underlay */}
            <motion.div
              initial={{ scale: 1.15 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: 15, ease: "easeOut" }}
              className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.07]"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1444858291040-58fe7d05014a?auto=format&fit=crop&q=80&w=2000')" }}
            />
            
            {/* Ambient gold/green light halo */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050805] via-[#070c07]/97 to-[#0d150e]/95 z-10" />

            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-80 h-80 bg-[#d4af37]/5 rounded-full blur-[100px] z-10 pointer-events-none"
            />
            
            {/* Golden Leaf Particles */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-[#d4af37]/25 rounded-full"
                  style={{
                    width: Math.random() * 5 + 3 + 'px',
                    height: Math.random() * 5 + 3 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [120, -100],
                    x: [0, Math.random() * 40 - 20],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
              className="relative z-30 flex flex-col items-center"
            >
              {/* Premium Emblem with fill indicator wrapper */}
              <div className="relative mb-8 flex items-center justify-center p-6 rounded-[2.5rem] bg-gradient-to-tr from-white/[0.04] to-[#d4af37]/10 border border-[#d4af37]/20 shadow-2xl backdrop-blur-md">
                <motion.img 
                  animate={{ 
                    y: [0, -6, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  src="/logo.png" 
                  alt="Al Zaytouna Emblem" 
                  className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallbackIcon = document.getElementById("emblem-fallback");
                    if (fallbackIcon) fallbackIcon.classList.remove("hidden");
                  }}
                />
                <div id="emblem-fallback" className="hidden flex flex-col items-center gap-2">
                  <Leaf size={48} className="text-[#d4af37]" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#faf7ec] font-['Cairo'] mb-2.5 drop-shadow-md">
                مطعم وكافيه الزيتونة
              </h1>
              
              <div className="w-16 h-1.5 bg-[#d4af37] rounded-full mb-4" />

              <p className="text-sm sm:text-base text-[#819b83] font-medium font-['Cairo'] leading-relaxed max-w-xs mb-8">
                أصالة المذاق في أحضان الطبيعة الخضراء الفسيحة
              </p>

              {/* Progressive loading indicator bar directly below */}
              <div className="w-56 sm:w-64">
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#d4af37]/20 p-[1px] shadow-lg">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#d4af37]/80 via-[#e4c264] to-[#faf7ec] transition-all duration-300 shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen relative bg-[#050805] text-[#f6fdf7] font-['Cairo'] pb-28 ${showSplash ? "h-screen overflow-hidden" : ""}`} dir="rtl">
        
        {/* Decorative Background Assets */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Deep dark gradient back layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b07] via-[#050805]/98 to-[#030503]" />
          
          {/* Beautiful Garden and BBQ Background Image */}
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-[0.07] mix-blend-luminosity" 
          />
          
          {/* Olive-Gold atmospheric radial glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-950/30 rounded-full blur-[110px] -mr-32 -mt-32" />
          <div className="absolute bottom-[30%] left-0 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[140px] -ml-44" />
        </div>

        {/* FLOATING ACTION DECK (Top Bar) */}
        {!showSplash && (
          <div className="sticky top-0 z-40 transition-colors duration-300 bg-[#070b07]/95 backdrop-blur-xl border-b border-[#d4af37]/10 px-4 py-3 flex items-center justify-between shadow-lg">
            
            {/* Left Action: Music only (No Basket/Cart) */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMusic}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isMusicPlaying ? "bg-emerald-950/80 border border-[#d4af37]/30 text-[#f3eac8]" : "bg-white/[0.03] border border-white/5 text-emerald-100/60"}`}
                title="أصوات هادئة"
              >
                {isMusicPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
              </button>
            </div>

            {/* Middle: Brand Type "مطعم وكافيه الزيتونة" */}
            <div 
              onClick={handleBackToMain}
              className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="text-base sm:text-lg font-black text-[#faf7ec] tracking-wide font-['Cairo']">
                مطعم وكافيه الزيتونة
              </span>
            </div>

            {/* Right: Contact Shortcut */}
            <a 
              href="https://wa.me/970569716164" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 bg-emerald-950/55 hover:bg-emerald-900/60 text-[#f3eac8] border border-emerald-800/20 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all animate-pulse hover:animate-none"
            >
              <Phone size={13} />
              <span className="hidden sm:inline">تواصل واتساب</span>
            </a>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="main-menu-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* BRAND COZY HERO CONTAINER */}
              <div className="relative overflow-hidden pt-12 pb-8 px-4 text-center max-w-4xl mx-auto">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Logo placed directly above welcome text as requested */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="p-3 bg-white/[0.02] border border-[#d4af37]/20 rounded-full shadow-2xl backdrop-blur-md"
                  >
                    <img 
                      src="/logo.png" 
                      alt="Al Zaytouna Logo" 
                      className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </motion.div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-b from-[#faf7ec] to-[#c7c1b1] tracking-tight leading-tight">
                  أهلاً بكم في مطعم وكافيه الزيتونة
                </h2>

                <p className="text-xs sm:text-sm text-[#819b83] font-medium leading-relaxed max-w-md mx-auto mb-6">
                  مساحاتنا الخضراء الواسعة والجميلة، مصممة بعناية فائقة لتنعموا بجلسة عائلية مريحة ودافئة وممتعة للغاية. تذوقوا ألذ المعجنات ومشاوي الكوخ البلدي الطازج.
                </p>

                {/* SEARCH DRUM BAR */}
                <div className="relative max-w-md mx-auto">
                  <span className="absolute inset-y-0 right-4 flex items-center pr-1 text-emerald-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن مشاكيل، معجنات، كريب، موهيتو..."
                    className="w-full pl-6 pr-12 py-3 sm:py-3.5 bg-emerald-950/35 text-emerald-100 hover:bg-emerald-950/60 focus:bg-emerald-950/80 rounded-2xl border border-emerald-900/35 focus:border-[#d4af37]/40 outline-none text-sm transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 left-4 flex items-center text-emerald-450 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* SPECIAL DETAILED EMBED */}
              {(!searchQuery) && (
                <div className="max-w-4xl mx-auto px-4 mb-10">
                  <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#0a110a] to-[#121f13] border border-emerald-900/20 p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Premium Photo */}
                      <div className="w-full md:w-36 shrink-0 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden border border-[#d4af37]/10 shadow-lg select-none">
                        <img 
                          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400" 
                          alt="Special Ribs Cottage" 
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                      </div>

                      {/* Info and Special Highlights */}
                      <div className="flex-1 text-right">
                        <div className="inline-flex items-center gap-2 text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full text-xs font-bold mb-3">
                          <Flame size={14} />
                          ركن كوخ الشواء الخصوصي
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                          صنعت على الحطب والفحم البلدي طازجاً
                        </h3>
                        <p className="text-xs sm:text-sm text-[#8a9f8b] leading-relaxed mb-4">
                          لأننا نمتلك كوخاً خصوصياً للشواء بالطرق التقليدية، نستخدم اللحوم البلدية الفاخرة يومياً لنقدم لكم تجربة تدخين ونضج مميزة بطابع كنعاني أصيل.
                        </p>
                        <button 
                          onClick={() => {
                            const grillCat = menuData.find(c => c.id === "grills");
                            if (grillCat) handleSelectCategory(grillCat);
                          }}
                          className="text-xs font-bold text-[#faf7ec] bg-emerald-950 border border-[#d4af37]/35 px-4 py-2 rounded-xl hover:bg-emerald-900/50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          تصفح المشاوي والريش البلدية
                          <ChevronLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC CATEGORY GRID SECTION */}
              <main className="max-w-4xl mx-auto p-4 sm:p-6 relative z-30 pb-20">
                
                {searchQuery ? (
                  // SEARCH RESULTS
                  <div className="space-y-8">
                    <h3 className="text-xl font-bold text-[#d4af37] flex items-center gap-2 px-1">
                      <Sparkles size={18} />
                      نتائج البحث عن ({searchQuery})
                    </h3>
                    
                    {filteredCategories.length > 0 ? (
                      <div className="grid gap-4">
                        {filteredCategories.map(cat => (
                          <div key={cat.id} className="bg-emerald-950/10 rounded-2xl border border-emerald-900/10 p-4">
                            <h4 className="text-sm font-black text-[#819b83] mb-3 pb-1.5 border-b border-emerald-900/10">
                              صنف: {cat.title}
                            </h4>
                            <div className="grid gap-3">
                              {cat.items.map(item => (
                                <div 
                                  key={item.id}
                                  className="p-4 rounded-xl bg-[#090e09]/75 border border-emerald-950 flex items-center justify-between gap-4"
                                >
                                  <div>
                                    <h5 className="font-bold text-white text-base">{item.name}</h5>
                                    {item.description && <p className="text-xs text-[#819b83] line-clamp-1 mt-1">{item.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#d4af37] font-extrabold text-sm sm:text-base px-2.5 py-1 bg-emerald-950/80 border border-emerald-900/40 rounded-xl">
                                      {item.price} ₪
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-[#819b83]">
                        لم نجد ما يطابق بحثك، جرب البحث عن كلمات عامة مثل "مشاوي" أو "بيتزا".
                      </div>
                    )}
                  </div>
                ) : (
                  // STANDARD TILES
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {menuData.map((category, index) => (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.5, type: "spring" }}
                        whileHover={{ scale: 1.015, y: -4 }}
                        onClick={() => handleSelectCategory(category)}
                        className="relative h-48 sm:h-56 rounded-[2rem] overflow-hidden group w-full text-right shadow-xl border border-emerald-900/20 hover:border-[#d4af37]/30 transition-all duration-300 pointer-events-auto"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${category.image || fallbackCategoryImages[category.id] || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400"}')` }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050805]/95 via-[#050805]/40 to-transparent z-10 transition-opacity duration-300" />
                        
                        <div className="absolute top-5 left-5 z-20">
                          <div className="w-9 h-9 rounded-full bg-emerald-950/90 border border-emerald-900/40 text-[#faf7ec] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ChevronLeft size={18} className="transform -translate-x-0.5" />
                          </div>
                        </div>

                        {/* Category Metadata */}
                        <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-6 z-20">
                          <div className="flex items-center gap-3">
                            <div className="text-emerald-900 mb-1 bg-gradient-to-br from-[#faf7ec] to-emerald-200 p-2 rounded-xl text-center shadow-lg transform transition-transform group-hover:scale-105">
                              {category.icon && iconMap[category.icon] ? iconMap[category.icon] : <Leaf size={20} className="text-emerald-800" />}
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#faf7ec] tracking-tight leading-none">
                                {category.title}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-[#8da48e] mt-1 font-bold">
                                {category.items ? `${category.items.length} خيارات لذيذة` : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </main>

              {/* PREMIUM CUSTOM OLIVE GARDEN FOOTER */}
              <footer className="mt-16 bg-[#030603] rounded-t-[3rem] border-t border-emerald-950 p-8 sm:p-12 pb-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1444858291040-58fe7d05014a?auto=format&fit=crop&q=80&w=600')] opacity-[0.03] bg-center bg-cover mix-blend-overlay" />
                
                <div className="relative z-10 max-w-4xl mx-auto">
                  
                  {/* Small olive branch icon */}
                  <div className="flex justify-center mb-4 text-[#d4af37]">
                    <Leaf size={32} />
                  </div>

                  <h3 className="text-[#faf7ec] text-lg font-bold mb-2">
                    مطعم وكافيه الزيتونة الأنيق
                  </h3>
                  <p className="text-xs text-[#8da48e] max-w-sm mx-auto mb-8 leading-relaxed">
                    متعة هواء الحدائق المنعشة مع المذاق البلدي الساحر. غايتنا خدمتكم بأعلى معايير الراحة والضيافة.
                  </p>

                  <div className="flex justify-center items-center gap-4 sm:gap-6 mb-8" dir="ltr">
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-950/45 hover:bg-[#d4af37] hover:text-[#070b07] transition-all flex items-center justify-center text-[#faf7ec] border border-emerald-900/10">
                      <Instagram size={17} />
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-950/45 hover:bg-[#d4af37] hover:text-[#070b07] transition-all flex items-center justify-center text-[#faf7ec] border border-emerald-900/10">
                      <Facebook size={17} />
                    </a>
                    <a href="https://wa.me/970569716164" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-950/45 hover:bg-[#d4af37] hover:text-[#070b07] transition-all flex items-center justify-center text-[#faf7ec] border border-emerald-900/10">
                      <Share2 size={17} />
                    </a>
                  </div>
                  
                  {/* Garden Location & Timing Contacts */}
                  <div className="flex flex-col items-center justify-center gap-2 mb-10 text-xs text-[#819b83]">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-[#d4af37]" />
                      <span>فلسطين - الخليل - فرش الهوى - عين عركا</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-[#d4af37]" />
                      <span>مفتوح يومياً من الساعة 10:00 صباحاً حتى 12:00 ليلاً</span>
                    </div>
                  </div>

                  <div className="border-t border-emerald-950/40 pt-8 flex flex-col items-center">
                    <p className="text-[10px] text-emerald-100/35">
                      © 2026 جميع الحقوق محفوظة - قائمة مطعم وكافيه الزيتونة الرقمية
                    </p>
                  </div>
                </div>
              </footer>
            </motion.div>
          ) : (
            // CATEGORY ITEMS VIEW
            <motion.div
              key="category-details-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >


              {/* COVER HEADER JUMBOTRON */}
              <div className="relative overflow-hidden py-16 px-4 text-center mt-6">
                <div 
                  className="absolute inset-0 bg-cover bg-center brightness-[0.3] blur-[1px]"
                  style={{ backgroundImage: `url('${selectedCategory.image || fallbackCategoryImages[selectedCategory.id]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050805] via-transparent to-transparent z-15" />
                
                <div className="relative z-25 flex flex-col items-center">
                  <div className="bg-[#faf7ec] text-emerald-950 p-3.5 rounded-3xl mb-4 shadow-xl border border-white/5">
                    {selectedCategory.icon && iconMap[selectedCategory.icon] ? selectedCategory.icon && iconMap[selectedCategory.icon] : <Leaf size={24} />}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-2 text-white tracking-tight drop-shadow-md">
                    {selectedCategory.title}
                  </h1>
                  <span className="text-xs text-[#faf7ec] font-semibold tracking-wide bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-900/40">
                    الطعم الذي تود تكراره دائماً
                  </span>
                </div>
              </div>

              {/* DISHES LIST CONTAINER */}
              <main className="max-w-3xl mx-auto px-4 pb-24 relative z-25">
                <div className="grid gap-5">
                  {selectedCategory.items && selectedCategory.items.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-[2rem] bg-emerald-950/5 border border-emerald-900/10 hover:border-emerald-800/30 hover:bg-[#090e09]/40 shadow-sm flex flex-row gap-4 items-center transition-all duration-300"
                      >
                        {/* Dish photo overlay if present */}
                        {item.image && (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-emerald-900/30 relative select-none">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 mb-2">
                            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 flex-wrap">
                              {item.name}
                              {item.isPopular && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] bg-[#d4af37]/20 text-[#faf7ec] font-bold border border-[#d4af37]/30">
                                  <Sparkles size={8} fill="currentColor" className="text-[#d4af37]" />
                                  مميز الكوخ
                                </span>
                              )}
                            </h3>

                            {/* Dynamic Size prices presented as tags as requested */}
                            <div className="flex items-center gap-2 shrink-0">
                              {item.description && item.description.includes("كبير:") ? (
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-900 text-xs text-[#faf7ec] font-bold shadow-inner">
                                    صغير: {item.price} ₪
                                  </span>
                                  {(() => {
                                    const match = item.description?.match(/كبير:\s*(\d+)/);
                                    if (match) {
                                      const bigPrice = Number(match[1]);
                                      return (
                                        <span className="px-2.5 py-1 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#faf7ec] font-bold">
                                          كبير: {bigPrice} ₪
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              ) : (
                                <div className="text-[#faf7ec] font-black text-sm bg-gradient-to-r from-emerald-950 to-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-800 shadow-sm leading-none">
                                  {item.price} ₪
                                </div>
                              )}
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-xs sm:text-sm text-[#8da48e] leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Scroll back to top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#d4af37] text-[#050805] shadow-lg hover:bg-[#e4be4a] transition-colors cursor-pointer"
            >
              <ChevronUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating Back Button when inside a category */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              onClick={handleBackToMain}
              className="fixed bottom-6 left-6 z-40 px-5 py-3 rounded-full bg-[#d4af37] text-[#050805] shadow-2xl flex items-center gap-1.5 font-bold hover:bg-[#e4be4a] transition-all border border-[#d4af37]/30 cursor-pointer"
            >
              <ChevronRight size={18} className="stroke-[3px]" />
              <span>الرجوع للمنيو</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
