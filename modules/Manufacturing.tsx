
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { BOM } from '../types';

const Manufacturing: React.FC = () => {
  const { boms, productionOrders, startProduction, completeProduction, products, lang, addBOM } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'boms' | 'timeline'>('orders');
  const [selectedBOM, setSelectedBOM] = useState('');
  const [qty, setQty] = useState(1);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [maxPossible, setMaxPossible] = useState(0);
  
  // New BOM Form
  const [newBOM, setNewBOM] = useState({ finalProductId: '', components: [] as { productId: string, quantity: number }[] });

  // Update max possible quantity when BOM changes
  useEffect(() => {
      if (selectedBOM) {
          const bom = boms.find(b => b.id === selectedBOM);
          if (bom) {
              const limits = bom.components.map(comp => {
                  const product = products.find(p => p.id === comp.productId);
                  const stock = product?.stock || 0;
                  return Math.floor(stock / comp.quantity);
              });
              setMaxPossible(limits.length > 0 ? Math.min(...limits) : 0);
          }
      } else {
          setMaxPossible(0);
      }
  }, [selectedBOM, products, boms]);

  const handleCreateBOM = () => {
    if(!newBOM.finalProductId || newBOM.components.length === 0) return;
    const bom: BOM = {
        id: `BOM-${Date.now()}`,
        finalProductId: newBOM.finalProductId,
        components: newBOM.components
    };
    addBOM(bom);
    setShowBOMModal(false);
    setNewBOM({ finalProductId: '', components: [] });
  };

  const addComponentToBOM = (prodId: string) => {
      setNewBOM({...newBOM, components: [...newBOM.components, { productId: prodId, quantity: 1 }]});
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة التصنيع والإنتاج</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Material conversion, Assembly lines, and Yield tracking</p>
        </div>
        <div className="flex gap-4">
            <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100">
               <button onClick={() => setActiveTab('orders')} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800'}`}>خط الإنتاج</button>
               <button onClick={() => setActiveTab('timeline')} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'timeline' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800'}`}>الجدول الزمني 📅</button>
               <button onClick={() => setActiveTab('boms')} className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all ${activeTab === 'boms' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800'}`}>الوصفات (BOM)</button>
            </div>
            <button 
                onClick={() => setShowBOMModal(true)}
                className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-orange-700 transition-all"
            >
                تعريف خطة إنتاج +
            </button>
        </div>
      </div>

      {activeTab === 'orders' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Build Area */}
         <div className="lg:col-span-1 glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40">
            <h3 className="text-xl font-black text-slate-800 mb-8">إطلاق أمر إنتاج جديد</h3>
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">اختر خطة الإنتاج (BOM)</label>
                  <select 
                    value={selectedBOM}
                    onChange={e => setSelectedBOM(e.target.value)}
                    className="w-full bg-white border border-gray-100 p-4 rounded-2xl font-bold outline-none shadow-inner"
                  >
                     <option value="">اختر المنتج النهائي...</option>
                     {boms.map(bom => (
                        <option key={bom.id} value={bom.id}>{products.find(p=>p.id===bom.finalProductId)?.name_ar}</option>
                     ))}
                  </select>
               </div>
               
               {selectedBOM && (
                   <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                       <p className="text-[10px] font-black text-blue-600 uppercase mb-1">تحليل المواد الخام</p>
                       <p className="text-xs font-bold text-slate-700">الحد الأقصى الممكن إنتاجه: <span className="text-lg font-black text-blue-700">{maxPossible}</span> وحدة</p>
                   </div>
               )}

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">الكمية المستهدفة</label>
                  <input 
                    type="number" 
                    value={qty}
                    onChange={e => setQty(parseInt(e.target.value)||1)}
                    className={`w-full bg-white border p-4 rounded-2xl font-black text-2xl outline-none shadow-inner ${qty > maxPossible ? 'border-red-300 text-red-500' : 'border-gray-100 text-slate-800'}`}
                  />
                  {qty > maxPossible && <p className="text-[9px] font-bold text-red-500 mt-2 px-1 animate-pulse">تنبيه: الكمية تتجاوز رصيد المواد الخام المتوفر!</p>}
               </div>
               <button 
                onClick={() => startProduction(selectedBOM, qty)}
                disabled={qty > maxPossible || !selectedBOM}
                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black shadow-xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  بدء خط الإنتاج الآن
               </button>
            </div>
         </div>

         {/* Active Orders */}
         <div className="lg:col-span-2 glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
               <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
               أوامر الإنتاج النشطة
            </h3>
            <div className="space-y-6">
               {productionOrders.map(order => {
                  const bom = boms.find(b => b.id === order.bomId);
                  const product = products.find(p => p.id === bom?.finalProductId);
                  return (
                    <div key={order.id} className="p-8 bg-white/60 rounded-[35px] border border-white flex justify-between items-center hover:bg-white transition-all shadow-sm group">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner font-black ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>
                             {order.status === 'completed' ? '✓' : '⚙'}
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-800">{product?.name_ar} (x{order.quantity})</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {order.id} • Started: {new Date(order.startDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase mb-4 inline-block ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                             {order.status === 'completed' ? 'مكتمل' : 'قيد الإنتاج'}
                          </span>
                          {order.status === 'in_progress' && (
                             <button 
                                onClick={() => completeProduction(order.id)}
                                className="block py-2 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-md"
                             >
                                اعتماد الاكتمال
                             </button>
                          )}
                       </div>
                    </div>
                  )
               })}
            </div>
         </div>
      </div>
      )}

      {activeTab === 'timeline' && (
          <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
              <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                  <div className="w-3 h-8 bg-purple-600 rounded-full"></div>
                  الجدول الزمني للإنتاج (Gantt View)
              </h3>
              
              <div className="relative border-l-2 border-slate-100 pl-8 space-y-12">
                  {productionOrders.map((order, i) => {
                      const bom = boms.find(b => b.id === order.bomId);
                      const product = products.find(p => p.id === bom?.finalProductId);
                      return (
                          <div key={order.id} className="relative">
                              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white bg-indigo-600 shadow-md"></div>
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                  <div className="flex justify-between items-center mb-4">
                                      <h4 className="font-black text-slate-800">{product?.name_ar}</h4>
                                      <span className="text-[10px] font-bold text-gray-400">{new Date(order.startDate).toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-white h-4 rounded-full overflow-hidden shadow-inner mb-2">
                                      <div 
                                        className={`h-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} 
                                        style={{ width: order.status === 'completed' ? '100%' : '60%' }}
                                      ></div>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-bold uppercase">
                                      <span className="text-indigo-600">{order.quantity} Units</span>
                                      <span className={order.status === 'completed' ? 'text-emerald-600' : 'text-blue-500'}>{order.status}</span>
                                  </div>
                              </div>
                          </div>
                      )
                  })}
                  {productionOrders.length === 0 && (
                      <div className="text-center py-20 opacity-30 font-black uppercase text-xl">لا توجد عمليات إنتاج مجدولة</div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'boms' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-8">
            {boms.map(bom => {
               const finalProd = products.find(p=>p.id===bom.finalProductId);
               return (
                  <div key={bom.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-white/40 hover:bg-white transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <h4 className="text-xl font-black text-slate-800">{finalProd?.name_ar}</h4>
                        <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">Ref: {bom.id}</span>
                     </div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">المكونات (Raw Materials)</p>
                     <div className="space-y-3 mb-8">
                        {bom.components.map((comp, i) => {
                           const p = products.find(p=>p.id===comp.productId);
                           return (
                           <div key={i} className="flex justify-between p-3 bg-white rounded-2xl border border-gray-50 text-xs">
                              <span className="font-bold text-slate-700">{p?.name_ar}</span>
                              <span className="font-black text-blue-600">x{comp.quantity} {p?.minorUnit || 'وحدة'}</span>
                           </div>
                           )
                        })}
                     </div>
                     <button 
                        onClick={() => { setSelectedBOM(bom.id); setActiveTab('orders'); }}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
                     >
                        استخدام في الإنتاج
                     </button>
                  </div>
               )
            })}
            {boms.length === 0 && (
               <div className="col-span-3 py-32 text-center opacity-30 font-black uppercase text-xl">لا توجد وصفات إنتاج محفوظة</div>
            )}
         </div>
      )}

      {showBOMModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-xl p-12 rounded-[60px] shadow-3xl border-white relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">تعريف وصفة إنتاجية (BOM)</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المنتج النهائي (Output)</label>
                    <select 
                       className="w-full glass-dark p-4 rounded-3xl outline-none font-bold text-blue-600"
                       onChange={e => setNewBOM({...newBOM, finalProductId: e.target.value})}
                    >
                       <option value="">اختر المنتج المصنع...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                    </select>
                 </div>

                 <div className="border-t border-slate-200 pt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">المواد الخام (Components)</p>
                    <div className="space-y-3 mb-4">
                       {newBOM.components.map((c, i) => (
                          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                             <span className="font-bold text-xs">{products.find(p=>p.id===c.productId)?.name_ar}</span>
                             <span className="font-black text-blue-600">x{c.quantity}</span>
                          </div>
                       ))}
                    </div>
                    <select 
                       className="w-full glass-dark p-4 rounded-3xl outline-none font-bold text-xs"
                       onChange={e => { if(e.target.value) addComponentToBOM(e.target.value) }}
                    >
                       <option value="">+ إضافة مادة خام...</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name_ar} ({p.minorUnit})</option>)}
                    </select>
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowBOMModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleCreateBOM} className="flex-2 py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ الوصفة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Manufacturing;
