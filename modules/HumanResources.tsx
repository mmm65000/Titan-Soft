
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Staff } from '../types';

const HumanResources: React.FC = () => {
  const { staff, addStaff, addExpense, addToast, staffPerformance, safeBalance } = useApp();
  const [activeView, setActiveView] = useState<'employees' | 'payroll'>('employees');
  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', salary: '' });

  const totalPayrollCost = staff.filter(s => s.status === 'active').reduce((a, b) => a + b.salary, 0);

  const handleAdd = () => {
    if(!newEmp.name || !newEmp.salary) return;
    const s: Staff = {
        id: `EMP-${Date.now()}`,
        name: newEmp.name,
        role: newEmp.role || 'Employee',
        salary: parseFloat(newEmp.salary),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        attendance: []
    };
    addStaff(s);
    setShowModal(false);
    setNewEmp({ name: '', role: '', salary: '' });
  };

  const handleRunPayroll = () => {
      if (totalPayrollCost > safeBalance.cash) {
          return alert('رصيد الخزينة غير كافٍ لإتمام مسير الرواتب!');
      }
      if(confirm(`تأكيد صرف رواتب لعدد ${staff.filter(s => s.status === 'active').length} موظف بقيمة إجمالية $${totalPayrollCost.toLocaleString()}؟`)) {
          // Log bulk expense
          addExpense({
              category: 'Monthly Payroll',
              amount: totalPayrollCost,
              note: `Bulk Salary Payment - ${new Date().toLocaleDateString()}`,
              type: 'payroll'
          });
          addToast('تم اعتماد مسير الرواتب وخصم المبلغ من الخزينة بنجاح ✅', 'success');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">رأس المال البشري (HRM)</h2>
            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Talent Acquisition & Payroll Automation</p>
         </div>
         <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
            <button onClick={() => setActiveView('employees')} className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'employees' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>فريق العمل</button>
            <button onClick={() => setActiveView('payroll')} className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'payroll' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>مسير الرواتب</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-blue-50/50 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي الموظفين</p>
            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{staff.length}</h3>
            <span className="text-[9px] font-bold text-blue-500 uppercase">{staff.filter(s=>s.status==='active').length} Active Now</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-indigo-50/50 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">تكلفة الرواتب الشهرية</p>
            <h3 className="text-5xl font-black text-slate-800 tracking-tighter">${totalPayrollCost.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-indigo-500 uppercase">Fixed OPEX</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">متوسط الأداء (KPI)</p>
            <h3 className="text-5xl font-black tracking-tighter">92%</h3>
            <span className="text-[9px] font-bold text-emerald-400 uppercase animate-pulse">High Productivity</span>
         </div>
      </div>

      {activeView === 'employees' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <button 
                onClick={() => setShowModal(true)}
                className="bg-white border-2 border-dashed border-gray-200 rounded-[50px] flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all h-[320px] group"
            >
               <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">+</span>
               <span className="font-black text-sm uppercase tracking-widest">تسجيل موظف جديد</span>
            </button>
            
            {staff.map(emp => {
               const kpi = staffPerformance.find(p => p.staffId === emp.id)?.kpiScore || 0;
               return (
               <div key={emp.id} className="bg-white p-8 rounded-[50px] shadow-xl border border-gray-50 hover:bg-slate-50 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-2 h-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2rem] flex items-center justify-center text-2xl font-black text-white shadow-lg">
                        {emp.name[0]}
                     </div>
                     <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">{emp.role}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{emp.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Joined: {emp.joinDate}</p>
                  
                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-400 uppercase">Basic Salary</span>
                        <span className="text-slate-800">${emp.salary.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-gray-400 uppercase">KPI Score</span>
                        <span className={`${kpi > 80 ? 'text-emerald-500' : 'text-orange-500'}`}>{kpi}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{width: `${kpi}%`}}></div>
                     </div>
                  </div>

                  <div className="flex gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                     <button className="flex-1 py-3 bg-white border border-gray-200 rounded-2xl text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">Profile</button>
                     <button className="flex-1 py-3 bg-white border border-gray-200 rounded-2xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Chat</button>
                  </div>
               </div>
            )})}
         </div>
      )}

      {activeView === 'payroll' && (
         <div className="glass p-12 rounded-[60px] shadow-3xl border-white bg-white/40">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black text-slate-800">مسير الرواتب الشهري</h3>
               <button 
                onClick={handleRunPayroll}
                className="px-10 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3"
               >
                  <span>اعتماد وصرف الرواتب</span>
                  <span className="text-lg">💸</span>
               </button>
            </div>
            
            <div className="rounded-[40px] border border-white overflow-hidden bg-white/50">
               <table className="w-full text-right text-xs">
                  <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                     <tr>
                        <th className="p-6">الموظف</th>
                        <th className="p-6">الدور الوظيفي</th>
                        <th className="p-6">الراتب الأساسي</th>
                        <th className="p-6 text-red-500">الخصومات</th>
                        <th className="p-6 text-emerald-600">المكافآت</th>
                        <th className="p-6 font-black">صافي المستحق</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-slate-700">
                     {staff.map(emp => (
                        <tr key={emp.id} className="hover:bg-white transition-all">
                           <td className="p-6 font-bold">{emp.name}</td>
                           <td className="p-6 text-gray-500">{emp.role}</td>
                           <td className="p-6">${emp.salary.toLocaleString()}</td>
                           <td className="p-6 text-red-500 font-bold">$0</td>
                           <td className="p-6 text-emerald-600 font-bold">$0</td>
                           <td className="p-6 font-black text-slate-900 text-lg">${emp.salary.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">توظيف جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم الكامل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newEmp.name} onChange={e=>setNewEmp({...newEmp, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المسمى الوظيفي</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newEmp.role} onChange={e=>setNewEmp({...newEmp, role: e.target.value})} placeholder="Manager, Sales..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الراتب الأساسي ($)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newEmp.salary} onChange={e=>setNewEmp({...newEmp, salary: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ السجل</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HumanResources;
