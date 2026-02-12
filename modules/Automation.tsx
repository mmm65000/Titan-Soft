
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { AutomationRule } from '../types';

const Automation: React.FC = () => {
  const { automationRules, setAutomationRules, lang, automationLogs } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewLogs, setViewLogs] = useState(false);

  const toggleRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter">أتمتة Titan Flow ⚡</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[11px]">
            Neural Event Handlers for Supply Chain & CRM Logistics
          </p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setViewLogs(!viewLogs)}
                className={`px-10 py-5 glass rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${viewLogs ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-800 hover:bg-white/80'}`}
            >
                {viewLogs ? 'مدير القواعد' : 'سجل العمليات'}
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-3xl flex items-center gap-4 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
            >
                <span>إنشاء عقدة أتمتة</span>
                <span className="text-xl">+</span>
            </button>
        </div>
      </div>

      {!viewLogs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {automationRules.map(rule => (
            <div key={rule.id} className={`glass p-12 rounded-[70px] border shadow-3xl transition-all relative overflow-hidden group ${rule.isActive ? 'border-indigo-100 bg-white' : 'opacity-40 grayscale'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner ${rule.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {rule.event === 'low_stock' ? '📉' : '🎯'}
                    </div>
                    <div 
                        onClick={() => toggleRule(rule.id)}
                        className={`w-16 h-8 rounded-full relative cursor-pointer p-1.5 transition-all ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-2xl transition-all ${rule.isActive ? (lang === 'ar' ? 'mr-0' : 'ml-8') : (lang === 'ar' ? 'mr-8' : 'ml-0')}`}></div>
                    </div>
                </div>

                <h4 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">{rule.name}</h4>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-10">Event Trigger: {rule.event.replace('_', ' ')}</p>
                
                <div className="space-y-4 mb-12">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Active Pipeline Actions</p>
                    {rule.actions.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-gray-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg">#{idx+1}</div>
                            <div>
                               <p className="text-[10px] font-black text-slate-800 uppercase">{act.type.replace('_', ' ')}</p>
                               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Target: {act.target}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-slate-50">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Total Executions</p>
                        <span className="text-2xl font-black text-slate-900">{rule.executionCount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                           Pulse Active
                        </span>
                    </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="glass p-16 rounded-[70px] shadow-3xl border-white bg-white/40">
            <h3 className="text-3xl font-black mb-14 tracking-tighter flex items-center gap-5"><div className="w-3 h-10 bg-indigo-600 rounded-full"></div> سجل تنفيذ التدفقات (Flow Intelligence)</h3>
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar">
                {automationLogs.map(log => (
                    <div key={log.id} className="p-10 bg-white rounded-[3.5rem] border border-slate-100 flex justify-between items-center hover:shadow-2xl transition-all group">
                        <div className="flex items-center gap-10">
                            <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center font-black text-2xl shadow-xl ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {log.status === 'success' ? '⚡' : '⚠'}
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800">{log.ruleName}</p>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">{new Date(log.timestamp).toLocaleString()} • Operational Status: {log.status}</p>
                            </div>
                        </div>
                        <div className="max-w-md text-left">
                           <p className="text-sm font-bold text-slate-500 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 italic shadow-inner">
                             "{log.details}"
                           </p>
                        </div>
                    </div>
                ))}
                {automationLogs.length === 0 && (
                   <div className="py-40 text-center opacity-10 font-black italic uppercase tracking-[0.5em] text-2xl">No Flow Artifacts Recorded</div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Automation;
