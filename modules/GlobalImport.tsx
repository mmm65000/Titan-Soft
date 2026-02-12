
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ImportRecord } from '../types';

const GlobalImport: React.FC = () => {
  const { imports, lang, addImportRecord, clearImport, addLog, products } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newImp, setNewImp] = useState({ vessel: '', container: '', origin: '', dest: '', eta: '', val: '', tax: '' });

  const handleAdd = () => {
    if(!newImp.vessel || !newImp.val) return;
    const rec: ImportRecord = {
        id: `IMP-${Date.now()}`,
        vesselName: newImp.vessel,
        containerNumber: newImp.container || 'PENDING',
        originPort: newImp.origin || 'China',
        destinationPort: newImp.dest || 'Dammam',
        eta: newImp.eta,
        totalValue: parseFloat(newImp.val),
        customsDuty: parseFloat(newImp.tax) || 0
    };
    addImportRecord(rec);
    setShowModal(false);
    setNewImp({ vessel: '', container: '', origin: '', dest: '', eta: '', val: '', tax: '' });
  };

  const handleClearCustoms = (id: string) => {
      // Simulate checking manifesto
      const imp = imports.find(i => i.id === id);
      if(!imp) return;
      if(imp.eta.includes('CLEARED')) return alert('هذه الشحنة تم تخليصها مسبقاً.');

      const confirmClear = confirm(`هل تود تخليص الشحنة "${imp.containerNumber}" وإضافة البضائع للمخزون؟\n\nسيتم إضافة كميات افتراضية للأصناف الرئيسية.`);
      
      if(confirmClear) {
          // Simulate adding 50 units to the first 3 products for demo
          const dummyItems = products.slice(0, 3).map(p => ({
              productId: p.id,
              quantity: 50
          }));
          
          clearImport(id, dummyItems);
          alert('تم تخليص الشحنة جمركياً وإضافة الكميات للمستودع الرئيسي ✅');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">التجارة والاستيراد العالمي</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Cross-border Logistics, Vessels & Customs Clearance Hub</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-all"
        >
          فتح ملف استيراد جديد
          <span>🌍</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {imports.map(imp => (
          <div key={imp.id} className="glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40 relative overflow-hidden group">
             <div className={`absolute top-0 left-0 w-2 h-full ${imp.eta.includes('CLEARED') ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
             
             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner font-black">🚢</div>
                   <div>
                      <h4 className="text-2xl font-black text-slate-800">{imp.vesselName}</h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">CONTAINER: {imp.containerNumber}</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${imp.eta.includes('CLEARED') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {imp.eta.includes('CLEARED') ? 'مخلصة جمركياً' : 'قيد الإجراء'}
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-slate-50/50 rounded-[35px] border border-slate-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase mb-1">المسار البحري</p>
                   <p className="text-sm font-black text-slate-700">{imp.originPort} → {imp.destinationPort}</p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-[35px] border border-slate-100">
                   <p className="text-[9px] font-black text-gray-400 uppercase mb-1">موعد الوصول / الحالة</p>
                   <p className="text-sm font-black text-slate-700">{imp.eta}</p>
                </div>
             </div>

             <div className="bg-slate-900 p-8 rounded-[40px] text-white flex justify-between items-center shadow-xl">
                <div>
                   <p className="text-[10px] font-black opacity-40 uppercase">إجمالي قيمة الشحنة</p>
                   <h4 className="text-2xl font-black">${imp.totalValue.toLocaleString()}</h4>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black opacity-40 uppercase">الرسوم الجمركية</p>
                   <h4 className="text-2xl font-black text-orange-400">${imp.customsDuty.toLocaleString()}</h4>
                </div>
             </div>

             <div className="mt-8 flex gap-4">
                <button 
                    onClick={() => handleClearCustoms(imp.id)}
                    disabled={imp.eta.includes('CLEARED')}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {imp.eta.includes('CLEARED') ? 'تم إدخال المخزون' : 'تخليص وإدخال مخزني'}
                </button>
                <button className="px-8 py-4 glass border border-gray-100 rounded-2xl text-[10px] font-black text-slate-400">وثائق الجمارك 📂</button>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">بيان استيراد جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم السفينة</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.vessel} onChange={e=>setNewImp({...newImp, vessel: e.target.value})} placeholder="Evergreen Star..." />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ميناء الشحن</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.origin} onChange={e=>setNewImp({...newImp, origin: e.target.value})} placeholder="Shanghai" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ميناء الوصول</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.dest} onChange={e=>setNewImp({...newImp, dest: e.target.value})} placeholder="Jeddah" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">رقم الحاوية</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold uppercase" value={newImp.container} onChange={e=>setNewImp({...newImp, container: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ الوصول (ETA)</label>
                        <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.eta} onChange={e=>setNewImp({...newImp, eta: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">قيمة البضاعة ($)</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newImp.val} onChange={e=>setNewImp({...newImp, val: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الرسوم الجمركية ($)</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-orange-500" value={newImp.tax} onChange={e=>setNewImp({...newImp, tax: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ البوليصة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalImport;
