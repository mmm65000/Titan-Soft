
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { SaleItem, PurchaseInvoice } from '../types';

const Purchases: React.FC = () => {
  const { products, suppliers, lang, addPurchase, user, addLog, purchases } = useApp();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer' | 'credit'>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const [entryForm, setEntryForm] = useState({
    productId: '',
    qty: 1,
    unit: '',
    cost: 0,
    tax: 15,
    discount: 0
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.price * item.quantity * (item.discountPercent / 100)), 0);
  const totalTax = cart.reduce((acc, item) => acc + (((item.price * item.quantity) - (item.price * item.quantity * (item.discountPercent / 100))) * (item.taxPercent / 100)), 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleAddItem = () => {
    const prod = products.find(p => p.id === entryForm.productId);
    if (!prod) return;

    // Use selected unit or default to major unit if exists, else minor
    const unitName = entryForm.unit || prod.majorUnit || prod.minorUnit || 'وحدة';
    // If user didn't enter cost, try to guess cost based on unit.
    // Assuming product.cost is for the BASE unit (minor).
    // If buying major unit, cost = product.cost * unitContent
    let estimatedCost = entryForm.cost;
    if (estimatedCost === 0) {
        if (unitName === prod.majorUnit && prod.unitContent) {
            estimatedCost = prod.cost * prod.unitContent;
        } else {
            estimatedCost = prod.cost;
        }
    }

    const newItem: SaleItem = {
      productId: prod.id,
      name: prod.name_ar,
      unit: unitName,
      quantity: entryForm.qty,
      price: estimatedCost,
      discountPercent: entryForm.discount,
      taxPercent: entryForm.tax,
      total: estimatedCost * entryForm.qty * (1 - entryForm.discount / 100) * (1 + entryForm.tax / 100)
    };

    setCart([newItem, ...cart]);
    setEntryForm({ ...entryForm, productId: '', qty: 1, cost: 0, unit: '' });
  };

  const handleSaveInvoice = () => {
    if (!selectedSupplierId || cart.length === 0) return alert('يرجى اختيار مورد وإضافة أصناف للفاتورة');
    
    const status = paidAmount >= grandTotal ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    const purchase: PurchaseInvoice = {
      id: `PUR-${Date.now()}`,
      supplierId: selectedSupplierId,
      date: new Date().toISOString(),
      items: cart,
      total: grandTotal,
      tax: totalTax,
      discount: totalDiscount,
      paymentMethod: paymentMode,
      paymentStatus: status,
      paidAmount: paidAmount,
      isSuspended: false,
      referenceNumber,
      notes
    };

    addPurchase(purchase);
    setCart([]);
    setSelectedSupplierId('');
    setReferenceNumber('');
    setPaidAmount(0);
    setNotes('');
    addLog(`تم تسجيل فاتورة توريد جديدة بقيمة $${grandTotal.toFixed(2)} من ${suppliers.find(s=>s.id===selectedSupplierId)?.name_ar}`, 'info', 'Purchases');
    alert('تم اعتماد الفاتورة وتحديث الأرصدة المخزنية وتكلفة المنتجات بنجاح');
    setActiveTab('history');
  };

  const getProductOptions = (prodId: string) => {
      const p = products.find(prod => prod.id === prodId);
      if(!p) return [];
      const opts = [];
      if(p.majorUnit) opts.push(p.majorUnit);
      if(p.minorUnit) opts.push(p.minorUnit);
      return opts.length > 0 ? opts : ['وحدة'];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-[1300px] mx-auto" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter">إدارة المشتريات والتوريد</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[11px]">Supplier Invoicing, Tax Reconciliation & Stock Inflow Control</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100">
           <button 
             onClick={() => setActiveTab('new')} 
             className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'new' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800'}`}
           >
             فاتورة جديدة +
           </button>
           <button 
             onClick={() => setActiveTab('history')} 
             className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800'}`}
           >
             سجل الفواتير
           </button>
        </div>
      </div>

      {activeTab === 'new' ? (
      <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
         
         {/* Supplier & Header Info */}
         <div className="grid grid-cols-12 gap-8 mb-12 border-b border-gray-50 pb-12">
            <div className="col-span-12 md:col-span-4 space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">المورد المعتمد *</label>
               <select 
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-bold outline-none focus:bg-white focus:ring-4 ring-blue-500/5 transition-all appearance-none"
                >
                    <option value="">اختر المورد من السجل المركزي...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name_ar || s.name}</option>)}
                </select>
            </div>
            <div className="col-span-12 md:col-span-4 space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">رقم مرجع الفاتورة الخارجية</label>
               <input 
                 type="text" 
                 value={referenceNumber}
                 onChange={e=>setReferenceNumber(e.target.value)}
                 placeholder="مثال: INV-SUP-2025-01" 
                 className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-black outline-none focus:bg-white focus:ring-4 ring-blue-500/5 transition-all" 
               />
            </div>
            <div className="col-span-12 md:col-span-4 space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">طريقة السداد</label>
               <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  {['cash', 'bank_transfer', 'credit'].map(m => (
                    <button key={m} onClick={()=>setPaymentMode(m as any)} className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase transition-all ${paymentMode === m ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-gray-100'}`}>
                      {m === 'cash' ? 'نقدي' : m === 'bank_transfer' ? 'تحويل' : 'أجل'}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Items Entry Bar */}
         <div className="grid grid-cols-12 gap-4 items-end mb-10 bg-indigo-50/20 p-8 rounded-[40px] border border-indigo-50 relative group">
            <div className="col-span-12 lg:col-span-3 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1">اختيار الصنف</label>
               <select 
                 value={entryForm.productId}
                 onChange={e => {
                    const p = products.find(pr => pr.id === e.target.value);
                    // Default to major unit cost if available
                    const defCost = (p?.majorUnit && p.unitContent) ? (p.cost * p.unitContent) : (p?.cost || 0);
                    setEntryForm({...entryForm, productId: e.target.value, cost: defCost, unit: p?.majorUnit || p?.minorUnit || ''});
                 }}
                 className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-bold outline-none shadow-sm"
               >
                  <option value="">بحث عن صنف مخزني...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name_ar} | {p.sku}</option>)}
               </select>
            </div>
            <div className="col-span-6 lg:col-span-2 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase text-center block">الوحدة</label>
               <select 
                 value={entryForm.unit}
                 onChange={e => setEntryForm({...entryForm, unit: e.target.value})}
                 className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-bold outline-none shadow-sm text-xs"
                 disabled={!entryForm.productId}
               >
                  {getProductOptions(entryForm.productId).map(u => <option key={u} value={u}>{u}</option>)}
               </select>
            </div>
            <div className="col-span-6 lg:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase text-center block">الكمية</label>
               <input type="number" value={entryForm.qty} onChange={e => setEntryForm({...entryForm, qty: parseInt(e.target.value)||1})} className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-black text-center outline-none shadow-sm" />
            </div>
            <div className="col-span-6 lg:col-span-2 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase text-center block">التكلفة (شراء)</label>
               <input type="number" value={entryForm.cost} onChange={e => setEntryForm({...entryForm, cost: parseFloat(e.target.value)||0})} className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-black text-center outline-none shadow-sm text-emerald-600" />
            </div>
            <div className="col-span-3 lg:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase text-center block">خصم %</label>
               <input type="number" value={entryForm.discount} onChange={e => setEntryForm({...entryForm, discount: parseFloat(e.target.value)||0})} className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-black text-center outline-none shadow-sm text-red-500" />
            </div>
            <div className="col-span-3 lg:col-span-1 space-y-2">
               <label className="text-[10px] font-black text-indigo-600 uppercase text-center block">ضريبة%</label>
               <input type="number" value={entryForm.tax} onChange={e => setEntryForm({...entryForm, tax: parseFloat(e.target.value)||0})} className="w-full bg-white border border-indigo-100 p-4 rounded-2xl font-black text-center outline-none shadow-sm text-blue-500" />
            </div>
            <div className="col-span-12 lg:col-span-2">
               <button onClick={handleAddItem} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-indigo-100">إضافة</button>
            </div>
         </div>

         {/* Cart Table */}
         <div className="rounded-[40px] border border-gray-100 overflow-hidden mb-12 bg-white/50">
            <table className="w-full text-right text-xs">
               <thead className="bg-slate-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-7">الصنف المورد</th>
                     <th className="px-8 py-7 text-center">الوحدة</th>
                     <th className="px-8 py-7 text-center">الكمية</th>
                     <th className="px-8 py-7 text-center">تكلفة الشراء</th>
                     <th className="px-8 py-7 text-center text-red-400">الخصم</th>
                     <th className="px-8 py-7 text-center text-blue-500">الضريبة</th>
                     <th className="px-8 py-7 text-center">الإجمالي</th>
                     <th className="px-8 py-7 text-center">إجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                  {cart.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/10 transition-all">
                       <td className="px-8 py-6 font-black">{item.name}</td>
                       <td className="px-8 py-6 text-center text-gray-500">{item.unit}</td>
                       <td className="px-8 py-6 text-center text-lg">{item.quantity}</td>
                       <td className="px-8 py-6 text-center font-black">${item.price.toFixed(2)}</td>
                       <td className="px-8 py-6 text-center text-red-500">{item.discountPercent}%</td>
                       <td className="px-8 py-6 text-center text-blue-400">${(((item.price * item.quantity) - (item.price * item.quantity * (item.discountPercent / 100))) * (item.taxPercent / 100)).toFixed(2)}</td>
                       <td className="px-8 py-6 text-center text-emerald-600 font-black text-lg">${item.total.toFixed(2)}</td>
                       <td className="px-8 py-6 text-center">
                          <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-300 hover:text-red-600 text-xl">🗑</button>
                       </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr><td colSpan={8} className="py-32 text-center opacity-20 font-black italic uppercase tracking-[0.2em]">لا توجد أصناف مضافة حالياً</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Summary & Settlement */}
         <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7 space-y-6">
                <textarea 
                    value={notes}
                    onChange={e=>setNotes(e.target.value)}
                    placeholder="ملاحظات المستودع (مثلاً: حالة الاستلام، كسر في الكراتين، الخ...)"
                    className="w-full bg-gray-50 border border-gray-100 p-8 rounded-[35px] font-bold h-44 outline-none focus:bg-white focus:ring-4 ring-blue-500/5 shadow-inner"
                ></textarea>
            </div>

            <div className="col-span-12 lg:col-span-5">
               <div className="bg-slate-900 p-10 rounded-[50px] text-white shadow-3xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                  
                  <div className="space-y-6">
                     <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] text-center">إجمالي فاتورة التوريد</p>
                     <h4 className="text-6xl font-black tracking-tighter text-center">${grandTotal.toLocaleString()}</h4>
                     
                     <div className="space-y-3 pt-6 border-t border-white/5">
                        <div className="flex justify-between text-[11px] font-bold">
                           <span className="opacity-40">قبل الخصم والضريبة:</span>
                           <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-red-400">
                           <span className="opacity-40">خصم المورد:</span>
                           <span>-${totalDiscount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-blue-400">
                           <span className="opacity-40">الضريبة المضافة:</span>
                           <span>+${totalTax.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="pt-8 space-y-2">
                        <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block text-center">المبلغ المسدد حالياً ($)</label>
                        <input 
                            type="number" 
                            value={paidAmount}
                            onChange={e=>setPaidAmount(parseFloat(e.target.value)||0)}
                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black text-2xl outline-none focus:bg-white/10 text-emerald-400 text-center" 
                            placeholder="0.00"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={handleSaveInvoice}
                    disabled={cart.length === 0 || !selectedSupplierId}
                    className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all mt-10 disabled:opacity-20"
                  >
                     اعتماد وترحيل للمخازن
                  </button>
               </div>
            </div>
         </div>
      </div>
      ) : (
        <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 overflow-hidden animate-in slide-in-from-left-8">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800">أرشيف فواتير المشتريات</h3>
              <div className="flex gap-2">
                 <input type="text" placeholder="بحث برقم الفاتورة..." className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl font-bold outline-none" />
              </div>
           </div>
           
           <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
              <table className="w-full text-right text-xs">
                 <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                    <tr>
                       <th className="px-10 py-7">رقم الفاتورة</th>
                       <th className="px-10 py-7">المورد</th>
                       <th className="px-10 py-7">التاريخ</th>
                       <th className="px-10 py-7 text-center">الإجمالي</th>
                       <th className="px-10 py-7 text-center">الحالة</th>
                       <th className="px-10 py-7 text-center">الإجراء</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                    {purchases.map(inv => (
                       <tr key={inv.id} className="hover:bg-white transition-all">
                          <td className="px-10 py-6 text-blue-600 font-black">#{inv.id}</td>
                          <td className="px-10 py-6">{suppliers.find(s=>s.id===inv.supplierId)?.name_ar}</td>
                          <td className="px-10 py-6 text-gray-400">{new Date(inv.date).toLocaleDateString()}</td>
                          <td className="px-10 py-6 text-center font-black">${inv.total.toLocaleString()}</td>
                          <td className="px-10 py-6 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                inv.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                             }`}>{inv.paymentStatus}</span>
                          </td>
                          <td className="px-10 py-6 text-center">
                             <button className="text-blue-500 hover:underline text-[10px] font-black uppercase">عرض</button>
                          </td>
                       </tr>
                    ))}
                    {purchases.length === 0 && (
                       <tr><td colSpan={6} className="py-20 text-center opacity-30 font-black italic uppercase tracking-[0.2em]">لا يوجد سجل مشتريات</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
