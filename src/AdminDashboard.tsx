import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, LogOut, ChevronDown, ChevronUp, Search, Sparkles, X, Loader2 } from "lucide-react";
import { MenuCategory, MenuItem, menuData as localMenuData } from "./data";

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [menu, setMenu] = useState<MenuCategory[]>(localMenuData);
  const [saving, setSaving] = useState(false);

  // For UI expansion state
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const [imageModal, setImageModal] = useState<{isOpen: boolean, catId: string, itemId?: string, query: string, images: string[], loading: boolean}>({
    isOpen: false, catId: '', query: '', images: [], loading: false
  });

  const openImageModal = (catId: string, itemId: string | undefined, defaultQuery: string = '') => {
    setImageModal({ isOpen: true, catId, itemId, query: defaultQuery, images: [], loading: false });
  };

  const closeImageModal = () => setImageModal(prev => ({ ...prev, isOpen: false }));

  const selectImage = (url: string) => {
    if (imageModal.itemId) {
      updateItem(imageModal.catId, imageModal.itemId, { image: url });
    } else {
      updateCategory(imageModal.catId, { image: url });
    }
    closeImageModal();
  };

  const handleImageSearch = async () => {
    if (!imageModal.query) return;
    setImageModal(prev => ({ ...prev, loading: true, images: [] }));
    try {
      const res = await fetch(`/api/search-images?q=${encodeURIComponent(imageModal.query)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setImageModal(prev => ({ ...prev, loading: false, images: data.images || [] }));
    } catch (err) {
      setImageModal(prev => ({ ...prev, loading: false }));
      alert("حدث خطأ أثناء البحث عن الصور");
    }
  };

  useEffect(() => {
    fetch(`/api/menu?t=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error("API not available");
        return r.json();
      })
      .then(data => setMenu(data))
      .catch(e => {
        console.error("Local fallback for menu");
        const localMenu = localStorage.getItem("menuData");
        if (localMenu) {
          setMenu(JSON.parse(localMenu));
        } else {
          // Import local data if localStorage is empty
          import('./data').then(mod => setMenu(mod.menuData)).catch(err => console.error(err));
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(menu)
      });
      
      if (!response.ok) throw new Error("Backend save failed");
      
      localStorage.setItem("menuData", JSON.stringify(menu));
      alert("تم حفظ منيو الزيتونة بنجاح على الخادم والداتا المحلية!");
    } catch (e) {
      // Fallback to local storage
      localStorage.setItem("menuData", JSON.stringify(menu));
      alert("تم الحفظ محلياً في المتصفح فقط (الرجاء التأكد من عمل الخادم).");
    }
    setSaving(false);
  };

  const addCategory = () => {
    const newCat: MenuCategory = {
      id: "cat-" + Date.now(),
      title: "قسم جديد بالزيتونة",
      image: "",
      items: []
    };
    setMenu([...menu, newCat]);
    setExpandedCats({ ...expandedCats, [newCat.id]: true });
  };

  const deleteCategory = (catId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف بالكامل بالزيتونة؟")) return;
    setMenu(menu.filter(c => c.id !== catId));
  };

  const updateCategory = (catId: string, updates: Partial<MenuCategory>) => {
    setMenu(menu.map(c => c.id === catId ? { ...c, ...updates } : c));
  };

  const addItemToCategory = (catId: string) => {
    const newItem: MenuItem = {
      id: "item-" + Date.now(),
      name: "طبق أو مشروب جديد",
      price: 0,
      description: "",
      image: ""
    };
    setMenu(menu.map(c => {
      if (c.id === catId) {
        return { ...c, items: [...c.items, newItem] };
      }
      return c;
    }));
  };

  const deleteItem = (catId: string, itemId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    setMenu(menu.map(c => {
      if (c.id === catId) {
        return { ...c, items: c.items.filter(i => i.id !== itemId) };
      }
      return c;
    }));
  };

  const updateItem = (catId: string, itemId: string, updates: Partial<MenuItem>) => {
    setMenu(menu.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
        };
      }
      return c;
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        onUrl(data.url);
      } else {
        alert("فشل في رفع الملف");
      }
    } catch (err) {
      alert("الرفع قد لا يعمل على البيئات التجريبية الثابتة. يفضل استخدام روابط الويب.");
    }
  };

  const toggleCat = (id: string) => {
    setExpandedCats({ ...expandedCats, [id]: !expandedCats[id] });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("adminToken", data.token);
      } else {
        alert("البيانات المدخلة خاطئة");
      }
    } catch (e) {
      alert("حدث خطأ في الاتصال بالخادم");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f6f3eb] text-[#142215] font-['Cairo'] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-right border border-[#e2dde0] relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-[#b39139]" />
          <h2 className="text-2xl font-black mb-1 text-center text-[#142215]">بوابة تحكم المنيو</h2>
          <p className="text-xs text-center text-gray-400 mb-6">مطعم وكافيه الزيتونة</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block font-bold mb-2 text-sm text-gray-600">اسم المستخدم</label>
              <input
                type="text"
                autoComplete="off"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#b39139] outline-none text-right"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-2 text-sm text-gray-600">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-[#b39139] outline-none text-right"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[#142215] text-white py-3 rounded-xl font-bold hover:bg-[#253e27] transition-all cursor-pointer shadow-md"
            >
              {loading ? "جاري الدخول الأمني..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#142215] font-['Cairo'] pb-24 text-right" dir="rtl">
      
      {/* Sticky top management bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-[#ebdcb9]/40 px-4 py-4 flex justify-between items-center top-bar">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          خروج
        </button>
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-black text-[#142215]">لوحة الإشراف والمراجعة</h1>
          <p className="text-[10px] text-gray-400">تابع لمطعم وكافيه الزيتونة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#b39139] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#c29d38] transition-all cursor-pointer shadow-md"
        >
          <Save size={18} />
          {saving ? "حفظ..." : "حفظ المنيو"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        <div className="mb-6 flex justify-end">
          <button
            onClick={addCategory}
            className="flex items-center gap-1.5 bg-[#142215] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#203621] transition-all cursor-pointer shadow"
          >
            <Plus size={18} />
            إضافة صنف زيتونة رئيسي
          </button>
        </div>

        <div className="space-y-6">
          {menu.map((cat, catIdx) => (
            <div key={cat.id} className="bg-white border border-gray-200/50 shadow-md rounded-2xl overflow-hidden p-1">
              <div
                className="bg-emerald-50/20 hover:bg-emerald-50/40 p-4 flex flex-col sm:flex-row justify-between items-center sm:items-start cursor-pointer rounded-xl gap-4 transition-colors"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "BUTTON" && !(e.target as HTMLElement).closest("button")) {
                    toggleCat(cat.id);
                  }
                }}
              >
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
                  {cat.image ? (
                    <img src={cat.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-3 w-full">
                  <input
                    type="text"
                    value={cat.title}
                    onChange={(e) => updateCategory(cat.id, { title: e.target.value })}
                    placeholder="اسم الصنف (مثال: مشاوي الكوخ)"
                    className="text-lg font-black p-2 border rounded-xl focus:ring-2 focus:ring-[#b39139]/50 outline-none text-right"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-16 text-right">صورة الغلاف:</span>
                    <input
                      type="text"
                      value={cat.image}
                      onChange={(e) => updateCategory(cat.id, { image: e.target.value })}
                      placeholder="رابط الصورة (URL)"
                      className="p-2 border rounded-xl flex-1 text-left text-xs"
                      dir="ltr"
                    />
                    <label className="bg-gray-100 p-2 rounded-xl cursor-pointer hover:bg-gray-250 transition-colors shrink-0" title="رفع صورة">
                      <ImageIcon size={18} className="text-gray-600" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => updateCategory(cat.id, { image: url }))}
                      />
                    </label>
                    <button onClick={() => openImageModal(cat.id, undefined, cat.title + ' food platter')} className="bg-emerald-50 text-emerald-700 p-2 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors shrink-0" title="البحث الذكي">
                      <Search size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 font-bold whitespace-nowrap">
                    ({cat.items.length} منتجات)
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                    title="حذف الصنف"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="text-gray-400 p-2" onClick={() => toggleCat(cat.id)}>
                    {expandedCats[cat.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {expandedCats[cat.id] && (
                <div className="p-4 bg-gray-50/30 border-t border-gray-100/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.items.map((item, itemIdx) => (
                      <div key={item.id} className="border border-gray-150 rounded-2xl p-4 shadow-sm bg-white relative group">
                        <button
                          onClick={() => deleteItem(cat.id, item.id)}
                          className="absolute top-2 left-2 text-red-400 hover:text-red-600 bg-white border rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="حذف المنتج"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative border group-hover:border-emerald-700/30 transition-colors">
                            <img 
                              src={item.image || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200"} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200";
                              }}
                            />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                              <span className="text-white text-[10px] font-bold text-center">رفع</span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, (url) => updateItem(cat.id, item.id, { image: url }))}
                              />
                            </label>
                          </div>

                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(cat.id, item.id, { name: e.target.value })}
                              placeholder="اسم المنتج (مثال: كباب بلدي)"
                              className="font-bold p-1 border-b focus:border-[#b39139] outline-none text-xs text-right"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={item.price || ""}
                                onChange={(e) => updateItem(cat.id, item.id, { price: Number(e.target.value) })}
                                placeholder="السعر"
                                className="font-bold text-[#b39139] p-1.5 w-16 border rounded-xl text-xs text-center outline-none"
                              />
                              <span className="text-xs font-bold text-gray-400">شيكل (₪)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                           <textarea
                              value={item.description || ""}
                              onChange={(e) => updateItem(cat.id, item.id, { description: e.target.value })}
                              placeholder="وصف الطبق أو المشروب والتحضيرات..."
                              className="w-full border rounded-xl p-2 text-xs text-gray-600 outline-none h-14 resize-none focus:ring-1 focus:ring-emerald-700/30 text-right"
                           />
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2">
                           <input
                             type="text"
                             value={item.image || ""}
                             onChange={(e) => updateItem(cat.id, item.id, { image: e.target.value })}
                             placeholder="رابط الصورة الخارجي (URL)"
                             className="text-[10px] text-left p-1.5 border rounded-lg w-full"
                             dir="ltr"
                           />
                           <button onClick={(e) => { e.stopPropagation(); openImageModal(cat.id, item.id, item.name + ' food meal'); }} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0" title="بحث">
                             <Search size={14} />
                           </button>
                           <label className="flex items-center gap-1 cursor-pointer mr-2 shrink-0">
                             <input 
                               type="checkbox" 
                               checked={item.isPopular || false} 
                               onChange={(e) => updateItem(cat.id, item.id, { isPopular: e.target.checked })}
                               className="accent-[#b39139]"
                             />
                             <span className="text-[10px] font-bold text-[#b39139] whitespace-nowrap">مميز</span>
                           </label>
                        </div>

                      </div>
                    ))}
                    
                    {/* Add Item Button */}
                    <button
                      onClick={() => addItemToCategory(cat.id)}
                      className="border-2 border-dashed border-[#b39139]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-[#b39139] hover:bg-[#b39139]/5 hover:border-[#b39139] transition-colors min-h-[140px] cursor-pointer"
                    >
                      <Plus size={24} className="mb-1" />
                      <span className="font-bold text-xs">إضافة منتج جديد</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {imageModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black flex items-center gap-2 text-[#142215]">
                <Search className="text-gray-500" size={18} />
                البحث السريع عن صورة طعام
              </h2>
              <button onClick={closeImageModal} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 bg-white rounded-full border">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageModal.query}
                  onChange={e => setImageModal(prev => ({...prev, query: e.target.value}))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                       handleImageSearch();
                    }
                  }}
                  className="flex-1 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#b39139]/50 text-left"
                  placeholder="تبحث بالإنجليزية لخيارات ممتازة (مثال: grilled chicken, pizza, mojito)"
                  dir="ltr"
                />
                <button
                  onClick={handleImageSearch}
                  disabled={imageModal.loading || !imageModal.query}
                  className="bg-[#b39139] text-white px-5 rounded-xl font-bold hover:bg-[#c29d38] disabled:opacity-50 transition-colors min-w-[80px] flex items-center justify-center cursor-pointer text-sm"
                >
                  {imageModal.loading ? <Loader2 className="animate-spin" size={18} /> : 'بحث'}
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50 max-h-[50vh] no-scrollbar">
               {imageModal.loading ? (
                 <div className="flex flex-col items-center justify-center h-44 gap-3 text-gray-500">
                   <Loader2 size={24} className="animate-spin text-[#b39139]" />
                   <p className="text-xs">جاري جلب الصور...</p>
                 </div>
               ) : imageModal.images.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                   {imageModal.images.map((url, i) => (
                     <button
                       key={i}
                       onClick={() => selectImage(url)}
                       className="group relative rounded-2xl overflow-hidden aspect-square border-2 border-transparent hover:border-[#b39139] hover:shadow-lg transition-all cursor-pointer"
                     >
                       <img src={url} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-white font-bold bg-[#b39139] px-3 py-1 rounded-full text-xs">تثبيت</span>
                       </div>
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                   <Search size={36} className="opacity-20" />
                   <p className="text-xs">اكتب كلمة البحث واضغط على الزر لرؤية اللوحات هنا</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
