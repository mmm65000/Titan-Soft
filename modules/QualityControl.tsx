
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { QCRecord } from '../types';

const QualityControl: React.FC = () => {
  const { qcRecords, productionOrders, lang, addQCRecord } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newQC, setNewQC] = useState({ orderId: '', status: 'passed', notes: '' });

  const handleAdd = () => {
    if(!newQC.orderId) return;
    const r: QCRecord = {
        id: `QC-${Date.now()}`,
        orderId: newQC.orderId,
        status: newQC.status as any,
        notes: newQC.notes || 'No notes',
        date: new Date().toISOString()
    };
    addQCRecord(r);
    setShowModal(false);
    setNewQC({ orderId: '', status: 'passed', notes: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">الرقابة والجودة الصناعية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Total Quality Management (TQM) & Production Compliance</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-700 transition-all"
        >
          إجراء فحص جديد +
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Live Production QC */}
         <div className="lg:col-span-2 glass p-12 rounded-[60px] shadow-2xl border-white bg-white/40">
            <h3 className="text-xl font-black mb-8 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-indigo-600 rounded-full"></div>
               أوامر الإنتاج تحت الفحص
            </h3>
            <div className="space-y-6">
               {productionOrders.filter(o => o.status === 'in_progress').map(order => (
                  <div key={order.id} className="p-8 bg-white rounded-[40px] border border-gray-100 flex justify-between items-center group hover:shadow-lg transition-all shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner">#</div>
                        <div>
                           <h4 className="text-lg font-black text-slate-800">أمر إنتاج: {order.id}</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">الكمية: {order.quantity} • البدء: {new Date(order.startDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setNewQC({...newQC, orderId: order.id}); setShowModal(true); }}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 shadow-xl"
                     >
                        تحرير تقرير جودة
                     </button>
                  </div>
               ))}
               {productionOrders.filter(o => o.status === 'in_progress').length === 0 && (
                  <div className="py-20 text-center opacity-30 font-black uppercase text-xs">لا توجد أوامر إنتاج نشطة حالياً تحتاج للفحص</div>
               )}
            </div>
         </div>

         {/* QC Intelligence */}
         <div className="space-y-8">
            <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white">
               <h3 className="text-xl font-black mb-8">إحصائيات الامتثال</h3>
               <div className="space-y-8">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">معدل النجاح (Pass Rate)</p>
                     <h4 className="text-4xl font-black text-emerald-400">98.4%</h4>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">القطع المعزولة (Quarantined)</p>
                     <h4 className="text-4xl font-black">12 قطع</h4>
                  </div>
               </div>
            </div>
            
            <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">آخر تقارير الجودة</h4>
               <div className="space-y-4">
                  {qcRecords.slice(0, 3).map(r => (
                     <div key={r.id} className="p-4 bg-white/60 rounded-2xl border border-gray-50 flex justify-between items-center">
                        <span className="text-xs font-black">{r.id}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${r.status === 'passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">تقرير فحص جودة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">أمر الإنتاج المرتبط</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newQC.orderId} onChange={e=>setNewQC({...newQC, orderId: e.target.value})}>
                       <option value="">اختر أمر إنتاج...</option>
                       {productionOrders.filter(o=>o.status==='in_progress').map(o => <option key={o.id} value={o.id}>{o.id} - ({o.quantity} Units)</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نتيجة الفحص</label>
                    <div className="flex gap-4">
                        <button onClick={()=>setNewQC({...newQC, status: 'passed'})} className={`flex-1 py-4 rounded-2xl font-bold ${newQC.status==='passed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Passed ✅</button>
                        <button onClick={()=>setNewQC({...newQC, status: 'failed'})} className={`flex-1 py-4 rounded-2xl font-bold ${newQC.status==='failed' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Failed ❌</button>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ملاحظات الفاحص</label>
                    <textarea className="w-full glass-dark p-4 rounded-3xl outline-none font-bold min-h-[100px]" value={newQC.notes} onChange={e=>setNewQC({...newQC, notes: e.target.value})} placeholder="تفاصيل العيوب أو الملاحظات..." />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">اعتماد التقرير</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default QualityControl;
