
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Quote, Sale } from '../types';

const Invoicing: React.FC = () => {
  const { quotes, sales, convertQuoteToSale, lang, t } = useApp();
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('invoices');

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Financial Records</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">E-Invoices, Quotes, and Estimates Hub</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
          >
            {t('invoices')}
          </button>
          <button 
            onClick={() => setActiveTab('quotes')} 
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'quotes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
          >
            Estimates (Quotes)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Receivables</p>
            <h3 className="text-4xl font-black text-slate-800">$124,500</h3>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Converted Quotes</p>
            <h3 className="text-4xl font-black text-slate-800">84%</h3>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Pending Estimates</p>
            <h3 className="text-4xl font-black">12</h3>
         </div>
      </div>

      <div className="glass rounded-[50px] overflow-hidden shadow-2xl border-white/60 bg-white/40 min-h-[500px]">
        <table className="w-full text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <th className="px-8 py-7">ID / Date</th>
              <th className="px-8 py-7 text-right">Client Entity</th>
              <th className="px-8 py-7 text-center">SKU Count</th>
              <th className="px-8 py-7 text-center">Total Value</th>
              <th className="px-8 py-7 text-center">Status</th>
              <th className="px-8 py-7 text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTab === 'invoices' ? sales.map(s => (
              <tr key={s.id} className="hover:bg-white transition-all group">
                <td className="px-8 py-6">
                  <span className="font-black text-xs text-slate-800 block">INV-{s.id.slice(-6)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(s.date).toLocaleDateString()}</span>
                </td>
                <td className="px-8 py-6">
                   <p className="text-xs font-black text-slate-800">{s.customerId ? `Account #${s.customerId.slice(-4)}` : 'One-time Client'}</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{s.items.length} Products</span>
                </td>
                <td className="px-8 py-6 text-center font-black text-slate-800">${s.total.toLocaleString()}</td>
                <td className="px-8 py-6 text-center">
                   <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[9px] font-black uppercase border border-emerald-100 shadow-sm">Audit Clear</span>
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="px-6 py-2 glass-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                      Print File
                   </button>
                </td>
              </tr>
            )) : quotes.map(q => (
              <tr key={q.id} className="hover:bg-white transition-all group">
                <td className="px-8 py-6">
                  <span className="font-black text-xs text-slate-800 block">{q.id}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(q.date).toLocaleDateString()}</span>
                </td>
                <td className="px-8 py-6">
                   <p className="text-xs font-black text-slate-800">{q.customerName}</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase">{q.items.length} SKUs</span>
                </td>
                <td className="px-8 py-6 text-center font-black text-slate-800">${q.total.toLocaleString()}</td>
                <td className="px-8 py-6 text-center">
                   <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border shadow-sm ${q.status === 'converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {q.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                   {q.status === 'pending' && (
                     <button 
                      onClick={() => convertQuoteToSale(q.id)}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                     >
                        Commit to Sale
                     </button>
                   )}
                </td>
              </tr>
            ))}
            {(activeTab === 'invoices' ? sales : quotes).length === 0 && (
               <tr>
                  <td colSpan={6} className="py-32 text-center opacity-30 font-black uppercase text-sm italic tracking-[0.2em]">No financial artifacts found in current context.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoicing;
