
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Expense } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Finance: React.FC = () => {
  const { expenses, addExpense, safeTransactions, lang, generateAIContent, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({ category: '', amount: '', note: '', receiptImage: '' });
  const [capturing, setCapturing] = useState(false);

  const handleSmartCapture = async () => {
    setCapturing(true);
    try {
        // Simulating Image Capture
        const mockImage = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop';
        
        // AI Processing Simulation
        const prompt = `
            Act as an OCR engine extracting data from a receipt image. 
            Generate a JSON object with realistic data for a business expense.
            Randomize the values:
            - category: choose one (Utilities, Rent, Supplies, Maintenance, Hospitality)
            - amount: random number between 50 and 500
            - note: short description of items purchased (in Arabic).
            
            Return ONLY valid JSON: { "category": "...", "amount": 0, "note": "..." }
        `;

        const response = await generateAIContent(prompt, 'text');
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        setNewExp({
            category: data.category,
            amount: data.amount.toString(),
            note: data.note,
            receiptImage: mockImage
        });
        addToast('تم تحليل الإيصال واستخراج البيانات بنجاح ✨', 'success');

    } catch (e) {
        console.error(e);
        addToast('فشل التحليل الذكي للإيصال', 'error');
    }
    setCapturing(false);
  };

  const onAdd = () => {
    if (!newExp.category || !newExp.amount) return;
    addExpense({
      category: newExp.category,
      amount: parseFloat(newExp.amount) || 0,
      note: newExp.note,
      type: 'manual',
      receiptImage: newExp.receiptImage || undefined
    });
    setIsModalOpen(false);
    setNewExp({ category: '', amount: '', note: '', receiptImage: '' });
  };

  // Mock data for forecasting
  const cashFlowData = [
      { day: 'Day 1', value: 4000 },
      { day: 'Day 2', value: 3000 },
      { day: 'Day 3', value: 5000 },
      { day: 'Day 4', value: 2000 },
      { day: 'Day 5', value: 6000 },
      { day: 'Day 6', value: 4500 },
      { day: 'Day 7', value: 7000 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{lang === 'ar' ? 'المصاريف والتدفق' : 'OPEX Hub'}</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Simplified expense logging & digital receipts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-600 transition-all">
          تسجيل مصروف
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Cash Flow Chart */}
         <div className="lg:col-span-3 bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 overflow-hidden">
             <div className="flex justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-800">توقعات السيولة (Cash Forecast)</h3>
                 <div className="flex gap-2">
                     <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase">إيجابي</span>
                 </div>
             </div>
             <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={cashFlowData}>
                         <defs>
                             <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                         </defs>
                         <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                         <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fill="url(#colorVal)" />
                         <XAxis dataKey="day" hide />
                     </AreaChart>
                 </ResponsiveContainer>
             </div>
         </div>

         {/* Expenses List */}
         <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {expenses.slice(0, 6).map(e => (
            <div key={e.id} className="glass p-8 rounded-[40px] shadow-xl border-white hover:bg-white transition-all flex flex-col justify-between h-64 group">
                <div className="flex justify-between items-start">
                    <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{e.category}</span>
                    {e.receiptImage && <span className="text-xs group-hover:scale-125 transition-transform">📎</span>}
                </div>
                <div>
                    <h4 className="text-3xl font-black text-slate-800">${e.amount.toLocaleString()}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 truncate">{e.note || 'No description provided.'}</p>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(e.date).toLocaleDateString()}</p>
            </div>
            ))}
            {expenses.length === 0 && <div className="col-span-2 py-20 text-center opacity-30 font-black uppercase text-xs">No active expense logs.</div>}
         </div>

         {/* Transactions Feed */}
         <div className="lg:col-span-1 glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
               <div className="w-2.5 h-7 bg-blue-600 rounded-full"></div>
               التدفق النقدي المباشر
            </h3>
            <div className="space-y-4">
               {safeTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm">
                     <div>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${tx.type === 'in' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                           <p className="text-[10px] font-black text-slate-800 truncate w-32">{tx.description}</p>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{new Date(tx.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                     </div>
                     <span className={`text-sm font-black ${tx.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.type === 'in' ? '+' : '-'}${tx.amount.toLocaleString()}
                     </span>
                  </div>
               ))}
               {safeTransactions.length === 0 && <p className="text-center py-10 opacity-30 text-[10px] font-black uppercase">لا توجد حركات اليوم</p>}
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-xl p-14 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8">تسجيل مصروف جديد</h3>
              <div className="space-y-6">
                 
                 {/* Smart Scan Section */}
                 <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                       <button 
                         onClick={handleSmartCapture}
                         disabled={capturing}
                         className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                       >
                          {capturing ? <span className="animate-spin">⚙️</span> : '📷'}
                       </button>
                       <div>
                          <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">المسح الذكي (AI OCR)</p>
                          <p className="text-[9px] text-blue-600/70 font-bold uppercase">{capturing ? 'جاري تحليل الصورة...' : 'التقاط لاستخراج البيانات'}</p>
                       </div>
                    </div>
                    {newExp.receiptImage && (
                       <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-white relative z-10">
                          <img src={newExp.receiptImage} className="w-full h-full object-cover" />
                       </div>
                    )}
                    {/* Decor */}
                    <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-blue-200/20 rounded-full blur-xl"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">البند / التصنيف</label>
                       <input 
                         type="text" 
                         className="w-full glass-dark p-4 rounded-2xl font-black outline-none border-white transition-all focus:bg-white"
                         placeholder="إيجار، كهرباء..."
                         value={newExp.category}
                         onChange={e => setNewExp({...newExp, category: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المبلغ ($)</label>
                       <input 
                         type="number" 
                         className="w-full glass-dark p-4 rounded-2xl font-black outline-none border-white text-red-500 transition-all focus:bg-white"
                         placeholder="0.00"
                         value={newExp.amount}
                         onChange={e => setNewExp({...newExp, amount: e.target.value})}
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ملاحظات</label>
                    <textarea 
                      className="w-full glass-dark p-4 rounded-3xl font-bold outline-none border-white min-h-[80px] transition-all focus:bg-white"
                      placeholder="تفاصيل إضافية..."
                      value={newExp.note}
                      onChange={e => setNewExp({...newExp, note: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={onAdd} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all">اعتماد العملية</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
