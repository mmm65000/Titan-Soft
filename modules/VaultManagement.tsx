
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const VaultManagement: React.FC = () => {
  const { safeBalance, safeTransactions, sales, lang, addVoucher, addLog } = useApp();
  const [showZReport, setShowZReport] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'in', amount: '', desc: '' });

  const cashSales = sales.filter(s => s.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0);
  const cardSales = sales.filter(s => s.paymentMethod === 'card').reduce((a, b) => a + b.total, 0);

  const handleManualEntry = () => {
      if(!newEntry.amount || !newEntry.desc) return;
      addVoucher({
          id: `MAN-${Date.now()}`,
          type: newEntry.type === 'in' ? 'receipt' : 'payment',
          accountId: 'CASH-VAULT',
          accountName: 'الخزينة النقدية',
          amount: parseFloat(newEntry.amount),
          date: new Date().toISOString(),
          description: newEntry.desc,
          paymentMethod: 'cash'
      });
      addLog(`Manual Vault ${newEntry.type}: $${newEntry.amount}`, 'info', 'Finance');
      setShowEntryModal(false);
      setNewEntry({ type: 'in', amount: '', desc: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الأرصدة والعهدة</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">التحكم المركزي في السيولة، إغلاق الوردية، ومطابقة الأرصدة</p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setShowEntryModal(true)} className="px-8 py-5 bg-white border border-gray-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:border-blue-400 transition-all">إيداع / سحب يدوي 💸</button>
            <button onClick={() => setShowZReport(true)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">إصدار تقرير الإغلاق (Z-Report)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-64" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي النقدية المتوفرة</p>
           <h3 className="text-5xl font-black text-slate-800 tracking-tighter">${safeBalance.cash.toLocaleString()}</h3>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase">متاح حالياً للصرف</span>
           </div>
        </div>
        <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-64" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">رصيد الشبكة / البطاقات</p>
           <h3 className="text-5xl font-black text-slate-800 tracking-tighter">${safeBalance.card.toLocaleString()}</h3>
           <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-[9px] font-black text-blue-600 uppercase">في انتظار التسوية البنكية</span>
           </div>
        </div>
        <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white flex flex-col justify-between h-64" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
           <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">مبيعات اليوم المحققة</p>
           <h3 className="text-5xl font-black tracking-tighter">${(cashSales + cardSales).toLocaleString()}</h3>
           <div className="flex gap-4">
              <div className="flex flex-col">
                 <span className="text-[8px] opacity-40 uppercase">كاش</span>
                 <span className="text-xs font-black">${cashSales.toLocaleString()}</span>
              </div>
              <div className="flex flex-col border-r border-white/10 pr-4">
                 <span className="text-[8px] opacity-40 uppercase">شبكة</span>
                 <span className="text-xs font-black">${cardSales.toLocaleString()}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="glass p-12 rounded-[60px] shadow-2xl bg-white/40" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
         <h3 className="text-xl font-black mb-10 flex items-center gap-4">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            سجل التدفق المالي (Cash Flow)
         </h3>
         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
            {safeTransactions.map(tx => (
               <div key={tx.id} className="p-6 bg-white/60 rounded-[2.5rem] border border-white flex justify-between items-center hover:bg-white transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${tx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} shadow-inner`}>
                        {tx.type === 'in' ? '↑' : '↓'}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{new Date(tx.date).toLocaleString()} • الطريقة: {tx.paymentMethod === 'cash' ? 'نقد' : 'بطاقة'}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className={`text-2xl font-black tracking-tighter ${tx.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'in' ? '+' : '-'}${tx.amount.toLocaleString()}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {showEntryModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
              <div className="glass w-full max-w-md p-12 rounded-[60px] shadow-3xl border-white relative" dir="rtl">
                  <h3 className="text-2xl font-black mb-8 text-center">إدخال يدوي للخزينة</h3>
                  <div className="space-y-6">
                      <div className="flex gap-4">
                          <button onClick={()=>setNewEntry({...newEntry, type:'in'})} className={`flex-1 py-4 rounded-2xl font-black text-xs ${newEntry.type==='in' ? 'bg-emerald-500 text-white shadow-xl' : 'bg-gray-100'}`}>إيداع (In)</button>
                          <button onClick={()=>setNewEntry({...newEntry, type:'out'})} className={`flex-1 py-4 rounded-2xl font-black text-xs ${newEntry.type==='out' ? 'bg-red-500 text-white shadow-xl' : 'bg-gray-100'}`}>سحب (Out)</button>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المبلغ</label>
                          <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-2xl text-center" value={newEntry.amount} onChange={e=>setNewEntry({...newEntry, amount: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">البيان / السبب</label>
                          <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newEntry.desc} onChange={e=>setNewEntry({...newEntry, desc: e.target.value})} placeholder="مثلاً: دفعة مصروفات نثرية..." />
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button onClick={() => setShowEntryModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                          <button onClick={handleManualEntry} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">تأفيذ العملية</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showZReport && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-[400px] p-12 rounded-[50px] shadow-3xl border-white relative font-mono text-slate-800" dir="rtl">
              <div className="text-center mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tighter">Z-REPORT</h2>
                 <p className="text-[10px] font-bold opacity-60">نظام تايتان - جرد نهاية اليوم</p>
                 <div className="my-6 border-b border-dashed border-gray-300"></div>
              </div>
              <div className="space-y-4 mb-10 text-xs">
                 <div className="flex justify-between"><span>إجمالي المبيعات:</span><span className="font-black">${(cashSales + cardSales).toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>إجمالي التحصيل النقدي:</span><span className="font-black text-emerald-600">${cashSales.toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>إجمالي تحصيل الشبكة:</span><span className="font-black text-blue-600">${cardSales.toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>إجمالي المصروفات:</span><span className="font-black text-red-500">$0.00</span></div>
              </div>
              <div className="space-y-2 border-t border-dashed border-gray-300 pt-6">
                 <div className="flex justify-between font-black text-lg"><span>صافي العهدة:</span><span>${cashSales.toFixed(2)}</span></div>
              </div>
              <div className="mt-12 space-y-4">
                 <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">طباعة التقرير وإقفال اليومية</button>
                 <button onClick={() => setShowZReport(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[9px]">إغلاق</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VaultManagement;
