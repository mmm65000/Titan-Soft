
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Category } from '../types';

const Categories: React.FC = () => {
  const { categories, setCategories, lang, t, addLog } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', name_ar: '' });
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSub, setNewSub] = useState({ name: '', name_ar: '' });

  const handleAddCategory = () => {
    if (!newCat.name || !newCat.name_ar) return;
    const cat: Category = {
      id: `cat-${Date.now()}`,
      name: newCat.name,
      name_ar: newCat.name_ar,
      subCategories: []
    };
    setCategories([...categories, cat]);
    addLog(`Category Created: ${cat.name}`, 'info');
    setNewCat({ name: '', name_ar: '' });
    setShowAddModal(false);
  };

  const handleAddSubCategory = () => {
    if (!selectedCatId || !newSub.name || !newSub.name_ar) return;
    setCategories(prev => prev.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          subCategories: [...(c.subCategories || []), { id: `sub-${Date.now()}`, name: newSub.name, name_ar: newSub.name_ar }]
        };
      }
      return c;
    }));
    setNewSub({ name: '', name_ar: '' });
    setSelectedCatId(null);
  };

  const handleDeleteCategory = (id: string) => {
      if(confirm('Are you sure you want to delete this category?')) {
          setCategories(prev => prev.filter(c => c.id !== id));
      }
  };

  const handleDeleteSubCategory = (catId: string, subId: string) => {
      setCategories(prev => prev.map(c => {
          if(c.id === catId) {
              return { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) };
          }
          return c;
      }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">التصنيفات الشجرية (SKU Tree)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Hierarchical Store Structure Management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-600 transition-all"
        >
          تصنيف رئيسي جديد
          <span className="text-xl">+</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <div key={cat.id} className="glass p-8 rounded-[45px] shadow-xl border border-white flex flex-col justify-between group hover:bg-white transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            
            <div>
               <div className="flex justify-between items-start mb-6 pl-4">
                  <h4 className="text-2xl font-black text-slate-800">{lang === 'ar' ? cat.name_ar : cat.name}</h4>
                  <div className="flex gap-2">
                      <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black text-slate-400 uppercase tracking-widest">{cat.subCategories?.length || 0} Sub</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-300 hover:text-red-500 transition-colors px-2">✕</button>
                  </div>
               </div>
               
               <div className="space-y-3 mb-8 pl-4 pr-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {cat.subCategories && cat.subCategories.length > 0 ? (
                      cat.subCategories.map(sub => (
                        <div key={sub.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-blue-50 transition-colors group/sub">
                           <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                               <span className="text-xs font-bold text-slate-600">{lang === 'ar' ? sub.name_ar : sub.name}</span>
                           </div>
                           <button 
                            onClick={() => handleDeleteSubCategory(cat.id, sub.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover/sub:opacity-100 transition-opacity text-[10px]"
                           >
                             حذف
                           </button>
                        </div>
                      ))
                  ) : (
                      <p className="text-center py-4 opacity-30 text-[10px] font-black uppercase">لا توجد تصنيفات فرعية</p>
                  )}
               </div>
            </div>
            
            <button 
              onClick={() => setSelectedCatId(cat.id)}
              className="w-full py-4 bg-blue-50 text-blue-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>إضافة فرعي</span>
              <span>↓</span>
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass w-full max-w-md p-12 rounded-[50px] shadow-2xl border-white scale-in-center relative">
              <h3 className="text-3xl font-black mb-8 text-center tracking-tighter text-slate-800">تصنيف رئيسي جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest px-2">الاسم بالعربية</label>
                    <input type="text" value={newCat.name_ar} onChange={e => setNewCat({...newCat, name_ar: e.target.value})} className="w-full glass-dark p-5 rounded-3xl outline-none font-bold" dir="rtl" placeholder="مثال: إلكترونيات" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest px-2">الاسم بالإنجليزية</label>
                    <input type="text" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full glass-dark p-5 rounded-3xl outline-none font-bold shadow-inner text-left" dir="ltr" placeholder="Ex: Electronics" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">إلغاء</button>
                    <button onClick={handleAddCategory} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">حفظ التصنيف</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedCatId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass w-full max-w-md p-12 rounded-[50px] shadow-2xl border-white scale-in-center relative">
              <h3 className="text-2xl font-black mb-2 text-center tracking-tighter text-slate-800">إضافة تصنيف فرعي</h3>
              <p className="text-center text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8 bg-blue-50 py-2 rounded-full mx-10">تابع لـ: {categories.find(c=>c.id===selectedCatId)?.name_ar}</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest px-2">الاسم بالعربية</label>
                    <input type="text" value={newSub.name_ar} onChange={e => setNewSub({...newSub, name_ar: e.target.value})} className="w-full glass-dark p-5 rounded-3xl outline-none font-bold" dir="rtl" placeholder="مثال: هواتف ذكية" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest px-2">الاسم بالإنجليزية</label>
                    <input type="text" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="w-full glass-dark p-5 rounded-3xl outline-none font-bold shadow-inner text-left" dir="ltr" placeholder="Ex: Smartphones" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setSelectedCatId(null)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">إلغاء</button>
                    <button onClick={handleAddSubCategory} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-[2rem] shadow-xl uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all">ربط الفرعي</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
