
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { WholesaleOrder } from '../types';

const WholesaleHub: React.FC = () => {
  const { wholesaleOrders, approveWholesale, lang, addWholesaleOrder, customers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ client: '', total: '', terms: 'Net 30' });

  const handleAdd = () => {
    if(!newOrder.client || !newOrder.total) return;
    const o: WholesaleOrder = {
        id: `WS-${Date.now()}`,
        customerName: newOrder.client,
        total: parseFloat(newOrder.total),
        creditTerm: newOrder.terms,
        status: 'pending_approval',
        requestedAt: new Date().toISOString()
    };
    addWholesaleOrder(o);
    setShowModal(false);
    setNewOrder({ client: '', total: '', terms: 'Net 30' });
  };

  const handleApprove = (id: string) => {
      approveWholesale(id);
      alert('تم اعتماد الطلب وإنشاء فاتورة مبيعات (آجلة) بنجاح ✅');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز مبيعات الجملة والتعاقدات</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Large Scale Orders, Credit Approvals & B2B Partnerships</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-600 transition-all"
        >
          إنشاء طلب توريد ضخم
          <span>📦</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">طلبات بانتظار الموافقة</p>
            <h3 className="text-5xl font-black text-slate-800">{wholesaleOrders.filter(o=>o.status==='pending_approval').length}</h3>
            <span className="text-[9px] font-bold text-emerald-600 uppercase">Needs Admin Signature</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">إجمالي حجم التعاقدات (Q1)</p>
            <h3 className="text-5xl font-black text-slate-800">$142K</h3>
            <span className="text-[9px] font-bold text-blue-600 uppercase">Growth +24% YoY</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">مخاطر الائتمان العالية</p>
            <h3 className="text-5xl font-black">2</h3>
            <span className="text-[9px] font-bold text-orange-400 animate-pulse">Accounts Over Limit</span>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100">
         <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
            <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
            إدارة طلبات كبار العملاء (B2B)
         </h3>
         <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
            <table className="w-full text-right text-xs">
               <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-7">كود الطلب</th>
                     <th className="px-10 py-7">العميل المستفيد</th>
                     <th className="px-10 py-7">القيمة الإجمالية</th>
                     <th className="px-10 py-7">شروط الائتمان</th>
                     <th className="px-10 py-7 text-center">الحالة</th>
                     <th className="px-10 py-7 text-center">الإجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {wholesaleOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white transition-all group">
                       <td className="px-10 py-6 text-blue-600 font-black">#{order.id}</td>
                       <td className="px-10 py-6">
                          <p className="text-sm">{order.customerName}</p>
                          <p className="text-[9px] text-gray-400 uppercase">Requested: {new Date(order.requestedAt).toLocaleDateString()}</p>
                       </td>
                       <td className="px-10 py-6 text-lg font-black text-slate-800">${order.total.toLocaleString()}</td>
                       <td className="px-10 py-6"><span className="px-3 py-1 bg-slate-100 rounded-lg">{order.creditTerm}</span></td>
                       <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                             order.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                             {order.status.replace('_', ' ')}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-center">
                          {order.status === 'pending_approval' ? (
                             <div className="flex gap-2 justify-center">
                                <button onClick={() => handleApprove(order.id)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600">اعتماد</button>
                                <button className="px-6 py-2 glass border border-gray-100 rounded-xl text-[9px] font-black uppercase text-red-500">رفض</button>
                             </div>
                          ) : (
                             <button className="text-blue-500 hover:underline text-[9px] font-black uppercase">عرض التفاصيل ←</button>
                          )}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">طلب جملة جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">العميل (الشركة)</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewOrder({...newOrder, client: e.target.value})}>
                       <option value="">اختر العميل...</option>
                       {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">إجمالي قيمة الصفقة ($)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newOrder.total} onChange={e=>setNewOrder({...newOrder, total: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">شروط الدفع (Credit Terms)</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewOrder({...newOrder, terms: e.target.value})}>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                        <option value="Net 90">Net 90 Days</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إرسال للاعتماد</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WholesaleHub;
