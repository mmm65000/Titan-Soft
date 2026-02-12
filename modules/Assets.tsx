
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FixedAsset } from '../types';

const Assets: React.FC = () => {
  const { fixedAssets, lang, addAsset, maintenanceTasks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', value: '', category: 'Equipment' });
  const [selectedAssetHistory, setSelectedAssetHistory] = useState<FixedAsset | null>(null);

  const handleAdd = () => {
    if(!newAsset.name || !newAsset.value) return;
    const a: FixedAsset = {
        id: `AST-${Date.now()}`,
        name: newAsset.name,
        category: newAsset.category,
        purchaseValue: parseFloat(newAsset.value),
        currentValue: parseFloat(newAsset.value),
        status: 'active'
    };
    addAsset(a);
    setShowModal(false);
    setNewAsset({ name: '', value: '', category: 'Equipment' });
  };

  const assetTasks = selectedAssetHistory ? maintenanceTasks.filter(t => t.assetName === selectedAssetHistory.name) : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الأصول والعهدة</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Fixed asset tracking, lifecycle management & maintenance</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
        >
            تسجيل أصل جديد +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">إجمالي قيمة الأصول</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">${fixedAssets.reduce((a,b)=>a+b.purchaseValue, 0).toLocaleString()}</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Net Asset Worth</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">إهلاك الأصول (السنوي)</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">$4,250</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-600">Annual Loss 4%</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">صيانات مجدولة</p>
            <h3 className="text-4xl font-black tracking-tighter">{maintenanceTasks.length} مهام</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400">تحتاج إجراء فوري</span>
         </div>
         <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الأصول المشغولة</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">92%</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Utilization Rate</span>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100">
         <h3 className="text-2xl font-black text-slate-800 mb-10">سجل الأصول المركزية</h3>
         <div className="rounded-[40px] border border-gray-50 overflow-hidden">
            <table className="w-full text-right text-xs">
               <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                  <tr>
                     <th className="px-10 py-7">الأصل / المعدة</th>
                     <th className="px-10 py-7">التصنيف</th>
                     <th className="px-10 py-7">قيمة الشراء</th>
                     <th className="px-10 py-7">القيمة الحالية</th>
                     <th className="px-10 py-7 text-center">الحالة</th>
                     <th className="px-10 py-7 text-center">الإجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                  {fixedAssets.map(asset => (
                     <tr key={asset.id} className="hover:bg-blue-50/10">
                        <td className="px-10 py-6 font-black text-slate-900">{asset.name}</td>
                        <td className="px-10 py-6 capitalize">{asset.category}</td>
                        <td className="px-10 py-6">${asset.purchaseValue.toLocaleString()}</td>
                        <td className="px-10 py-6 text-blue-600">${asset.currentValue.toLocaleString()}</td>
                        <td className="px-10 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${asset.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                              {asset.status === 'active' ? 'نشط' : 'تحت الصيانة'}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <button onClick={() => setSelectedAssetHistory(asset)} className="text-blue-500 hover:underline text-[10px] font-black uppercase">سجل الصيانة ←</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {selectedAssetHistory && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-2xl p-12 rounded-[60px] shadow-3xl border-white relative max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tighter">سجل صيانة: {selectedAssetHistory.name}</h3>
                 <button onClick={() => setSelectedAssetHistory(null)} className="p-3 bg-gray-100 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-500">✕</button>
              </div>
              <div className="space-y-4">
                 {assetTasks.length > 0 ? assetTasks.map(task => (
                    <div key={task.id} className="p-6 bg-white rounded-[2rem] border border-gray-100 flex justify-between items-center">
                       <div>
                          <p className="font-black text-slate-800">{task.taskType}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase">Date: {task.scheduledDate} • Eng: {task.assignedEngineer}</p>
                       </div>
                       <span className="text-[9px] bg-slate-100 px-3 py-1 rounded-full uppercase font-bold">{task.priority}</span>
                    </div>
                 )) : (
                    <p className="text-center py-10 opacity-30 font-black uppercase text-sm">لا توجد سجلات صيانة لهذا الأصل</p>
                 )}
              </div>
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">أصل ثابت جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اسم الأصل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newAsset.name} onChange={e=>setNewAsset({...newAsset, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">القيمة الشرائية</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newAsset.value} onChange={e=>setNewAsset({...newAsset, value: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">التصنيف</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewAsset({...newAsset, category: e.target.value})}>
                       <option value="Equipment">معدات</option>
                       <option value="Vehicles">مركبات</option>
                       <option value="Electronics">أجهزة إلكترونية</option>
                       <option value="Furniture">أثاث</option>
                    </select>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">حفظ في السجل</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
