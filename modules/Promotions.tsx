
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Promotion } from '../types';

const Promotions: React.FC = () => {
  const { lang, t, addPromotion, promotions } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: '', type: 'Percentage', value: '' });

  const handleAdd = () => {
    if(!newPromo.title || !newPromo.value) return;
    const p: Promotion = {
        id: `PR-${Date.now()}`,
        title: newPromo.title,
        type: newPromo.type,
        value: newPromo.value,
        reach: 0,
        status: 'active'
    };
    addPromotion(p);
    setShowAdd(false);
    setNewPromo({ title: '', type: 'Percentage', value: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {t('promotions')}
          </h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">
            Campaign Mechanics • Discount Matrix
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
        >
          New Offer Script
          <span>+</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {promotions.map((promo, i) => (
           <div key={i} className={`glass p-12 rounded-[60px] shadow-2xl border-white relative overflow-hidden group hover:bg-white transition-all ${promo.status === 'expired' ? 'opacity-50 grayscale' : ''}`}>
              <div className="absolute top-0 right-0 p-8">
                 <div className={`w-3 h-3 rounded-full ${promo.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              </div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{promo.title}</h4>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-10">{promo.type} Engine</p>
              
              <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 flex justify-between items-center mb-8">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Benefit Value</span>
                 <span className="text-4xl font-black text-slate-900 tracking-tighter">{promo.value}</span>
              </div>
              
              <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase">Total Conversions</span>
                    <span className="text-lg font-black text-slate-800">{promo.reach}</span>
                 </div>
                 <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">Edit Rules →</button>
              </div>
           </div>
         ))}
      </div>
      
      {showAdd && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-xl p-14 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">عرض ترويجي جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم الحملة</label>
                    <input type="text" className="w-full glass-dark p-6 rounded-[2.5rem] outline-none font-bold shadow-inner" placeholder="e.g. Black Friday Hub" value={newPromo.title} onChange={e=>setNewPromo({...newPromo, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نوع الخصم</label>
                       <select className="w-full glass-dark p-4 rounded-2xl outline-none font-black text-xs" onChange={e=>setNewPromo({...newPromo, type: e.target.value})}>
                          <option value="Percentage">نسبة مئوية</option>
                          <option value="Fixed">مبلغ ثابت</option>
                          <option value="BOGO">اشتر X واحصل على Y</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">القيمة</label>
                       <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-black text-center" placeholder="15%" value={newPromo.value} onChange={e=>setNewPromo({...newPromo, value: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-8">
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">تفعيل العرض</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
