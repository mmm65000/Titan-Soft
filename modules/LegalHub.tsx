
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { LegalCase } from '../types';

const LegalHub: React.FC = () => {
  const { legalCases, audits, lang, addLegalCase, updateLegalCase, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', type: 'Civil', parties: '', desc: '' });

  const handleAdd = () => {
    if(!newCase.title || !newCase.desc) return;
    const l: LegalCase = {
        id: `LC-${Date.now()}`,
        title: newCase.title,
        type: newCase.type,
        status: 'open',
        description: newCase.desc,
        involvedParties: newCase.parties,
        nextStep: 'Initial Review'
    };
    addLegalCase(l);
    setShowModal(false);
    setNewCase({ title: '', type: 'Civil', parties: '', desc: '' });
  };

  const handleStatusChange = (id: string, current: string) => {
      const newStatus = current === 'open' ? 'hearing' : current === 'hearing' ? 'closed' : 'open';
      updateLegalCase(id, { status: newStatus as any });
      addLog(`Legal Case ${id} updated to ${newStatus}`, 'info', 'Legal');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">المركز القانوني والامتثال</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Legal Oversight, Regulatory Compliance & Case Management</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-all"
        >
          فتح ملف قضية جديدة
          <span>⚖️</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
               سجل القضايا النشطة
            </h3>
            {legalCases.map(lc => (
               <div key={lc.id} className="glass p-10 rounded-[60px] border border-white shadow-2xl bg-white/40 relative overflow-hidden group hover:bg-white transition-all">
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{lc.title}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">ID: {lc.id} • {lc.type.replace('_', ' ')}</p>
                     </div>
                     <button 
                        onClick={() => handleStatusChange(lc.id, lc.status)}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase hover:opacity-80 transition-opacity ${
                        lc.status === 'hearing' ? 'bg-orange-50 text-orange-600 animate-pulse' : lc.status === 'closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                        {lc.status === 'hearing' ? 'قيد الجلسات' : lc.status === 'closed' ? 'مغلقة' : 'مفتوحة'}
                     </button>
                  </div>
                  
                  <p className="text-slate-600 font-bold mb-8 text-sm leading-relaxed">{lc.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                     <div className="p-6 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">الطرف المعارض</p>
                        <p className="text-sm font-black text-slate-700">{lc.involvedParties}</p>
                     </div>
                     <div className="p-6 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">الإجراء القادم</p>
                        <p className="text-sm font-black text-slate-700">{lc.nextStep}</p>
                     </div>
                  </div>
                  
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-xl">تحرير مستندات القضية</button>
               </div>
            ))}
         </div>

         <div className="space-y-8">
            <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h3 className="text-xl font-black mb-8 relative z-10">نتائج التدقيق (Compliance)</h3>
               <div className="space-y-6 relative z-10">
                  {audits.map(audit => (
                     <div key={audit.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-[10px] font-black text-emerald-400 uppercase">{audit.title}</span>
                           <span className="text-xl font-black">{audit.score}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${audit.score}%` }}></div>
                        </div>
                        <p className="text-[9px] text-white/40 mt-3 font-bold uppercase">{audit.date} • {audit.auditor}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">ملف قانوني جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">عنوان القضية / النزاع</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCase.title} onChange={e=>setNewCase({...newCase, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">التصنيف</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewCase({...newCase, type: e.target.value})}>
                        <option value="Civil">مدني / تجاري</option>
                        <option value="Labor">عمالي</option>
                        <option value="Criminal">جنائي</option>
                        <option value="IP">ملكية فكرية</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الأطراف المعنية</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCase.parties} onChange={e=>setNewCase({...newCase, parties: e.target.value})} placeholder="شركة س، المورد ص..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الوصف</label>
                    <textarea className="w-full glass-dark p-4 rounded-3xl outline-none font-bold min-h-[100px]" value={newCase.desc} onChange={e=>setNewCase({...newCase, desc: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">فتح الملف</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LegalHub;
