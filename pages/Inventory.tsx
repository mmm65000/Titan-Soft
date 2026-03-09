import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'framer-motion';
import { Plus, Package, Edit, Trash, AlertTriangle, Filter } from 'lucide-react';

const Inventory = () => {
  const { products } = useApp();
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-8 pb-20">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter">إدارة المخزون</h1>
             <p className="text-slate-500 font-bold mt-1 text-xs">مراقبة الكميات وتتبع حركة الأصناف</p>
          </div>
          <button className="px-8 py-4 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3">
             <Plus size={16} /> إضافة صنف جديد
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
                <Package size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">إجمالي الأصناف</p>
                <h4 className="text-2xl font-black text-white">{products.length}</h4>
             </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-red-500/10 text-red-400">
                <AlertTriangle size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">نقص المخزون</p>
                <h4 className="text-2xl font-black text-white">{products.filter(p => p.stock <= p.minStock).length}</h4>
             </div>
          </div>
       </div>

       <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <div className="flex gap-4">
                {['الكل', 'Electronics', 'Clothing', 'Low Stock'].map(t => (
                  <button key={t} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest glass-card text-slate-400 hover:text-white">
                    {t}
                  </button>
                ))}
             </div>
             <div className="p-2 glass-card rounded-lg text-slate-500">
                <Filter size={18} />
             </div>
          </div>

          <table className="w-full text-right text-sm">
             <thead className="bg-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <tr>
                   <th className="px-8 py-6">المنتج</th>
                   <th className="px-8 py-6">التصنيف</th>
                   <th className="px-8 py-6 text-center">المخزون</th>
                   <th className="px-8 py-6 text-center">السعر</th>
                   <th className="px-8 py-6 text-center">العمليات</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5 font-bold text-slate-300">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                     <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-white/5">
                              <img src={`https://picsum.photos/seed/${p.id}/100`} />
                           </div>
                           <div>
                              <p className="text-white font-black">{p.nameAr}</p>
                              <p className="text-[10px] text-slate-500">{p.barcode}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-5 uppercase tracking-widest text-[10px] text-blue-400 font-black">{p.category}</td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className={p.stock <= p.minStock ? 'text-red-400' : 'text-emerald-400'}>{p.stock} قطعة</span>
                           <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${p.stock <= p.minStock ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(p.stock, 100)}%` }}></div>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-5 text-center text-white font-black">${p.salePrice}</td>
                     <td className="px-8 py-5 text-center">
                        <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <button className="p-2 glass-card rounded-lg text-slate-400 hover:text-blue-400">
                              <Edit size={14} />
                           </button>
                           <button className="p-2 glass-card rounded-lg text-slate-400 hover:text-red-400">
                              <Trash size={14} />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};

export default Inventory;