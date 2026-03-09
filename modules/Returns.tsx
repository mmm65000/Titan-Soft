
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { SaleItem, ReturnRecord } from '../types';

const Returns: React.FC = () => {
  const { sales, addReturn, returns, addLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [returnCart, setReturnCart] = useState<{itemId: string, quantity: number, reason: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const handleSearch = () => {
      const sale = sales.find(s => s.id.includes(searchTerm) || s.referenceNumber?.includes(searchTerm));
      if (sale) {
          setSelectedSale(sale);
          setReturnCart([]);
      } else {
          alert('لم يتم العثور على الفاتورة');
      }
  };

  const toggleReturnItem = (item: SaleItem) => {
      const existing = returnCart.find(r => r.itemId === item.productId);
      if (existing) {
          setReturnCart(returnCart.filter(r => r.itemId !== item.productId));
      } else {
          setReturnCart([...returnCart, { itemId: item.productId, quantity: 1, reason: 'Defective' }]);
      }
  };

  const updateReturnQty = (itemId: string, qty: number, max: number) => {
      if (qty > max || qty < 1) return;
      setReturnCart(returnCart.map(r => r.itemId === itemId ? { ...r, quantity: qty } : r));
  };

  const updateReturnReason = (itemId: string, reason: string) => {
      setReturnCart(returnCart.map(r => r.itemId === itemId ? { ...r, reason } : r));
  };

  const calculateRefundTotal = () => {
      if (!selectedSale) return 0;
      return returnCart.reduce((total, cartItem) => {
          const originalItem = selectedSale.items.find((i: SaleItem) => i.productId === cartItem.itemId);
          return total + (originalItem ? originalItem.price * cartItem.quantity * 1.15 : 0); // Include Tax
      }, 0);
  };

  const handleSubmitReturn = () => {
      if (!selectedSale || returnCart.length === 0) return;
      
      const refundTotal = calculateRefundTotal();
      const returnItemsDetails = returnCart.map(rc => {
          const original = selectedSale.items.find((i: SaleItem) => i.productId === rc.itemId);
          return {
              ...original!,
              quantity: rc.quantity
          };
      });

      const record: ReturnRecord = {
          id: `RMA-${Date.now()}`,
          originalSaleId: selectedSale.id,
          date: new Date().toISOString(),
          items: returnItemsDetails,
          totalRefund: refundTotal,
          reason: returnCart.map(r => `${r.reason} (${r.quantity})`).join(', '),
          status: 'approved',
          restockingFee: 0
      };

      addReturn(record);
      setSelectedSale(null);
      setReturnCart([]);
      setSearchTerm('');
      setActiveTab('history');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة المرتجعات (RMA)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Customer Refunds, Exchanges & Stock Re-entry</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
           <button onClick={() => setActiveTab('new')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>طلب جديد</button>
           <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>سجل المرتجعات</button>
        </div>
      </div>

      {activeTab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40 h-fit">
                  <h3 className="text-xl font-black text-slate-800 mb-6">بحث عن فاتورة</h3>
                  <div className="relative mb-6">
                      <input 
                        type="text" 
                        placeholder="رقم الفاتورة (INV-XXX)..." 
                        className="w-full bg-white p-4 rounded-2xl outline-none font-bold border border-gray-100 shadow-inner"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                      />
                      <button onClick={handleSearch} className="absolute left-2 top-2 bg-slate-900 text-white p-2 rounded-xl text-xs font-black">بحث</button>
                  </div>
                  
                  {selectedSale && (
                      <div className="bg-white p-6 rounded-[30px] border border-gray-100 space-y-4">
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase">رقم الفاتورة</span>
                              <span className="font-black text-blue-600">#{selectedSale.id}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase">التاريخ</span>
                              <span className="font-bold text-xs">{new Date(selectedSale.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase">العميل</span>
                              <span className="font-bold text-xs">{selectedSale.customerName || 'نقدي'}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase">الإجمالي</span>
                              <span className="font-black text-emerald-600 text-lg">${selectedSale.total.toLocaleString()}</span>
                          </div>
                      </div>
                  )}
              </div>

              <div className="lg:col-span-2 glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-50 relative overflow-hidden">
                  {!selectedSale ? (
                      <div className="flex flex-col items-center justify-center h-64 opacity-30">
                          <div className="text-6xl mb-4">🧾</div>
                          <p className="font-black uppercase tracking-widest">قم باختيار فاتورة للبدء</p>
                      </div>
                  ) : (
                      <>
                        <h3 className="text-xl font-black text-slate-800 mb-6">تحديد الأصناف للمرتجع</h3>
                        <div className="space-y-4 mb-10">
                            {selectedSale.items.map((item: SaleItem, idx: number) => {
                                const isSelected = returnCart.some(r => r.itemId === item.productId);
                                const currentReturn = returnCart.find(r => r.itemId === item.productId);
                                return (
                                    <div key={idx} className={`p-4 rounded-3xl border transition-all ${isSelected ? 'bg-white border-blue-200 shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected} 
                                                    onChange={() => toggleReturnItem(item)}
                                                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase">Sold: {item.quantity} • Price: ${item.price}</p>
                                                </div>
                                            </div>
                                            {isSelected && currentReturn && (
                                                <div className="flex items-center gap-4">
                                                    <select 
                                                        className="bg-gray-50 border border-gray-100 rounded-xl p-2 text-xs font-bold outline-none"
                                                        value={currentReturn.reason}
                                                        onChange={(e) => updateReturnReason(item.productId, e.target.value)}
                                                    >
                                                        <option value="Defective">تالف / معيب</option>
                                                        <option value="Changed Mind">تغير الرأي</option>
                                                        <option value="Wrong Item">صنف خاطئ</option>
                                                    </select>
                                                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2">
                                                        <button onClick={() => updateReturnQty(item.productId, currentReturn.quantity - 1, item.quantity)} className="px-2 text-lg font-bold">-</button>
                                                        <span className="font-black text-sm w-4 text-center">{currentReturn.quantity}</span>
                                                        <button onClick={() => updateReturnQty(item.productId, currentReturn.quantity + 1, item.quantity)} className="px-2 text-lg font-bold">+</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="bg-slate-900 text-white p-8 rounded-[40px] flex justify-between items-center shadow-2xl">
                            <div>
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">إجمالي الاسترداد</p>
                                <h4 className="text-4xl font-black text-emerald-400">${calculateRefundTotal().toLocaleString()}</h4>
                            </div>
                            <button 
                                onClick={handleSubmitReturn}
                                disabled={returnCart.length === 0}
                                className="px-10 py-4 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                اعتماد المرتجع
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'history' && (
          <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-black text-slate-800 mb-10">سجل عمليات الاسترجاع</h3>
              <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
                  <table className="w-full text-right text-xs">
                      <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                          <tr>
                              <th className="px-10 py-7">رقم المرتجع</th>
                              <th className="px-10 py-7">الفاتورة الأصلية</th>
                              <th className="px-10 py-7">التاريخ</th>
                              <th className="px-10 py-7 text-center">الأصناف</th>
                              <th className="px-10 py-7 text-center">قيمة الاسترداد</th>
                              <th className="px-10 py-7 text-center">السبب</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                          {returns.map(r => (
                              <tr key={r.id} className="hover:bg-white transition-all">
                                  <td className="px-10 py-6 text-red-500 font-black">#{r.id}</td>
                                  <td className="px-10 py-6 text-blue-600">#{r.originalSaleId}</td>
                                  <td className="px-10 py-6">{new Date(r.date).toLocaleDateString()}</td>
                                  <td className="px-10 py-6 text-center">{r.items.length} SKUs</td>
                                  <td className="px-10 py-6 text-center font-black">${r.totalRefund.toLocaleString()}</td>
                                  <td className="px-10 py-6 text-center max-w-xs truncate" title={r.reason}>{r.reason}</td>
                              </tr>
                          ))}
                          {returns.length === 0 && (
                              <tr><td colSpan={6} className="py-20 text-center opacity-30 font-black uppercase text-sm">لا توجد سجلات</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default Returns;
