
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ImportRecord } from '../types';

const GlobalImport: React.FC = () => {
  const { imports, updateImportRecord, addImportRecord, addLog, products, updateProduct, addExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  
  // New Import Form
  const [newImp, setNewImp] = useState({ vessel: '', container: '', origin: '', dest: '', eta: '', val: '', tax: '' });
  
  // Clearance State
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);
  const [clearanceData, setClearanceData] = useState({ extraFees: '0', note: '' });
  const [containerItems, setContainerItems] = useState<{productId: string, quantity: number, unitCost: number}[]>([]);
  const [tempItem, setTempItem] = useState({ productId: '', quantity: '', unitCost: '' });

  const handleAdd = () => {
    if(!newImp.vessel || !newImp.val) return;
    const rec: ImportRecord = {
        id: `IMP-${Date.now()}`,
        vesselName: newImp.vessel,
        containerNumber: newImp.container || 'PENDING',
        originPort: newImp.origin || 'China',
        destinationPort: newImp.dest || 'Dammam',
        eta: newImp.eta,
        totalValue: parseFloat(newImp.val),
        customsDuty: parseFloat(newImp.tax) || 0
    };
    addImportRecord(rec);
    setShowModal(false);
    setNewImp({ vessel: '', container: '', origin: '', dest: '', eta: '', val: '', tax: '' });
    addLog(`New Import Record created: ${rec.containerNumber}`, 'info', 'GlobalImport');
  };

  const addItemToContainer = () => {
      if(!tempItem.productId || !tempItem.quantity || !tempItem.unitCost) return;
      setContainerItems([...containerItems, {
          productId: tempItem.productId,
          quantity: parseFloat(tempItem.quantity),
          unitCost: parseFloat(tempItem.unitCost)
      }]);
      setTempItem({ productId: '', quantity: '', unitCost: '' });
  };

  const handleExecuteClearance = () => {
      if (!selectedImport) return;

      const extraFees = parseFloat(clearanceData.extraFees) || 0;
      const totalCustoms = selectedImport.customsDuty;
      const totalFOB = selectedImport.totalValue;
      
      // 1. Calculate Landed Cost Factor
      // Landed Cost = FOB + Customs + Extra Fees
      // Factor = Total Landed Cost / Total FOB
      // If items total cost doesn't match invoice total value, we distribute based on items value.
      
      const itemsTotalValue = containerItems.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
      
      if (itemsTotalValue === 0) {
          alert("Please add items to the container to calculate costs.");
          return;
      }

      // Proportional distribution of overheads (Customs + Fees)
      const overheads = totalCustoms + extraFees;
      
      containerItems.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              const itemTotalFOB = item.unitCost * item.quantity;
              const itemShare = itemTotalFOB / itemsTotalValue; // % of total value
              const itemOverhead = overheads * itemShare;
              
              const totalItemLandedCost = itemTotalFOB + itemOverhead;
              const unitLandedCost = totalItemLandedCost / item.quantity;

              // 2. Weighted Average Cost (WAC) Update
              const currentVal = product.stock * product.cost;
              const incomingVal = item.quantity * unitLandedCost;
              const newTotalStock = product.stock + item.quantity;
              const newWAC = (currentVal + incomingVal) / newTotalStock;

              updateProduct(product.id, {
                  stock: newTotalStock,
                  cost: parseFloat(newWAC.toFixed(2))
              });
          }
      });

      // 3. Financial Recording
      if (overheads > 0) {
          addExpense({
              category: 'Customs & Clearance',
              amount: overheads,
              note: `Import Clearance: ${selectedImport.containerNumber} (${clearanceData.note})`,
              type: 'cost_of_goods'
          });
      }

      // 4. Update Record Status
      updateImportRecord(selectedImport.id, { eta: `CLEARED - ${new Date().toLocaleDateString()}` });
      
      addLog(`Import ${selectedImport.containerNumber} cleared. Inventory & Costs updated.`, 'success', 'GlobalImport');
      setShowClearanceModal(false);
      setContainerItems([]);
      setClearanceData({ extraFees: '0', note: '' });
  };

  const openClearance = (imp: ImportRecord) => {
      if(imp.eta.includes('CLEARED')) return alert('This shipment is already cleared.');
      setSelectedImport(imp);
      setShowClearanceModal(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">الاستيراد والتخليص الجمركي</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Landed Cost Calculation & Customs Management</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-600 transition-all"
        >
            فتح ملف استيراد
            <span>🚢</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">الشحنات النشطة</p>
            <h3 className="text-4xl font-black text-slate-800">{imports.filter(i => !i.eta.includes('CLEARED')).length}</h3>
            <span className="text-[9px] font-bold text-blue-500 uppercase">In Transit</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">إجمالي الرسوم الجمركية</p>
            <h3 className="text-4xl font-black text-slate-800">${imports.reduce((a,b)=>a+b.customsDuty, 0).toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-indigo-500 uppercase">Paid & Pending</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white h-56 flex flex-col justify-between">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">القيمة الإجمالية (FOB)</p>
            <h3 className="text-4xl font-black tracking-tighter">${imports.reduce((a,b)=>a+b.totalValue, 0).toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-orange-400 animate-pulse">Investment Value</span>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100">
         <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
            <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
            سجل الشحنات والحاويات
         </h3>
         <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
            <table className="w-full text-right text-xs">
               <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-7">اسم السفينة</th>
                     <th className="px-10 py-7">رقم الحاوية</th>
                     <th className="px-10 py-7">المسار (Origin -> Dest)</th>
                     <th className="px-10 py-7 text-center">الوصول المتوقع / الحالة</th>
                     <th className="px-10 py-7 text-center">القيمة (FOB)</th>
                     <th className="px-10 py-7 text-center">الإجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {imports.map(imp => (
                    <tr key={imp.id} className="hover:bg-white transition-all group">
                       <td className="px-10 py-6">{imp.vesselName}</td>
                       <td className="px-10 py-6 font-mono text-blue-600">{imp.containerNumber}</td>
                       <td className="px-10 py-6 text-gray-500">{imp.originPort} ➝ {imp.destinationPort}</td>
                       <td className="px-10 py-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${imp.eta.includes('CLEARED') ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                             {imp.eta}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-center">${imp.totalValue.toLocaleString()}</td>
                       <td className="px-10 py-6 text-center">
                          {!imp.eta.includes('CLEARED') && (
                              <button 
                                onClick={() => openClearance(imp)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 shadow-lg transition-all"
                              >
                                 تخليص
                              </button>
                          )}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* New Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">تسجيل شحنة واردة</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم السفينة</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.vessel} onChange={e=>setNewImp({...newImp, vessel: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">رقم الحاوية</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold uppercase" value={newImp.container} onChange={e=>setNewImp({...newImp, container: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ميناء الشحن</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.origin} onChange={e=>setNewImp({...newImp, origin: e.target.value})} placeholder="Shanghai" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">ميناء الوصول</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.dest} onChange={e=>setNewImp({...newImp, dest: e.target.value})} placeholder="Jeddah" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">قيمة البضاعة ($)</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newImp.val} onChange={e=>setNewImp({...newImp, val: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الرسوم الجمركية التقديرية</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold text-red-500" value={newImp.tax} onChange={e=>setNewImp({...newImp, tax: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">تاريخ الوصول المتوقع</label>
                    <input type="date" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newImp.eta} onChange={e=>setNewImp({...newImp, eta: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">فتح الملف</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Clearance Modal */}
      {showClearanceModal && selectedImport && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-4xl p-10 rounded-[60px] shadow-3xl border-white relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <div>
                      <h3 className="text-2xl font-black text-slate-800">تخليص جمركي (Landed Cost Calc)</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1">Ref: {selectedImport.containerNumber}</p>
                  </div>
                  <button onClick={() => setShowClearanceModal(false)} className="p-4 bg-gray-100 rounded-full font-bold">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-white rounded-[30px] border border-gray-100 space-y-4">
                      <h4 className="text-sm font-black text-slate-800 border-b pb-2">تفاصيل التكاليف الإضافية</h4>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">رسوم التخليص والنقل ($)</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 p-3 rounded-xl font-black outline-none" 
                            value={clearanceData.extraFees}
                            onChange={e => setClearanceData({...clearanceData, extraFees: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">ملاحظات التخليص</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 p-3 rounded-xl font-bold outline-none" 
                            value={clearanceData.note}
                            onChange={e => setClearanceData({...clearanceData, note: e.target.value})}
                            placeholder="شركة النقل، رقم البيان..."
                          />
                      </div>
                      <div className="pt-4 border-t border-dashed">
                          <div className="flex justify-between text-xs font-bold">
                              <span>قيمة البضاعة (FOB)</span>
                              <span>${selectedImport.totalValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold mt-2">
                              <span>الجمارك (Duty)</span>
                              <span>${selectedImport.customsDuty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold mt-2 text-red-500">
                              <span>مصاريف إضافية</span>
                              <span>${parseFloat(clearanceData.extraFees).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-lg font-black mt-4 bg-slate-900 text-white p-3 rounded-xl">
                              <span>الإجمالي (Total Landed)</span>
                              <span>${(selectedImport.totalValue + selectedImport.customsDuty + parseFloat(clearanceData.extraFees)).toLocaleString()}</span>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-blue-50/50 rounded-[30px] border border-blue-100 flex flex-col">
                      <h4 className="text-sm font-black text-blue-800 border-b border-blue-200 pb-2 mb-4">توزيع الأصناف (Cost Allocation)</h4>
                      <div className="flex-1 overflow-y-auto max-h-[200px] space-y-2 mb-4 pr-2 custom-scrollbar">
                          {containerItems.map((item, idx) => {
                              const p = products.find(prod => prod.id === item.productId);
                              return (
                                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl text-[10px] font-bold shadow-sm">
                                      <span>{p?.name_ar}</span>
                                      <span className="text-gray-500">x{item.quantity}</span>
                                      <span className="text-blue-600">${item.unitCost}</span>
                                  </div>
                              )
                          })}
                          {containerItems.length === 0 && <p className="text-center opacity-40 text-xs py-4">أضف محتويات الحاوية</p>}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                          <select 
                            className="col-span-3 p-2 rounded-lg text-xs font-bold outline-none"
                            onChange={e => setTempItem({...tempItem, productId: e.target.value})}
                            value={tempItem.productId}
                          >
                              <option value="">اختر المنتج...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                          </select>
                          <input type="number" placeholder="الكمية" className="p-2 rounded-lg text-xs outline-none" value={tempItem.quantity} onChange={e=>setTempItem({...tempItem, quantity: e.target.value})} />
                          <input type="number" placeholder="تكلفة الوحدة (FOB)" className="p-2 rounded-lg text-xs outline-none" value={tempItem.unitCost} onChange={e=>setTempItem({...tempItem, unitCost: e.target.value})} />
                          <button onClick={addItemToContainer} className="col-span-3 bg-blue-600 text-white py-2 rounded-lg text-xs font-black hover:bg-blue-700">إضافة للقائمة</button>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4">
                  <button onClick={() => setShowClearanceModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">إلغاء</button>
                  <button 
                    onClick={handleExecuteClearance}
                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all"
                  >
                      اعتماد التخليص وتحديث التكاليف (WAC)
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalImport;
