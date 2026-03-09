
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MaintenanceTask } from '../types';

const MaintenanceOps: React.FC = () => {
  const { maintenanceTasks, lang, addMaintenanceTask, fixedAssets, addLog, updateAsset, addExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ assetName: '', type: 'Repair', engineer: '', date: '' });

  const handleAdd = () => {
    if(!newTask.assetName || !newTask.date) return;
    const t: MaintenanceTask = {
        id: `MT-${Date.now()}`,
        assetName: newTask.assetName,
        taskType: newTask.type,
        priority: 'medium',
        assignedEngineer: newTask.engineer || 'Unassigned',
        scheduledDate: newTask.date
    };
    addMaintenanceTask(t);
    // Auto update asset status to maintenance
    const asset = fixedAssets.find(a => a.name === newTask.assetName);
    if(asset) updateAsset(asset.id, { status: 'maintenance' });
    
    setShowModal(false);
    setNewTask({ assetName: '', type: 'Repair', engineer: '', date: '' });
  };

  const handleComplete = (task: MaintenanceTask) => {
      const costStr = prompt('أدخل تكلفة الصيانة الفعلية (قطع غيار + عمالة):', '0');
      if (costStr === null) return;
      const cost = parseFloat(costStr) || 0;

      if(confirm(`تأكيد إتمام صيانة "${task.assetName}" بتكلفة $${cost} وإعادة الأصل للخدمة؟`)) {
          const asset = fixedAssets.find(a => a.name === task.assetName);
          if(asset) {
              updateAsset(asset.id, { status: 'active' });
              // Record Expense
              addExpense({
                  category: 'Maintenance & Repairs',
                  amount: cost,
                  note: `Maintenance for Asset: ${task.assetName}`,
                  type: 'maintenance'
              });
              addLog(`تم إتمام صيانة: ${task.assetName} بواسطة ${task.assignedEngineer} بتكلفة $${cost}`, 'success', 'Maintenance');
              alert('تم تحديث حالة الأصل، تسجيل المصروف، وإغلاق أمر العمل بنجاح ✅');
          } else {
              alert('لم يتم العثور على الأصل في السجلات');
          }
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">عمليات الصيانة والاستدامة (MRO)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Asset Health Monitoring, Predictive Repair & Scheduling</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-orange-700 transition-all"
        >
            جدولة مهمة صيانة +
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 glass p-12 rounded-[60px] shadow-2xl border-white bg-white/40">
            <h3 className="text-xl font-black mb-10 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-orange-500 rounded-full"></div>
               جدول المهام الفنية المفتوحة
            </h3>
            <div className="space-y-6">
               {maintenanceTasks.map(task => (
                 <div key={task.id} className="p-8 bg-white/60 rounded-[40px] border border-white flex justify-between items-center hover:bg-white transition-all shadow-sm group">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner font-black ${
                          task.priority === 'critical' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-orange-50 text-orange-600'
                       }`}>
                          🔧
                       </div>
                       <div>
                          <p className="text-lg font-black text-slate-800">{task.assetName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">التصنيف: {task.taskType} • المهندس: {task.assignedEngineer}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-slate-400 uppercase mb-2">الموعد</p>
                       <p className="text-sm font-black text-slate-800">{task.scheduledDate}</p>
                       <button onClick={() => handleComplete(task)} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md">إتمام الصيانة</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h3 className="text-xl font-black mb-8 relative z-10">إحصائيات الأصول (OEE)</h3>
               <div className="space-y-8 relative z-10">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">جاهزية الأسطول</p>
                     <h4 className="text-4xl font-black text-emerald-400">96%</h4>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">متوسط عمر الصيانة</p>
                     <h4 className="text-4xl font-black">120 يوم</h4>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">أمر شغل (صيانة)</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الأصل / المعدة</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewTask({...newTask, assetName: e.target.value})}>
                        <option value="">اختر الأصل...</option>
                        {fixedAssets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نوع الصيانة</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewTask({...newTask, type: e.target.value})}>
                        <option value="Repair">إصلاح عطل (Repair)</option>
                        <option value="Preventive">صيانة وقائية (Preventive)</option>
                        <option value="Inspection">فحص دوري (Inspection)</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المهندس المسؤول</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newTask.engineer} onChange={e=>setNewTask({...newTask, engineer: e.target.value})} placeholder="الاسم" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ التنفيذ</label>
                    <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newTask.date} onChange={e=>setNewTask({...newTask, date: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">جدولة الأمر</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceOps;
