
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Branch } from '../types';

const Branches: React.FC = () => {
  const { branches, setActiveBranchId, activeBranchId, addBranch, lang } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newB, setNewB] = useState({ name: '', name_ar: '', location: '', phone: '' });

  const handleAdd = () => {
    if (!newB.name || !newB.location) return;
    addBranch(newB);
    setShowAdd(false);
    setNewB({ name: '', name_ar: '', location: '', phone: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">
            {lang === 'ar' ? 'إدارة الفروع والشبكات' : 'Branch Node Management'}
          </h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Orchestrating geographically distributed ecosystem nodes</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-600 transition-all"
        >
          Initialize New Branch
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map(branch => (
          <div 
            key={branch.id} 
            className={`glass p-10 rounded-[50px] border shadow-xl transition-all relative overflow-hidden group ${activeBranchId === branch.id ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-white'}`}
          >
             {branch.isMain && (
               <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-[30px] text-[8px] font-black uppercase tracking-widest shadow-lg">Main HQ / Central Vault</div>
             )}
             <div className="flex items-center gap-6 mb-8">
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-inner ${activeBranchId === branch.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                   {branch.name.charAt(0)}
                </div>
                <div>
                   <h4 className="text-xl font-black text-slate-800">{lang === 'ar' ? branch.name_ar : branch.name}</h4>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Node ID: {branch.id}</p>
                </div>
             </div>
             <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-slate-500 flex items-center gap-2">📍 {branch.location}</p>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-2">📞 {branch.phone}</p>
             </div>
             <button 
               onClick={() => setActiveBranchId(branch.id)}
               className={`w-full py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest transition-all ${
                 activeBranchId === branch.id ? 'bg-blue-600 text-white shadow-xl' : 'glass hover:bg-slate-900 hover:text-white'
               }`}
             >
                {activeBranchId === branch.id ? 'Currently Active Node' : 'Switch Terminal'}
             </button>
          </div>
        ))}
      </div>
      
      {showAdd && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-xl p-14 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8">Initialize Node</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Branch Name (EN)</label>
                       <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" value={newB.name} onChange={e => setNewB({...newB, name: e.target.value})} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">الاسم (AR)</label>
                       <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-right" dir="rtl" value={newB.name_ar} onChange={e => setNewB({...newB, name_ar: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Geo Location</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" placeholder="E.g. District, City" value={newB.location} onChange={e => setNewB({...newB, location: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">Discard</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">Commission Branch</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
