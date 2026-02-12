
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { InstallmentPlan } from '../types';

const Installments: React.FC = () => {
  const { installmentPlans, payInstallment, lang } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null);

  const totalDebt = installmentPlans.reduce((a, b) => a + b.remainingAmount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-dark p-10 rounded-[50px] relative overflow-hidden group">
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Receivables</p>
           <h3 className="text-4xl font-black text-slate-800">${totalDebt.toLocaleString()}</h3>
           <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase">{installmentPlans.length} ACTIVE PLANS</p>
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <div>
           <h3 className="text-2xl font-black text-slate-800 tracking-tight">Debt Scheduling</h3>
           <p className="text-sm font-medium text-gray-400">Managing consumer credit and payment cycles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
           {installmentPlans.map(plan => (
             <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="glass p-10 rounded-[50px] border border-white/60 hover:bg-white transition-all cursor-pointer shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600"></div>
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h4 className="font-black text-xl text-slate-800">Plan #{plan.id.slice(-6)}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Client: {plan.customerId}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Remaining</p>
                      <h4 className="text-2xl font-black text-slate-800">${plan.remainingAmount.toLocaleString()}</h4>
                   </div>
                </div>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner border border-white">
                   <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${((plan.totalAmount - plan.remainingAmount) / plan.totalAmount) * 100}%` }}
                   ></div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                      <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase">Next: 15 Oct</span>
                      <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">{plan.frequency} cycle</span>
                   </div>
                   <button className="text-[9px] font-black text-blue-600 uppercase group-hover:underline">View Schedule →</button>
                </div>
             </div>
           ))}
        </div>

        <div className="glass p-10 rounded-[50px] shadow-2xl border-white h-fit">
           <h3 className="text-xl font-black mb-8">Installment Detail</h3>
           {selectedPlan ? (
             <div className="space-y-6">
                <div className="space-y-4">
                   {selectedPlan.installments.map(inst => (
                     <div key={inst.id} className="flex items-center justify-between p-4 bg-white/60 rounded-3xl border border-white">
                        <div>
                           <p className="text-xs font-black text-slate-800">${inst.amount}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(inst.dueDate).toLocaleDateString()}</p>
                        </div>
                        {inst.status === 'paid' ? (
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase">Paid</span>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); payInstallment(selectedPlan.id, inst.id); }}
                            className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                          >
                             Pay
                          </button>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="py-20 text-center grayscale opacity-20">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-xs font-black uppercase tracking-widest">Select a plan</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Installments;
