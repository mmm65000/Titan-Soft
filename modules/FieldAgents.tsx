
import React from 'react';
import { useApp } from '../AppContext';

const FieldAgents: React.FC = () => {
  const { fieldAgents, lang } = useApp();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {lang === 'ar' ? 'إدارة المناديب والتوصيل' : 'Field Force Management'}
          </h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">
            Real-time tracking, collections, and delivery ops
          </p>
        </div>
        <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
           Assign New Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Agents', value: fieldAgents.filter(a => a.status !== 'offline').length.toString(), icon: '🛵', color: 'blue' },
          { label: 'Daily Deliveries', value: '48', icon: '📦', color: 'indigo' },
          { label: 'Field Collection', value: `$${fieldAgents.reduce((a,b) => a+b.currentVault, 0).toLocaleString()}`, icon: '💰', color: 'emerald' },
          { label: 'Avg Time', value: '24m', icon: '⏱️', color: 'purple' }
        ].map(stat => (
          <div key={stat.label} className="glass p-8 rounded-[40px] shadow-xl border border-white/40 flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-slate-50 shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40">
           <h3 className="text-xl font-black mb-10 flex items-center gap-4">
              <div className="w-3 h-8 bg-indigo-600 rounded-full"></div>
              {lang === 'ar' ? 'قائمة المناديب المتصلين' : 'Active Field Agents'}
           </h3>
           <div className="space-y-6">
              {fieldAgents.map(agent => (
                 <div key={agent.id} className="p-8 bg-white/60 rounded-[2.5rem] border border-white flex justify-between items-center hover:bg-white transition-all shadow-sm group">
                    <div className="flex items-center gap-6">
                       <div className="relative">
                          <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center text-2xl shadow-inner font-black">
                             {agent.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                            agent.status === 'online' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}></div>
                       </div>
                       <div>
                          <p className="text-lg font-black text-slate-800">{agent.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                             {agent.phone} • {agent.deliveriesCompleted} Deliveries Today
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">In-Hand Cash</p>
                       <p className="text-2xl font-black text-indigo-600">${agent.currentVault}</p>
                       <button className="text-[9px] font-black text-blue-600 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-all">Settle Account →</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white h-fit relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-xl font-black mb-8 relative z-10">Real-time Map Log</h3>
              <div className="space-y-6 relative z-10">
                 {[
                   { time: '10:42 AM', event: 'Ali Hassan arrived at Zone B', status: 'success' },
                   { time: '10:30 AM', event: 'Samer Omar started Delivery #882', status: 'info' },
                   { time: '10:15 AM', event: 'New Collection: $45 by Ali', status: 'success' },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 group-hover:scale-150 transition-all"></div>
                      <div>
                         <p className="text-[10px] font-black opacity-40">{log.time}</p>
                         <p className="text-xs font-bold leading-relaxed">{log.event}</p>
                      </div>
                   </div>
                 ))}
                 <button className="w-full py-4 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">View Full Movement Map</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAgents;
