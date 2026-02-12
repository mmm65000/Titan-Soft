
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Contract } from '../AppContext';

const Contracts: React.FC = () => {
  const { contracts, lang, addContract, updateContract, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newC, setNewC] = useState({ serviceName: '', customerName: '', value: '', cycle: 'monthly' });

  const handleAdd = () => {
    if(!newC.serviceName || !newC.value) return;
    const c: Contract = {
        id: `CNT-${Date.now()}`,
        serviceName: newC.serviceName,
        customerName: newC.customerName || 'General Client',
        value: parseFloat(newC.value),
        paymentCycle: newC.cycle as any,
        status: 'active',
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    };
    addContract(c);
    setShowModal(false);
    setNewC({ serviceName: '', customerName: '', value: '', cycle: 'monthly' });
  };

  const renewContract = (id: string) => {
      const c = contracts.find(x => x.id === id);
      if(c && confirm('تجديد العقد لمدة سنة إضافية؟')) {
          const newEndDate = new Date(new Date(c.endDate).setFullYear(new Date(c.endDate).getFullYear() + 1)).toISOString().split('T')[0];
          updateContract(id, { endDate: newEndDate, status: 'active' });
          addLog(`Contract renewed: ${c.serviceName}`, 'success', 'Projects');
          alert('تم تجديد العقد بنجاح');
      }
  };

  const terminateContract = (id: string) => {
      if(confirm('هل أنت متأكد من إنهاء العقد؟')) {
          updateContract(id, { status: 'terminated' });
          addLog(`Contract terminated: ${id}`, 'warning', 'Projects');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة العقود والاشتراكات</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">الأعمال الدورية، الصيانة، والخدمات السحابية</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-700 transition-all"
        >
          تحرير عقد جديد +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {contracts.map(contract => (
           <div key={contract.id} className="glass p-12 rounded-[60px] shadow-2xl border border-white relative overflow-hidden group hover:bg-white transition-all">
              <div className={`absolute top-0 right-0 w-2 h-full ${contract.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
              
              <div className="flex justify-between items-start mb-8">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${contract.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {contract.status}
                 </span>
                 <p className="text-[10px] font-black text-gray-400">ID: {contract.id}</p>
              </div>

              <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{contract.serviceName}</h4>
              <p className="text-blue-600 font-bold text-sm mb-10">{contract.customerName}</p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                 <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">القيمة الإجمالية</p>
                    <p className="text-xl font-black text-slate-800">${contract.value.toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">دورة الدفع</p>
                    <p className="text-xl font-black text-slate-800 capitalize">{contract.paymentCycle === 'yearly' ? 'سنوي' : 'شهري'}</p>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[35px] border border-slate-100 flex justify-between items-center mb-10">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">تاريخ الانتهاء</p>
                    <p className="text-sm font-black text-slate-700">{contract.endDate}</p>
                 </div>
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🗓️</div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => renewContract(contract.id)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">تجديد العقد</button>
                 <button onClick={() => terminateContract(contract.id)} className="px-6 py-4 glass border border-gray-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">🗑️</button>
              </div>
           </div>
         ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">عقد خدمة جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم الخدمة / المشروع</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newC.serviceName} onChange={e=>setNewC({...newC, serviceName: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">العميل المستفيد</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newC.customerName} onChange={e=>setNewC({...newC, customerName: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">القيمة ($)</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newC.value} onChange={e=>setNewC({...newC, value: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الدورة</label>
                        <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewC({...newC, cycle: e.target.value})}>
                            <option value="monthly">شهري</option>
                            <option value="yearly">سنوي</option>
                        </select>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ العقد</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
