
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { StaffDocument } from '../types';

const HRDocs: React.FC = () => {
  const { staffDocuments, staff, lang, addStaffDocument } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', staffId: '', type: 'contract', expiry: '' });

  const handleAdd = () => {
    if(!newDoc.title || !newDoc.staffId) return;
    const d: StaffDocument = {
        id: `DOC-${Date.now()}`,
        staffId: newDoc.staffId,
        title: newDoc.title,
        type: newDoc.type as any,
        expiryDate: newDoc.expiry || 'N/A'
    };
    addStaffDocument(d);
    setShowModal(false);
    setNewDoc({ title: '', staffId: '', type: 'contract', expiry: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">خزنة الوثائق الرقمية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Secure Employee Document Repository & Compliance Management</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
            رفع وثيقة جديدة +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {staffDocuments.map(doc => {
          const employee = staff.find(s => s.id === doc.staffId);
          return (
            <div key={doc.id} className="glass p-8 rounded-[45px] border border-white shadow-xl bg-white/40 hover:bg-white transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     {doc.type === 'contract' ? '📜' : '🪪'}
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">ساري</span>
               </div>
               <h4 className="text-lg font-black text-slate-800 mb-1">{doc.title}</h4>
               <p className="text-blue-600 font-bold text-xs mb-6">{employee?.name || 'Unknown Staff'}</p>
               
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">تاريخ الانتهاء</p>
                  <p className="text-xs font-black text-slate-700">{doc.expiryDate}</p>
               </div>

               <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">عرض المستند</button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">أرشفة وثيقة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">عنوان الوثيقة</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newDoc.title} onChange={e=>setNewDoc({...newDoc, title: e.target.value})} placeholder="عقد عمل، هوية..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الموظف المعني</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewDoc({...newDoc, staffId: e.target.value})}>
                        <option value="">اختر الموظف...</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">النوع</label>
                        <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewDoc({...newDoc, type: e.target.value})}>
                            <option value="contract">عقد</option>
                            <option value="id">هوية / إقامة</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ الانتهاء</label>
                        <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newDoc.expiry} onChange={e=>setNewDoc({...newDoc, expiry: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ في الأرشيف</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HRDocs;
