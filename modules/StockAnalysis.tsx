
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DamagedItem, Product } from '../types';

const StockAnalysis: React.FC = () => {
  const { products, damages, sales, purchases, lang, addDamage, boms, productionOrders, generateAIContent, addToast } = useApp();
  const [tab, setTab] = useState<'movement' | 'damages' | 'alerts' | 'sellers' | 'audit'>('movement');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
  // Damage Modal State
  const [showModal, setShowModal] = useState(false);
  const [newDamage, setNewDamage] = useState({ productId: '', quantity: 1, reason: '' });

  // History Modal State
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const stagnantProducts = products.filter(p => {
      if(!p.lastUpdated) return false;
      const daysInactive = (new Date().getTime() - new Date(p.lastUpdated).getTime()) / (1000 * 3600 * 24);
      return daysInactive > (p.stagnantLevel || 30) && p.stock > 0;
  });

  const bestSellers = products.map(p => {
    // Correcting i.id to i.productId for SaleItem property lookup
    const totalSold = sales.reduce((acc, s) => acc + (s.items.find(i => i.productId === p.id)?.quantity || 0), 0);
    return { name: p.name, sold: totalSold };
  }).sort((a, b) => b.sold - a.sold).slice(0, 5);

  const handleReportDamage = () => {
      if(!newDamage.productId || !newDamage.reason) return;
      const product = products.find(p => p.id === newDamage.productId);
      if(product) {
          const damage: DamagedItem = {
              id: `DMG-${Date.now()}`,
              productId: product.id,
              productName: product.name_ar,
              quantity: newDamage.quantity,
              reason: newDamage.reason,
              cost: product.cost * newDamage.quantity,
              date: new Date().toISOString()
          };
          addDamage(damage);
          setShowModal(false);
          setNewDamage({ productId: '', quantity: 1, reason: '' });
          alert('تم تسجيل التالف وخصمه من المخزون بنجاح');
      }
  };

  const runAiDiagnosis = async () => {
      setIsDiagnosing(true);
      const itemsToAnalyze = [...lowStockProducts.map(p=>p.name_ar + " (Low Stock)"), ...stagnantProducts.map(p=>p.name_ar + " (Stagnant)")].slice(0, 10);
      
      if(itemsToAnalyze.length === 0) {
          setAiDiagnosis("المخزون في حالة ممتازة. لا توجد تنبيهات للتحليل.");
          setIsDiagnosing(false);
          return;
      }

      const prompt = `
        As an Inventory Manager, analyze these alerts: ${itemsToAnalyze.join(', ')}.
        Suggest 3 specific actions to clear stagnant stock (e.g. bundling, clearance) and optimize reordering for low stock.
        Answer in Arabic bullet points.
      `;

      try {
          const result = await generateAIContent(prompt, 'analysis');
          setAiDiagnosis(result);
      } catch (e) {
          addToast("AI Service Unavailable", "error");
      }
      setIsDiagnosing(false);
  };

  const getProductHistory = (prodId: string) => {
      const history: any[] = [];
      
      // Sales (Out)
      sales.forEach(s => {
          const item = s.items.find(i => i.productId === prodId);
          if (item) history.push({ 
              date: s.date, 
              type: 'Sale', 
              qty: -item.quantity, 
              ref: s.id,
              details: s.customerName ? `عميل: ${s.customerName}` : 'مبيعات مباشرة'
          });
      });

      // Purchases (In)
      purchases.forEach(p => {
          const item = p.items.find(i => i.productId === prodId);
          if (item) history.push({ 
              date: p.date, 
              type: 'Purchase', 
              qty: item.quantity, 
              ref: p.id, 
              details: `فاتورة مورد`
          });
      });

      // Damages (Out)
      damages.filter(d => d.productId === prodId).forEach(d => {
          history.push({ 
              date: d.date, 
              type: 'Damage', 
              qty: -d.quantity, 
              ref: d.id, 
              details: d.reason 
          });
      });

      // Production Output (In) - When this product is made
      productionOrders.filter(o => o.status === 'completed').forEach(o => {
          const bom = boms.find(b => b.id === o.bomId);
          if (bom && bom.finalProductId === prodId) {
              history.push({ 
                  date: o.startDate, 
                  type: 'Production Output', 
                  qty: o.quantity, 
                  ref: o.id,
                  details: 'تصنيع داخلي'
              });
          }
      });

      // Production Input (Out) - When this product is used as raw material
      productionOrders.forEach(o => {
          const bom = boms.find(b => b.id === o.bomId);
          if (bom) {
              const comp = bom.components.find(c => c.productId === prodId);
              if (comp) {
                  history.push({ 
                      date: o.startDate, 
                      type: 'Raw Material', 
                      qty: -(o.quantity * comp.quantity), 
                      ref: o.id,
                      details: 'استهلاك في التصنيع'
                  });
              }
          }
      });

      return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Supply Chain Intel</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Movement, Wastage, and Market Velocity</p>
        </div>
        <div className="flex glass rounded-[2rem] p-1.5 shadow-md border-white/50 overflow-x-auto custom-scrollbar no-scrollbar">
           {['movement', 'damages', 'alerts', 'sellers'].map(t => (
              <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>
                 {t}
              </button>
           ))}
        </div>
      </div>

      {tab === 'movement' && (
          <div className="glass p-12 rounded-[60px] shadow-2xl border-white bg-white/40">
              <h3 className="text-xl font-black mb-8 text-slate-800">حركة المخزون (Item Card)</h3>
              <div className="mb-8">
                  <select 
                    className="w-full p-4 rounded-2xl border border-gray-100 font-bold outline-none"
                    onChange={(e) => {
                        const p = products.find(prod => prod.id === e.target.value);
                        setSelectedProductHistory(p || null);
                    }}
                  >
                      <option value="">اختر صنفاً لعرض حركته...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
              </div>
              {selectedProductHistory ? (
                  <div className="space-y-4">
                      {getProductHistory(selectedProductHistory.id).map((entry, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-white/60 rounded-2xl border border-white">
                              <div>
                                  <p className="font-black text-slate-800">{entry.type}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(entry.date).toLocaleDateString()} • {entry.details}</p>
                              </div>
                              <span className={`font-black text-lg ${entry.qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {entry.qty > 0 ? '+' : ''}{entry.qty}
                              </span>
                          </div>
                      ))}
                      {getProductHistory(selectedProductHistory.id).length === 0 && <p className="text-center opacity-40">لا توجد حركات مسجلة</p>}
                  </div>
              ) : (
                  <div className="py-20 text-center opacity-30 font-black uppercase">يرجى اختيار منتج</div>
              )}
          </div>
      )}

      {tab === 'alerts' && (
          <div className="space-y-8">
              <div className="bg-indigo-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                      <div>
                          <h3 className="text-xl font-black mb-2">Oracle Inventory Diagnosis</h3>
                          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">AI-Driven Stock Optimization</p>
                      </div>
                      <button 
                        onClick={runAiDiagnosis}
                        disabled={isDiagnosing}
                        className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black text-xs hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                          {isDiagnosing ? 'جاري التحليل...' : 'تشخيص المخزون 🧠'}
                      </button>
                  </div>
                  {aiDiagnosis && (
                      <div className="mt-6 p-6 bg-white/10 rounded-3xl border border-white/10 text-xs font-medium leading-relaxed whitespace-pre-line animate-in slide-in-from-top-4">
                          {aiDiagnosis}
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Low Stock Column */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-black text-red-600 flex items-center gap-2">
                          <span>📉</span> نواقص المخزون (Critical)
                      </h4>
                      {lowStockProducts.map(p => (
                          <div key={p.id} className="p-6 bg-red-50 rounded-[30px] border border-red-100 flex justify-between items-center">
                              <div>
                                  <h4 className="font-black text-slate-800">{p.name_ar}</h4>
                                  <p className="text-[10px] text-red-400 font-bold mt-1">Stock: {p.stock} / Min: {p.minStock}</p>
                              </div>
                              <button className="px-4 py-2 bg-white text-red-600 rounded-xl text-[9px] font-black uppercase shadow-sm">Re-order</button>
                          </div>
                      ))}
                      {lowStockProducts.length === 0 && <p className="text-center opacity-30 text-xs py-10">All stock levels healthy.</p>}
                  </div>

                  {/* Stagnant Stock Column */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-black text-orange-600 flex items-center gap-2">
                          <span>🕸️</span> مخزون راكد (Stagnant)
                      </h4>
                      {stagnantProducts.map(p => (
                          <div key={p.id} className="p-6 bg-orange-50 rounded-[30px] border border-orange-100 flex justify-between items-center">
                              <div>
                                  <h4 className="font-black text-slate-800">{p.name_ar}</h4>
                                  <p className="text-[10px] text-orange-400 font-bold mt-1">Last Active: {new Date(p.lastUpdated).toLocaleDateString()}</p>
                              </div>
                              <button className="px-4 py-2 bg-white text-orange-600 rounded-xl text-[9px] font-black uppercase shadow-sm">Discount</button>
                          </div>
                      ))}
                      {stagnantProducts.length === 0 && <p className="text-center opacity-30 text-xs py-10">No stagnant items detected.</p>}
                  </div>
              </div>
          </div>
      )}

      {tab === 'damages' && (
          <div className="glass p-12 rounded-[60px] shadow-2xl border-white bg-white/40">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-800">سجل التالف والهالك</h3>
                  <button onClick={() => setShowModal(true)} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-red-700 transition-all">تسجيل تالف +</button>
              </div>
              <div className="space-y-4">
                  {damages.map(d => (
                      <div key={d.id} className="flex justify-between items-center p-6 bg-white rounded-[30px] shadow-sm border border-red-50">
                          <div>
                              <h4 className="font-black text-slate-800">{d.productName}</h4>
                              <p className="text-xs text-red-400 font-bold">{d.reason}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xl font-black text-red-600">-{d.quantity}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">${d.cost.toLocaleString()} Loss</p>
                          </div>
                      </div>
                  ))}
                  {damages.length === 0 && <p className="text-center py-20 opacity-30">سجل نظيف</p>}
              </div>
          </div>
      )}

      {tab === 'sellers' && (
          <div className="glass p-12 rounded-[60px] shadow-2xl border-white bg-slate-900 text-white">
              <h3 className="text-xl font-black mb-10">الأكثر مبيعاً (Top 5)</h3>
              <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bestSellers} layout="vertical">
                          <CartesianGrid stroke="#334155" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={150} tick={{fill: 'white', fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                          <Bar dataKey="sold" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={30} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">إتلاف مخزون</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المنتج</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewDamage({...newDamage, productId: e.target.value})}>
                        <option value="">اختر المنتج...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الكمية التالفة</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-red-600" value={newDamage.quantity} onChange={e=>setNewDamage({...newDamage, quantity: parseInt(e.target.value)||1})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">سبب الإتلاف</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newDamage.reason} onChange={e=>setNewDamage({...newDamage, reason: e.target.value})} placeholder="كسر، انتهاء صلاحية..." />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleReportDamage} className="flex-2 py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">تأكيد الإتلاف</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StockAnalysis;
