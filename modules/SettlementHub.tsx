
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const SettlementHub: React.FC = () => {
  const { lang, fieldAgents, suppliers, addLog, bankAccounts, addVoucher, t } = useApp();
  const [activeTab, setActiveTab] = useState<'agents' | 'suppliers' | 'banks'>('agents');

  const handleSettleAgent = (agentId: string) => {
    const agent = fieldAgents.find(a => a.id === agentId);
    if (!agent) return;
    if (confirm(`هل تريد استلام عهدة نقدية بقيمة $${agent.currentVault} من ${agent.name}؟`)) {
      addVoucher({
          id: `VCH-IN-${Date.now()}`,
          type: 'receipt',
          accountId: agentId,
          accountName: agent.name,
          amount: agent.currentVault,
          date: new Date().toISOString(),
          description: `تسوية عهدة مندوب - ${agent.name}`,
          paymentMethod: 'cash'
      });
      alert('تم إيداع المبلغ في الخزينة المركزية وتصفير عهدة المندوب بنجاح ✅');
    }
  };

  const handleSettleSupplier = (supId: string, balance: number, name: string) => {
      const amount = Math.abs(balance);
      if (amount === 0) return alert('الرصيد صفري، لا توجد مستحقات.');
      
      if(confirm(`تأكيد إصدار سند صرف للمورد "${name}" بقيمة $${amount.toLocaleString()}؟`)) {
          addVoucher({
              id: `VCH-OUT-${Date.now()}`,
              type: 'payment',
              accountId: supId,
              accountName: name,
              amount: amount,
              date: new Date().toISOString(),
              description: `سداد مستحقات مورد - ${name}`,
              paymentMethod: 'transfer'
          });
          alert('تم إصدار سند الصرف وإرسال إشعار التحويل للمورد 💸');
      }
  };

  const handleReconcileBank = (bankName: string) => {
      addLog(`Bank Reconciliation started for ${bankName}`, 'info', 'Finance');
      alert('جاري سحب كشف الحساب ومطابقة العمليات آلياً... سيتم إشعارك عند الانتهاء.');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز التسويات المالية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Settlement & Reconciliation Floor</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
          {['agents', 'suppliers', 'banks'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>
              {t === 'agents' ? 'المناديب' : t === 'suppliers' ? 'الموردين' : 'البنوك'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
           {fieldAgents.map(agent => (
              <div key={agent.id} className="glass p-10 rounded-[50px] border border-white shadow-xl hover:bg-white transition-all group">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black shadow-inner">
                       {agent.name.charAt(0)}
                    </div>
                    <div>
                       <h4 className="font-black text-xl text-slate-800">{agent.name}</h4>
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase mt-1 inline-block">نشط الآن</span>
                    </div>
                 </div>
                 <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400 font-bold">العهدة الحالية</span>
                       <span className="text-blue-600 font-black text-xl">${agent.currentVault.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400 font-bold">طلبيات مكتملة</span>
                       <span className="text-slate-800 font-black">{agent.deliveriesCompleted} طلب</span>
                    </div>
                 </div>
                 <button onClick={() => handleSettleAgent(agent.id)} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">تحصيل العهدة النقدية</button>
              </div>
           ))}
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100" dir="rtl">
           <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                 <tr>
                    <th className="px-10 py-7">المورد</th>
                    <th className="px-10 py-7">الرصيد المستحق (دائن)</th>
                    <th className="px-10 py-7 text-center">التقييم</th>
                    <th className="px-10 py-7 text-center">الإجراء</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                 {suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-blue-50/10 transition-all">
                       <td className="px-10 py-6">{sup.name_ar || sup.name}</td>
                       <td className="px-10 py-6 text-red-600 font-black">${Math.abs(sup.balance).toLocaleString()}</td>
                       <td className="px-10 py-6 text-center">⭐ {sup.rating}</td>
                       <td className="px-10 py-6 text-center">
                          <button 
                            onClick={() => handleSettleSupplier(sup.id, sup.balance, sup.name_ar || sup.name)}
                            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 transition-all shadow-md"
                          >
                             تسوية وسداد
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" dir="rtl">
           {bankAccounts.map(acc => (
              <div key={acc.id} className="glass p-12 rounded-[50px] border border-white shadow-2xl relative overflow-hidden group hover:bg-white transition-all">
                 <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h3 className="text-2xl font-black text-slate-800">{acc.bankName}</h3>
                       <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">{acc.accountNumber}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">🏦</div>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100 mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">الرصيد الجاري الموثق</p>
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{acc.balance.toLocaleString()} <span className="text-sm font-bold text-slate-400">{acc.currency}</span></h4>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => handleReconcileBank(acc.bankName)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">مطابقة العمليات</button>
                    <button className="flex-1 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all">تحميل الكشف</button>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SettlementHub;
