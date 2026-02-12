
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Voucher } from '../types';

const Vouchers: React.FC = () => {
  const { lang, customers, suppliers, addVoucher, vouchers } = useApp();
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'receipt', // 'receipt' or 'payment'
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    method: 'cash'
  });

  const handleSave = () => {
    if(!formData.accountId || !formData.amount) return;
    const accountName = customers.find(c=>c.id===formData.accountId)?.name || suppliers.find(s=>s.id===formData.accountId)?.name || 'Unknown';
    
    const v: Voucher = {
        id: `VCH-${Date.now()}`,
        type: formData.type as any,
        accountId: formData.accountId,
        accountName: accountName,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.notes,
        paymentMethod: formData.method as any
    };
    addVoucher(v);
    alert("تم حفظ السند بنجاح وتأثيره على الحساب المالي");
    setFormData({ accountId: '', type: 'receipt', amount: '', date: new Date().toISOString().split('T')[0], notes: '', method: 'cash' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-center mb-6">
        <h2 className="text-3xl font-black text-blue-600 border-b-2 border-blue-600 pb-2 px-8 uppercase tracking-tighter">سندات القبض والصرف الرسمية</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white p-14 rounded-[50px] shadow-2xl border border-gray-100" dir="rtl">
            <div className="space-y-8">
                <div className="grid grid-cols-12 gap-8 items-center">
                <label className="col-span-3 text-xs font-black text-gray-500 uppercase tracking-widest">الحساب المستفيد / المورد *</label>
                <div className="col-span-9 relative">
                    <select 
                        className="w-full border border-gray-200 p-4 rounded-2xl font-bold outline-none focus:ring-4 ring-blue-500/5 appearance-none"
                        value={formData.accountId}
                        onChange={e => setFormData({...formData, accountId: e.target.value})}
                    >
                        <option value="">اختر الحساب...</option>
                        <optgroup label="العملاء">
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </optgroup>
                        <optgroup label="الموردين">
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                    </select>
                    <div className="absolute left-4 top-5 text-gray-400 pointer-events-none">▼</div>
                </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center">
                <label className="col-span-3 text-xs font-black text-gray-500 uppercase tracking-widest">نوع المعاملة</label>
                <div className="col-span-9 flex gap-4">
                    <button onClick={() => setFormData({...formData, type: 'receipt'})} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.type === 'receipt' ? 'bg-emerald-500 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}>سند قبض (توريد)</button>
                    <button onClick={() => setFormData({...formData, type: 'payment'})} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.type === 'payment' ? 'bg-rose-500 text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}>سند صرف (دفع)</button>
                </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-center border-t border-gray-50 pt-8">
                <label className="col-span-3 text-xs font-black text-gray-500">المبلغ المالي</label>
                <div className="col-span-9 space-y-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <input type="number" value={formData.amount} onChange={e=>setFormData({...formData, amount: e.target.value})} className="flex-1 bg-transparent font-black text-2xl outline-none text-center" placeholder="0.00" />
                        <span className="text-gray-300 font-bold">ريال</span>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-start">
                <label className="col-span-3 text-xs font-black text-gray-500 mt-4">البيان / ملاحظات التدقيق *</label>
                <textarea 
                    className="col-span-9 border border-gray-200 p-6 rounded-[2.5rem] outline-none font-medium h-40 focus:ring-4 ring-blue-500/5 shadow-inner" 
                    placeholder="اكتب تفاصيل المعاملة المالية هنا..."
                    value={formData.notes}
                    onChange={e=>setFormData({...formData, notes: e.target.value})}
                ></textarea>
                </div>

                <div className="flex gap-6 pt-10 justify-center">
                <button onClick={handleSave} className="px-20 py-5 bg-[#f37021] text-white rounded-3xl font-black text-sm shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all uppercase tracking-widest">اعتماد وحفظ السند</button>
                </div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 px-4">آخر السندات المحررة</h3>
            {vouchers.map(v => (
                <div key={v.id} className="glass p-6 rounded-[30px] border border-white flex justify-between items-center shadow-sm hover:bg-white transition-all">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${v.type === 'receipt' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{v.type === 'receipt' ? 'قبض' : 'صرف'}</span>
                            <span className="text-sm font-black text-slate-800">{v.accountName}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[200px]">{v.description}</p>
                    </div>
                    <span className="text-xl font-black text-slate-800">${v.amount.toLocaleString()}</span>
                </div>
            ))}
            {vouchers.length === 0 && <p className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">لا توجد سندات مسجلة</p>}
         </div>
      </div>
    </div>
  );
};

export default Vouchers;
