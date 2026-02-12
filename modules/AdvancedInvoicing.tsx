
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { AdvancedInvoice } from '../types';

const AdvancedInvoicing: React.FC = () => {
  const { advancedInvoices, creditNotes, issueCreditNote, lang, addAdvancedInvoice, customers } = useApp();
  const [activeTab, setActiveTab] = useState<'invoices' | 'credit-notes'>('invoices');
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ total: '', tax: '', source: 'Service' });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'overdue': return 'bg-red-50 text-red-600 border-red-100 animate-pulse';
      case 'partial': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'void': return 'bg-slate-100 text-slate-400 border-slate-200';
      case 'returned': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const handleReturn = (id: string) => {
    const amount = prompt("أدخل مبلغ المرتجع المعتمد:");
    if (amount) {
      issueCreditNote(id, parseFloat(amount), "Customer return after inspection");
      alert("تم إصدار إشعار دائن (Credit Note) بنجاح");
    }
  };

  const handleCreate = () => {
      if(!newInvoice.total) return;
      const amount = parseFloat(newInvoice.total);
      const tax = newInvoice.tax ? parseFloat(newInvoice.tax) : amount * 0.15;
      
      const inv: AdvancedInvoice = {
          id: `INV-SVC-${Date.now()}`,
          source: newInvoice.source,
          date: new Date().toISOString(),
          total: amount + tax,
          tax: tax,
          paidAmount: 0,
          status: 'partial'
      };
      addAdvancedInvoice(inv);
      setShowModal(false);
      setNewInvoice({ total: '', tax: '', source: 'Service' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الفواتير والتحصيل</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Omni-Channel Invoicing & Revenue Reconciliation</p>
        </div>
        <div className="flex gap-4">
            <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
            <button 
                onClick={() => setActiveTab('invoices')}
                className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
                الفواتير 📄
            </button>
            <button 
                onClick={() => setActiveTab('credit-notes')}
                className={`px-8 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'credit-notes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
                الإشعارات الدائنة 📉
            </button>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-700 transition-all"
            >
                إصدار فاتورة جديدة +
            </button>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100 overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <div className="flex gap-4 overflow-x-auto pb-2 max-w-2xl">
                 {['الكل', 'مدفوعة', 'مدفوعة جزئياً', 'متأخرة', 'مسودات'].map(f => (
                    <button key={f} className="px-8 py-3 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all whitespace-nowrap">{f}</button>
                 ))}
              </div>
           </div>

           <div className="rounded-[40px] border border-gray-50 overflow-hidden">
              <table className="w-full text-right text-xs">
                 <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-6">رقم الفاتورة / المصدر</th>
                       <th className="px-8 py-6">العميل / التاريخ</th>
                       <th className="px-8 py-6 text-center">الإجمالي الضريبي</th>
                       <th className="px-8 py-6 text-center">المحصل / المتبقي</th>
                       <th className="px-8 py-6 text-center">الحالة</th>
                       <th className="px-8 py-6 text-center">الإجراء</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                    {advancedInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-blue-50/10 transition-all group">
                         <td className="px-8 py-6">
                            <p className="font-black text-blue-600">#{inv.id}</p>
                            <span className="text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{inv.source}</span>
                         </td>
                         <td className="px-8 py-6">
                            <p>عميل نقدي</p>
                            <p className="text-[9px] text-gray-400 uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <p className="text-lg font-black text-slate-900">${inv.total.toLocaleString()}</p>
                            <p className="text-[9px] text-orange-500 uppercase tracking-tighter">Tax: ${inv.tax}</p>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <p className="text-emerald-600">${inv.paidAmount.toLocaleString()}</p>
                            <p className="text-red-400 text-[10px]">${(inv.total - inv.paidAmount).toLocaleString()}</p>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(inv.status)}`}>
                               {inv.status}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="flex gap-2 justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                               <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white">📄</button>
                               <button onClick={() => handleReturn(inv.id)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white">↺</button>
                               <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">💰</button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creditNotes.map(note => (
                 <div key={note.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-orange-50/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-orange-400"></div>
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-xl font-black text-slate-800">إشعار دائن #{note.id.slice(-4)}</h4>
                       <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg uppercase">{note.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Ref Invoice: {note.originalInvoiceId}</p>
                    <div className="bg-white p-6 rounded-3xl border border-orange-100 mb-6">
                       <p className="text-[9px] font-black text-gray-400 uppercase mb-1">المبلغ المخصوم</p>
                       <h4 className="text-3xl font-black text-red-500">-${note.amount.toLocaleString()}</h4>
                    </div>
                    <p className="text-xs font-bold text-slate-600 mb-8 italic">"{note.reason}"</p>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-lg">اعتماد المرتجع النهائي</button>
                 </div>
              ))}
              {creditNotes.length === 0 && (
                <div className="col-span-3 py-32 text-center opacity-20">
                   <p className="text-2xl font-black uppercase tracking-widest italic">لا توجد إشعارات دائنة مسجلة</p>
                </div>
              )}
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">فاتورة خدمات جديدة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نوع الخدمة / المصدر</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewInvoice({...newInvoice, source: e.target.value})}>
                       <option value="Service">خدمة عامة</option>
                       <option value="Maintenance">صيانة</option>
                       <option value="Consulting">استشارات</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">القيمة (بدون ضريبة)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newInvoice.total} onChange={e=>setNewInvoice({...newInvoice, total: e.target.value})} placeholder="0.00" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الضريبة المخصصة (اختياري)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold text-orange-500" value={newInvoice.tax} onChange={e=>setNewInvoice({...newInvoice, tax: e.target.value})} placeholder="Auto-calculated 15%" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleCreate} className="flex-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إصدار الفاتورة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedInvoicing;
