
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Project } from '../types';

const ProjectMatrix: React.FC = () => {
  const { projects, lang, addProject, updateProject, customers, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newProj, setNewProj] = useState({ name: '', budget: '', customerId: '', endDate: '' });

  const handleAdd = () => {
    if(!newProj.name || !newProj.budget) return;
    const p: Project = {
        id: `PRJ-${Date.now()}`,
        name: newProj.name,
        customerId: newProj.customerId || 'Internal',
        budget: parseFloat(newProj.budget),
        spent: 0,
        status: 'active',
        endDate: newProj.endDate || '2025-12-31'
    };
    addProject(p);
    setShowModal(false);
    setNewProj({ name: '', budget: '', customerId: '', endDate: '' });
  };

  const addExpenseToProject = (id: string) => {
      const amount = prompt('أدخل قيمة المصروف الإضافي:');
      if(amount) {
          const val = parseFloat(amount);
          const proj = projects.find(p => p.id === id);
          if (proj) {
              updateProject(id, { spent: proj.spent + val });
              addLog(`Expense added to project ${proj.name}: $${val}`, 'warning', 'Projects');
          }
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مصفوفة المشاريع والتكاليف</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">End-to-End Project P&L, Resource Allocation & Milestone Tracking</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
        >
            إطلاق مشروع استراتيجي +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(prj => (
          <div key={prj.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-white/40 hover:bg-white transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-inner">#</div>
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">نشط</span>
             </div>

             <h3 className="text-2xl font-black text-slate-800 mb-2">{prj.name}</h3>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">Client: {prj.customerId} • End: {prj.endDate}</p>

             <div className="space-y-4 mb-10">
                <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-gray-400">استهلاك الميزانية</span>
                   <span className="text-slate-800">{Math.round((prj.spent / prj.budget) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-white shadow-inner">
                   <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(prj.spent / prj.budget) * 100}%` }}></div>
                </div>
             </div>

             <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                <div>
                   <p className="text-[8px] font-black text-gray-400 uppercase">المنصرف الفعلي</p>
                   <p className="text-xl font-black text-slate-800">${prj.spent.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-gray-400 uppercase">الميزانية المعتمدة</p>
                   <p className="text-xl font-black text-indigo-600">${prj.budget.toLocaleString()}</p>
                </div>
             </div>

             <div className="flex gap-4 mt-8">
                <button onClick={() => addExpenseToProject(prj.id)} className="flex-1 py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-100 transition-all">تسجيل مصروف</button>
                <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">التقارير</button>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">مشروع جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم المشروع</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newProj.name} onChange={e=>setNewProj({...newProj, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الميزانية المرصودة</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newProj.budget} onChange={e=>setNewProj({...newProj, budget: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">العميل (اختياري)</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewProj({...newProj, customerId: e.target.value})}>
                       <option value="Internal">مشروع داخلي</option>
                       {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ الانتهاء</label>
                    <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newProj.endDate} onChange={e=>setNewProj({...newProj, endDate: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إطلاق المشروع</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMatrix;
