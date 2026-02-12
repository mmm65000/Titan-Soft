
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const CalendarHub: React.FC = () => {
  const { maintenanceTasks, projects, contracts, installmentPlans, staff, lang } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  // Aggregate Events
  const events = [
    ...maintenanceTasks.map(t => ({ 
        id: t.id, 
        title: `صيانة: ${t.assetName}`, 
        date: t.scheduledDate, 
        type: 'maintenance', 
        color: 'bg-orange-500' 
    })),
    ...projects.map(p => ({ 
        id: p.id, 
        title: `تسليم مشروع: ${p.name}`, 
        date: p.endDate, 
        type: 'project', 
        color: 'bg-blue-600' 
    })),
    ...contracts.map(c => ({ 
        id: c.id, 
        title: `نهاية عقد: ${c.serviceName}`, 
        date: c.endDate, 
        type: 'contract', 
        color: 'bg-purple-600' 
    })),
    ...installmentPlans.flatMap(p => p.installments.filter(i => i.status === 'pending').map(i => ({ 
        id: i.id, 
        title: `قسط مستحق: ${p.customerId}`, 
        date: i.dueDate.split('T')[0], 
        type: 'finance', 
        color: 'bg-red-500' 
    }))),
    ...staff.map(s => ({
        id: s.id,
        title: `ذكرى انضمام: ${s.name}`,
        date: s.joinDate, // In real app, we'd calculate the anniversary for current year
        type: 'hr',
        color: 'bg-emerald-500'
    }))
  ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);
  const selectedDayEvents = filteredEvents.filter(e => e.date === selectedDate);

  // Generate Calendar Grid (Mock for current month)
  const daysInMonth = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(1); // Start of this month
      d.setDate(i + 1);
      return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">التقويم المركزي الموحد</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Operations Timeline, Deadlines & Schedules</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50 overflow-x-auto custom-scrollbar no-scrollbar">
           {['all', 'maintenance', 'project', 'finance', 'contract'].map(f => (
               <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
               >
                   {f === 'all' ? 'الكل' : f}
               </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Calendar View */}
         <div className="lg:col-span-2 glass p-10 rounded-[60px] shadow-3xl border-white bg-white/40">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100">←</button>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-slate-100">→</button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-4">
                {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase py-2">{d}</div>
                ))}
                {daysInMonth.map(date => {
                    const hasEvent = filteredEvents.some(e => e.date === date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                        <div 
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all border ${
                                selectedDate === date 
                                ? 'bg-slate-900 text-white shadow-xl scale-110 border-slate-900' 
                                : isToday ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white/60 hover:bg-white border-white'
                            }`}
                        >
                            <span className="text-sm font-black">{new Date(date).getDate()}</span>
                            {hasEvent && <div className="flex gap-1 mt-1">
                                {filteredEvents.filter(e=>e.date===date).slice(0,3).map((e,i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.color}`}></div>
                                ))}
                            </div>}
                        </div>
                    );
                })}
            </div>
         </div>

         {/* Events List */}
         <div className="lg:col-span-1 bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100 h-fit">
             <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                 <span className="text-2xl">📅</span> أحداث {selectedDate}
             </h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                 {selectedDayEvents.map((evt, i) => (
                     <div key={i} className="p-5 rounded-[25px] bg-slate-50 border border-slate-100 hover:shadow-md transition-all group animate-in slide-in-from-right-2">
                         <div className="flex items-center gap-3 mb-2">
                             <div className={`w-2 h-8 rounded-full ${evt.color}`}></div>
                             <div>
                                 <p className="font-black text-xs text-slate-800">{evt.title}</p>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{evt.type}</p>
                             </div>
                         </div>
                         <button className="w-full mt-3 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black hover:bg-slate-900 hover:text-white transition-all uppercase">التفاصيل</button>
                     </div>
                 ))}
                 {selectedDayEvents.length === 0 && (
                     <div className="py-20 text-center opacity-30">
                         <p className="font-black text-sm uppercase">لا توجد أحداث لهذا اليوم</p>
                         <button className="mt-4 px-6 py-2 bg-gray-100 rounded-full text-[10px] font-bold hover:bg-gray-200">إضافة تذكير +</button>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default CalendarHub;
