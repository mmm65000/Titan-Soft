
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Budget } from '../types';

const FiscalPlanning: React.FC = () => {
  const { budgets, financialForecasts, lang, addBudget } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', amount: '' });

  const handleAdd = () => {
    if(!newBudget.name || !newBudget.amount) return;
    const b: Budget = {
        id: `BDG-${Date.now()}`,
        name: newBudget.name,
        allocated: parseFloat(newBudget.amount),
        spent: 0,
        variance: 0,
        status: 'within_budget'
    };
    addBudget(b);
    setShowModal(false);
    setNewBudget({ name: '', amount: '' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">التخطيط والميزانيات (Fiscal Planning)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Departmental Budgets, Cost Variance & Burn Rate Analysis</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
        >
            تخصيص ميزانية جديدة +
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="glass p-12 rounded-[60px] shadow-3xl border-white bg-white/40">
            <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
               مراقبة ميزانيات الأقسام
            </h3>
            <div className="space-y-8">
               {budgets.map(budget => (
                  <div key={budget.id} className="p-8 bg-white/60 rounded-[35px] border border-gray-50 hover:bg-white transition-all shadow-sm group">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h4 className="text-xl font-black text-slate-800">{budget.name}</h4>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">ID: {budget.id}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                           budget.status === 'within_budget' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                           {budget.status.replace('_', ' ')}
                        </span>
                     </div>

                     <div className="flex justify-between mb-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">الاستهلاك: ${budget.spent.toLocaleString()}</span>
                        <span className="text-slate-800">المخصص: ${budget.allocated.toLocaleString()}</span>
                     </div>
                     <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-white shadow-inner mb-6">
                        <div 
                           className={`h-full transition-all duration-1000 ${budget.spent / budget.allocated > 0.9 ? 'bg-red-500' : 'bg-blue-600'}`} 
                           style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                        ></div>
                     </div>
                     
                     <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">الانحراف (Variance): <span className={budget.variance > 0 ? 'text-red-500' : 'text-emerald-500'}>{budget.variance}%</span></span>
                        <button className="text-blue-600 font-black uppercase hover:underline">تحليل التكاليف ←</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass p-12 rounded-[60px] shadow-3xl border-white bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <h3 className="text-xl font-black mb-10 flex items-center gap-4 relative z-10">
                  <div className="w-2.5 h-8 bg-indigo-500 rounded-full"></div>
                  التنبؤ المالي الذكي (AI Forecasting)
               </h3>
               <div className="space-y-8 relative z-10">
                  {financialForecasts.map((f, i) => (
                     <div key={i} className="p-8 bg-white/5 rounded-[40px] border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{f.month}</span>
                           <span className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">{f.trend === 'up' ? '📈' : '📉'}</span>
                        </div>
                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">الإيراد المتوقع</p>
                        <h4 className="text-4xl font-black text-white tracking-tighter">${f.predictedRevenue.toLocaleString()}</h4>
                        <div className="mt-6 flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${f.confidenceScore}%` }}></div>
                           </div>
                           <span className="text-[9px] font-black text-emerald-400">{f.confidenceScore}% Confidence</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="glass p-10 rounded-[60px] shadow-2xl border-white bg-white/40 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-3xl font-black mb-6 shadow-inner border-4 border-white">Σ</div>
               <h4 className="text-xl font-black text-slate-800">معدل الحرق النقدي (Burn Rate)</h4>
               <p className="text-4xl font-black text-red-500 mt-2">$2,450 / Month</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">المسار المتبقي للسيولة: 24 شهر</p>
            </div>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">ميزانية جديدة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم البند / القسم</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newBudget.name} onChange={e=>setNewBudget({...newBudget, name: e.target.value})} placeholder="التسويق، التشغيل..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المبلغ المخصص ($)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newBudget.amount} onChange={e=>setNewBudget({...newBudget, amount: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">اعتماد المخصص</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FiscalPlanning;
