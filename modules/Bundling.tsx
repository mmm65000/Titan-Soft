
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Product, BundleItem } from '../types';

const Bundling: React.FC = () => {
  const { products, setProducts, addLog, lang } = useApp();
  const [bundleForm, setBundleForm] = useState({ name: '', sku: '', price: 0, components: [] as BundleItem[] });

  const handleAddBundle = () => {
    // FIX: Added missing mandatory properties for the Product interface to avoid compilation error
    const newProduct: Product = {
        id: `p-bundle-${Date.now()}`,
        name: bundleForm.name,
        name_ar: bundleForm.name,
        sku: bundleForm.sku,
        category: 'Bundles',
        categoryId: 'cat-bundles',
        price: bundleForm.price,
        wholesalePrice: bundleForm.price * 0.9,
        cost: bundleForm.components.reduce((acc, curr) => acc + (products.find(p=>p.id===curr.productId)?.cost || 0) * curr.quantity, 0),
        taxRate: 15,
        stock: 0, // Bundles are virtual
        minStock: 0,
        stagnantLevel: 0,
        reorderPoint: 0,
        image: 'https://images.unsplash.com/photo-1549463591-24c188273390?w=400&h=400&fit=crop',
        isOnline: true,
        openingBalance: 0,
        branchStocks: {},
        majorUnit: 'بكج',
        minorUnit: 'حبة',
        unitContent: 1,
        maxDiscount: 0,
        inventoryDisabled: true,
        expiryTracking: false,
        isReturnable: true,
        barcode: `B-${Date.now()}`,
        isBundle: true,
        bundleItems: bundleForm.components
    };
    setProducts([...products, newProduct]);
    addLog(`تم إنشاء بكج مجمع جديد: ${bundleForm.name}`, 'success', 'Inventory');
    setBundleForm({ name: '', sku: '', price: 0, components: [] });
    alert('تم إنشاء البكج بنجاح');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">استوديو التجميع الذكي</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Create virtual kits and composite product offerings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Build Area */}
         <div className="glass p-12 rounded-[60px] shadow-3xl border-white bg-white/40">
            <h3 className="text-2xl font-black text-slate-800 mb-8">توليف بكج جديد</h3>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="اسم البكج..." 
                    className="w-full glass-dark p-5 rounded-3xl outline-none font-bold shadow-inner"
                    value={bundleForm.name} onChange={e=>setBundleForm({...bundleForm, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="SKU مخصص..." 
                    className="w-full glass-dark p-5 rounded-3xl outline-none font-bold shadow-inner"
                    value={bundleForm.sku} onChange={e=>setBundleForm({...bundleForm, sku: e.target.value})}
                  />
               </div>
               <input 
                 type="number" placeholder="سعر البيع النهائي..." 
                 className="w-full glass-dark p-5 rounded-3xl outline-none font-black text-2xl text-blue-600 shadow-inner"
                 value={bundleForm.price || ''} onChange={e=>setBundleForm({...bundleForm, price: parseFloat(e.target.value)||0})}
               />
               
               <div className="border-t pt-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">المكونات (Components)</p>
                  <div className="space-y-3">
                     {bundleForm.components.map((comp, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50">
                           <span className="font-bold text-xs">{products.find(p=>p.id===comp.productId)?.name_ar}</span>
                           <span className="font-black text-blue-600">x{comp.quantity}</span>
                        </div>
                     ))}
                     <select 
                        onChange={e => {
                            const val = e.target.value;
                            if (!val) return;
                            setBundleForm({...bundleForm, components: [...bundleForm.components, { productId: val, quantity: 1 }]});
                        }}
                        className="w-full p-4 rounded-2xl bg-gray-50 font-bold text-xs outline-none"
                     >
                        <option value="">+ إضافة صنف للمكونات...</option>
                        {products.filter(p=>!p.isBundle).map(p=>(
                           <option key={p.id} value={p.id}>{p.name_ar}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <button 
                onClick={handleAddBundle}
                className="w-full py-6 bg-slate-900 text-white rounded-[3rem] font-black shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-[11px]"
               >
                  اعتماد ونشر البكج في النظام
               </button>
            </div>
         </div>

         {/* Visual Preview */}
         <div className="flex flex-col gap-6">
            <div className="glass p-10 rounded-[55px] border-white shadow-xl bg-slate-900 text-white h-fit">
               <h3 className="text-xl font-black mb-6 flex items-center gap-3"><div className="w-2 h-7 bg-blue-500 rounded-full"></div> تحليل تكلفة البكج</h3>
               <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                     <span className="opacity-60 text-xs">تكلفة المكونات مجمعة</span>
                     <span className="font-black text-red-400">${bundleForm.components.reduce((a,c) => a + (products.find(p=>p.id===c.productId)?.cost || 0) * c.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                     <span className="opacity-60 text-xs">هامش الربح المتوقع</span>
                     <span className="font-black text-emerald-400">{bundleForm.price ? (((bundleForm.price - bundleForm.components.reduce((a,c) => a + (products.find(p=>p.id===c.productId)?.cost || 0) * c.quantity, 0)) / bundleForm.price) * 100).toFixed(1) : 0}%</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {products.filter(p => p.isBundle).map(p => (
                   <div key={p.id} className="glass p-6 rounded-[40px] border-white shadow-lg bg-white/60">
                      <img src={p.image} className="w-full h-32 rounded-3xl object-cover mb-4" />
                      <h4 className="font-black text-xs text-slate-800 truncate">{p.name_ar}</h4>
                      <p className="text-blue-600 font-black text-sm mt-1">${p.price}</p>
                      <div className="mt-3 flex gap-1">
                         {p.bundleItems?.slice(0, 3).map((bi, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] font-black border border-white">#</div>
                         ))}
                      </div>
                   </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Bundling;
