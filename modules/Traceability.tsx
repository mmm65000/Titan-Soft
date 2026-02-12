
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TraceRecord } from '../types';

const Traceability: React.FC = () => {
  const { traces, lang, addTraceRecord, products } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // New Trace Form
  const [newTrace, setNewTrace] = useState({ productName: '', expiry: '' });

  const handleCreateTrace = () => {
      if(!newTrace.productName) return;
      const t: TraceRecord = {
          id: `BATCH-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          productName: newTrace.productName,
          expiryDate: newTrace.expiry || 'N/A',
          journey: [
              { step: 'Production', date: new Date().toISOString().split('T')[0], details: 'Batch Created in Facility A' }
          ]
      };
      addTraceRecord(t);
      setShowModal(false);
      setNewTrace({ productName: '', expiry: '' });
      alert(`تم إنشاء الباتش رقم ${t.id} بنجاح ✅`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">تتبع المنتج والمنشأ (Traceability)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Supply Chain Lineage, Batch Genealogy & Safety Recalls</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
            إنشاء دفعة تتبع (Batch) +
        </button>
      </div>

      <div className="glass p-8 rounded-[40px] border border-white shadow-xl bg-white/40 flex gap-4">
         <input 
            type="text" 
            placeholder="أدخل رقم التشغيلة أو الباركود (Batch #) للبحث..." 
            className="flex-1 bg-white p-5 rounded-2xl font-bold outline-none shadow-inner border border-gray-100"
            value={search}
            onChange={e=>setSearch(e.target.value)}
         />
         <button className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">تتبع المسار 🔍</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {traces.filter(t => t.id.includes(search) || t.productName.includes(search)).map(trace => (
            <div key={trace.id} className="glass p-12 rounded-[60px] border border-white shadow-3xl bg-white/40">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-inner">#</div>
                     <div>
                        <h4 className="text-2xl font-black text-slate-800">{trace.productName}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">BATCH ID: {trace.id}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-gray-400 uppercase">تاريخ الانتهاء</p>
                     <p className="text-sm font-black text-red-500">{trace.expiryDate}</p>
                  </div>
               </div>

               <div className="relative">
                  <div className="absolute top-0 right-7 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                  <div className="space-y-12 relative z-10">
                     {trace.journey.map((step, idx) => (
                        <div key={idx} className="flex gap-8 items-start group">
                           <div className="w-14 h-14 bg-white rounded-2xl border-4 border-slate-50 flex items-center justify-center text-xl shadow-lg shrink-0 transition-transform group-hover:scale-110">
                              {idx === 0 ? '🏭' : '🚛'}
                           </div>
                           <div>
                              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{step.date}</p>
                              <h5 className="text-lg font-black text-slate-800">{step.step}</h5>
                              <p className="text-sm font-medium text-gray-400 mt-2">{step.details}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">إطلاق دفعة إنتاجية</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المنتج</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewTrace({...newTrace, productName: e.target.value})}>
                       <option value="">اختر المنتج...</option>
                       {products.map(p => <option key={p.id} value={p.name_ar}>{p.name_ar}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ الانتهاء المتوقع</label>
                    <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newTrace.expiry} onChange={e=>setNewTrace({...newTrace, expiry: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleCreateTrace} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">بدء التتبع</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Traceability;
