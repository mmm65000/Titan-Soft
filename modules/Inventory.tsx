
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Product, StockAdjustment } from '../types';
import ScannerModal from '../components/ScannerModal';

const Inventory: React.FC<{ activeSubTab?: string }> = ({ activeSubTab }) => {
  const { products, categories, branches, activeBranchId, addProduct, updateProduct, deleteProduct, transferStock, generateAIContent, lang, addStockAdjustment, addLog } = useApp();
  
  const [currentView, setCurrentView] = useState<'items' | 'balances' | 'stocktaking' | 'transfer' | 'map'>(
    activeSubTab === 'inventory-balances' ? 'balances' : 
    activeSubTab === 'traceability' ? 'items' : 
    'items'
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');

  const [smartAnalysis, setSmartAnalysis] = useState<{id: string, suggestion: string} | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<Product | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Transfer State
  const [transferForm, setTransferForm] = useState({ toBranch: '', productId: '', quantity: 1, fromBranch: activeBranchId });

  // Stocktaking State
  const [stocktakingData, setStocktakingData] = useState<Record<string, number>>({});

  // Warehouse Map State
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  // Product Form Initial State
  const initialFormState = { 
      id: '', name: '', name_ar: '', scientificName: '', 
      price: '', cost: '', wholesalePrice: '',
      sku: '', barcode: '',
      stock: '', minStock: '5', stagnantLevel: '10',
      categoryId: '', subCategoryId: '',
      majorUnit: 'حبة', minorUnit: '', unitContent: '1', majorUnitPrice: '',
      maxDiscount: '0', 
      inventoryDisabled: false, expiryTracking: false, isReturnable: true, isOnline: true,
      image: '', description: ''
  };
  const [prodForm, setProdForm] = useState(initialFormState);

  // Calculations
  const totalStockValueCost = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const totalStockValueRetail = products.reduce((acc, p) => acc + (p.stock * p.price), 0);

  // Filter Logic
  const filteredProducts = products.filter(p => {
      const matchSearch = p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode?.includes(searchQuery);
      const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const matchSub = subCategoryFilter === 'all' || p.subCategoryId === subCategoryFilter;
      return matchSearch && matchCat && matchSub;
  });

  const activeFilterSubCategories = categories.find(c => c.id === categoryFilter)?.subCategories || [];

  // Warehouse Mock Data
  const warehouseZones = ['A', 'B', 'C'];
  const racksPerZone = 4;

  // Smart Inventory Logic
  const handleSmartAnalysis = async (product: Product) => {
     setSmartAnalysis({ id: product.id, suggestion: "جاري تحليل السوق والأسعار..." });
     const prompt = `Analyze this product for a retailer: ${product.name_ar}. Price: ${product.price}. Cost: ${product.cost}. Stock: ${product.stock}. Provide brief insights.`;
     const insight = await generateAIContent(prompt, 'text');
     setSmartAnalysis({ id: product.id, suggestion: insight });
  };

  const handleScan = (code: string) => {
    setSearchQuery(code);
    setShowScanner(false);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setProdForm({ ...initialFormState });
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setIsEditMode(true);
    setProdForm({ 
        id: p.id, 
        name: p.name, 
        name_ar: p.name_ar, 
        scientificName: p.scientificName || '',
        price: p.price.toString(), 
        cost: p.cost.toString(), 
        wholesalePrice: (p.wholesalePrice || 0).toString(),
        sku: p.sku, 
        barcode: p.barcode || '',
        stock: p.stock.toString(),
        minStock: (p.minStock || 5).toString(),
        stagnantLevel: (p.stagnantLevel || 10).toString(),
        categoryId: p.categoryId || '',
        subCategoryId: p.subCategoryId || '',
        majorUnit: p.majorUnit || 'حبة',
        minorUnit: p.minorUnit || '',
        unitContent: (p.unitContent || 1).toString(),
        majorUnitPrice: (p.majorUnitPrice || 0).toString(),
        maxDiscount: (p.maxDiscount || 0).toString(),
        inventoryDisabled: p.inventoryDisabled || false,
        expiryTracking: p.expiryTracking || false,
        isReturnable: p.isReturnable !== undefined ? p.isReturnable : true,
        isOnline: p.isOnline,
        image: p.image || '',
        description: p.description || ''
    });
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if(!prodForm.name_ar || !prodForm.price) return alert('يرجى تعبئة الحقول الإلزامية: الاسم والسعر');
    
    // Resolve Category Names
    const mainCat = categories.find(c => c.id === prodForm.categoryId);
    const subCat = mainCat?.subCategories.find(s => s.id === prodForm.subCategoryId);
    
    const catName = mainCat ? (lang === 'ar' ? mainCat.name_ar : mainCat.name) : 'General';
    const subCatName = subCat ? (lang === 'ar' ? subCat.name_ar : subCat.name) : '';

    const productData: Product = {
        id: isEditMode ? prodForm.id : `prod-${Date.now()}`,
        name: prodForm.name || prodForm.name_ar,
        name_ar: prodForm.name_ar,
        scientificName: prodForm.scientificName,
        price: parseFloat(prodForm.price),
        cost: parseFloat(prodForm.cost) || 0,
        wholesalePrice: parseFloat(prodForm.wholesalePrice) || 0,
        stock: parseInt(prodForm.stock) || 0,
        minStock: parseInt(prodForm.minStock) || 5,
        stagnantLevel: parseInt(prodForm.stagnantLevel) || 10,
        sku: prodForm.sku || `SKU-${Date.now()}`,
        barcode: prodForm.barcode,
        categoryId: prodForm.categoryId,
        subCategoryId: prodForm.subCategoryId,
        category: catName,
        subCategory: subCatName,
        image: prodForm.image || 'https://placehold.co/100',
        isOnline: prodForm.isOnline,
        majorUnit: prodForm.majorUnit,
        minorUnit: prodForm.minorUnit,
        unitContent: parseFloat(prodForm.unitContent) || 1,
        majorUnitPrice: parseFloat(prodForm.majorUnitPrice) || 0,
        maxDiscount: parseFloat(prodForm.maxDiscount) || 0,
        inventoryDisabled: prodForm.inventoryDisabled,
        expiryTracking: prodForm.expiryTracking,
        isReturnable: prodForm.isReturnable,
        description: prodForm.description
    };

    if (isEditMode) {
        updateProduct(prodForm.id, productData);
    } else {
        addProduct(productData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذا الصنف نهائياً؟')) {
          deleteProduct(id);
          setShowModal(false);
      }
  };

  const handleTransfer = () => {
      if (!transferForm.toBranch || !transferForm.productId) return alert('يرجى تعبئة جميع الحقول');
      if (transferForm.fromBranch === transferForm.toBranch) return alert('لا يمكن التحويل لنفس الفرع');
      
      transferStock(transferForm.productId, transferForm.fromBranch, transferForm.toBranch, transferForm.quantity);
      setTransferForm({ toBranch: '', productId: '', quantity: 1, fromBranch: activeBranchId });
      alert('تم تنفيذ التحويل بنجاح وتحديث الأرصدة ✅');
  };

  const handleStocktakingSubmit = () => {
      if(confirm('هل أنت متأكد من اعتماد الجرد؟ سيتم تعديل الأرصدة فوراً.')) {
          Object.entries(stocktakingData).forEach(([prodId, actualQty]) => {
              const prod = products.find(p => p.id === prodId);
              if (prod && prod.stock !== actualQty) {
                  const diff = Number(actualQty) - Number(prod.stock);
                  // Update Product Stock
                  updateProduct(prodId, { stock: actualQty });
                  
                  // Log Adjustment
                  const adj: StockAdjustment = {
                      id: `ADJ-${Date.now()}-${prodId}`,
                      productId: prodId,
                      productName: prod.name_ar,
                      type: diff > 0 ? 'adjustment' : 'damage',
                      quantity: Math.abs(diff),
                      cost: Number(prod.cost) * Math.abs(diff),
                      discount: 0, tax: 0, total: 0,
                      date: new Date().toISOString()
                  };
                  addStockAdjustment(adj);
              }
          });
          setStocktakingData({});
          addLog('Stocktaking reconciliation completed', 'success', 'Inventory');
          alert('تم اعتماد الجرد بنجاح');
          setCurrentView('items');
      }
  };

  // Helper to get subcategories for currently selected main category in Modal
  const activeSubCategories = categories.find(c => c.id === prodForm.categoryId)?.subCategories || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24" dir="rtl">
       {showScanner && <ScannerModal onScan={handleScan} onClose={() => setShowScanner(false)} lang={lang} />}

       {/* Sovereign Sub-Navigation */}
       <div className="flex flex-wrap items-center gap-4 bg-white/60 p-4 rounded-[2.5rem] shadow-sm border border-gray-100 backdrop-blur-md overflow-x-auto custom-scrollbar no-scrollbar">
          <button onClick={() => setCurrentView('items')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'items' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}>قائمة الأصناف</button>
          <button onClick={() => setCurrentView('balances')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'balances' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}>الأرصدة الحالية</button>
          <button onClick={() => setCurrentView('map')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'map' ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-indigo-500 hover:bg-indigo-50'}`}>خريطة المستودع 🗺️</button>
          <button onClick={() => setCurrentView('transfer')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'transfer' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-blue-500 hover:bg-blue-50'}`}>تحويل مخزون 🚚</button>
          <button onClick={() => setCurrentView('stocktaking')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'stocktaking' ? 'bg-orange-600 text-white shadow-xl scale-105' : 'text-orange-500 hover:bg-orange-50'}`}>الجرد الذكي 📋</button>
       </div>

       {/* Valuation Cards */}
       {(currentView === 'items' || currentView === 'balances') && (
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase">قيمة المخزون (بالتكلفة)</p>
                    <h4 className="text-xl font-black text-slate-800">${totalStockValueCost.toLocaleString()}</h4>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">📉</div>
            </div>
            <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase">القيمة البيعية المتوقعة</p>
                    <h4 className="text-xl font-black text-emerald-600">${totalStockValueRetail.toLocaleString()}</h4>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">📈</div>
            </div>
         </div>
       )}

       {/* Visual Warehouse Map */}
       {currentView === 'map' && (
           <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-slate-900 text-white p-10 rounded-[60px] shadow-3xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                   <h3 className="text-3xl font-black relative z-10 mb-2">الخريطة الحية للمستودع</h3>
                   <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest relative z-10">الفرع النشط: {branches.find(b=>b.id===activeBranchId)?.name_ar}</p>
                   
                   <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                       {warehouseZones.map(zone => (
                           <div key={zone} className="bg-white/10 border border-white/10 rounded-[40px] p-6 backdrop-blur-sm">
                               <h4 className="text-2xl font-black mb-6 text-center opacity-80">Zone {zone}</h4>
                               <div className="grid grid-cols-2 gap-4">
                                   {Array.from({length: racksPerZone}).map((_, i) => {
                                       const rackId = `${zone}-${i+1}`;
                                       // Simulate occupancy
                                       const occupancy = Math.floor(Math.random() * 100);
                                       const color = occupancy > 80 ? 'bg-red-500' : occupancy > 40 ? 'bg-orange-500' : 'bg-emerald-500';
                                       
                                       return (
                                           <div 
                                            key={rackId} 
                                            onClick={() => setSelectedRack(rackId)}
                                            className="bg-slate-800/80 p-4 rounded-3xl border border-white/5 cursor-pointer hover:bg-white/20 transition-all group"
                                           >
                                               <div className="flex justify-between items-center mb-2">
                                                   <span className="text-xs font-bold text-white/70">R-{rackId}</span>
                                                   <div className={`w-2 h-2 rounded-full ${color}`}></div>
                                               </div>
                                               <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                   <div className={`h-full ${color}`} style={{width: `${occupancy}%`}}></div>
                                               </div>
                                               <p className="text-[8px] mt-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">{occupancy}% Full</p>
                                           </div>
                                       )
                                   })}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>

               {selectedRack && (
                   <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40 animate-in slide-in-from-bottom-10">
                       <div className="flex justify-between items-center mb-8">
                           <h4 className="text-2xl font-black text-slate-800">محتويات الرف {selectedRack}</h4>
                           <button onClick={() => setSelectedRack(null)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 shadow-sm transition-all">✕</button>
                       </div>
                       <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                           {products.slice(0, 5).map(p => (
                               <div key={p.id} className="min-w-[180px] bg-white p-5 rounded-[30px] shadow-sm border border-white flex flex-col items-center text-center">
                                   <img src={p.image} className="w-16 h-16 object-cover rounded-2xl mb-3" />
                                   <p className="text-xs font-black text-slate-800 line-clamp-1">{p.name_ar}</p>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{p.sku}</p>
                                   <span className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black">{Math.floor(Math.random() * 20) + 1} Qty</span>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
           </div>
       )}

       {/* Items & Balances View */}
       {(currentView === 'items' || currentView === 'balances') && (
         <div className="bg-white p-10 rounded-[60px] shadow-3xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 mb-10 items-center">
                <button 
                  onClick={openAddModal}
                  className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl hover:bg-blue-700 transition-all font-black text-3xl flex items-center justify-center shrink-0"
                >
                  +
                </button>
                <div className="flex-1 w-full relative flex gap-2">
                   <button 
                      onClick={() => setShowScanner(true)}
                      className="bg-slate-900 text-white px-6 rounded-[1.5rem] flex items-center justify-center hover:bg-slate-700 transition-all shadow-lg"
                   >
                      📷
                   </button>
                   <input 
                    type="text" 
                    placeholder="بحث ذكي في كافة المستودعات..." 
                    className="w-full bg-gray-50 border border-gray-100 px-12 py-5 rounded-[2rem] outline-none font-bold shadow-inner focus:bg-white transition-all text-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                   />
                   <div className="absolute right-28 top-5 opacity-20 text-xl pointer-events-none">🔍</div>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select 
                        value={categoryFilter}
                        onChange={e => { setCategoryFilter(e.target.value); setSubCategoryFilter('all'); }}
                        className="bg-gray-50 border border-gray-100 px-6 py-5 rounded-[2rem] outline-none font-bold text-xs shadow-sm cursor-pointer"
                    >
                        <option value="all">كل التصنيفات</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name}</option>)}
                    </select>
                    {categoryFilter !== 'all' && (
                        <select 
                            value={subCategoryFilter}
                            onChange={e => setSubCategoryFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-100 px-6 py-5 rounded-[2rem] outline-none font-bold text-xs shadow-sm cursor-pointer animate-in fade-in"
                        >
                            <option value="all">كل الفرعية</option>
                            {activeFilterSubCategories.map(s => <option key={s.id} value={s.id}>{lang === 'ar' ? s.name_ar : s.name}</option>)}
                        </select>
                    )}
                </div>
            </div>
            
            <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/10">
               <table className="w-full text-right text-xs">
                  <thead className="bg-white text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                     <tr>
                        <th className="px-10 py-7">الصنف</th>
                        <th className="px-10 py-7">التصنيف</th>
                        <th className="px-10 py-7 text-center">التكلفة</th>
                        <th className="px-10 py-7 text-center">البيع</th>
                        <th className="px-10 py-7 text-center">الرصيد الكلي</th>
                        <th className="px-10 py-7 text-center">رصيد الفرع الحالي ({branches.find(b=>b.id===activeBranchId)?.name_ar})</th>
                        <th className="px-10 py-7 text-center">الذكاء الاصطناعي</th>
                        <th className="px-10 py-7 text-center">الإجراء</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                     {filteredProducts.map(p => (
                       <React.Fragment key={p.id}>
                           <tr className="hover:bg-white transition-all group">
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-4">
                                    <img src={p.image} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                    <div>
                                       <p className="font-black text-slate-800">{p.name_ar}</p>
                                       <p className="text-[9px] text-gray-400 font-bold uppercase">{p.sku}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-6">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{p.category}</span>
                                    {p.subCategory && <span className="text-[9px] text-blue-500 font-bold">↳ {p.subCategory}</span>}
                                 </div>
                              </td>
                              <td className="px-10 py-6 text-center text-red-500 font-black">${p.cost}</td>
                              <td className="px-10 py-6 text-center text-blue-600 font-black">${p.price}</td>
                              <td className="px-10 py-6 text-center">
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${p.stock <= p.minStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {p.stock} {p.minorUnit || 'UN'}
                                 </span>
                              </td>
                              <td className="px-10 py-6 text-center">
                                 <span className="text-slate-800 font-black">
                                    {p.branchStocks?.[activeBranchId] || 0}
                                 </span>
                              </td>
                              <td className="px-10 py-6 text-center">
                                 <button onClick={() => handleSmartAnalysis(p)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 mx-auto">
                                    <span>🧠</span> تحليل
                                 </button>
                              </td>
                              <td className="px-10 py-6 text-center flex justify-center gap-2">
                                 <button onClick={() => openEditModal(p)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">📝</button>
                                 <button onClick={() => { setSelectedProductForLabel(p); setShowLabelModal(true); }} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm">🖨️</button>
                              </td>
                           </tr>
                           {smartAnalysis?.id === p.id && (
                              <tr>
                                 <td colSpan={8} className="px-10 pb-6 pt-0">
                                    <div className="bg-indigo-50 p-6 rounded-[30px] border border-indigo-100 text-indigo-800 text-xs font-medium leading-relaxed animate-in slide-in-from-top-2">
                                       <strong className="block mb-2 text-indigo-900">💡 تقرير Titan Oracle:</strong>
                                       {smartAnalysis.suggestion}
                                    </div>
                                 </td>
                              </tr>
                           )}
                       </React.Fragment>
                     ))}
                     {filteredProducts.length === 0 && (
                        <tr><td colSpan={8} className="py-20 text-center opacity-30 font-black uppercase text-sm">لا توجد نتائج مطابقة</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
       )}

       {/* Transfer View */}
       {currentView === 'transfer' && (
           <div className="glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40 animate-in slide-in-from-bottom-8">
               <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4">
                   <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
                   أمر تحويل داخلي بين الفروع
               </h3>
               
               <div className="grid grid-cols-2 gap-8 mb-8">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الفرع المصدر (من)</label>
                       <select 
                           className="w-full glass-dark p-4 rounded-[2rem] outline-none font-bold"
                           value={transferForm.fromBranch}
                           onChange={e => setTransferForm({...transferForm, fromBranch: e.target.value})}
                       >
                           {branches.map(b => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                       </select>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الفرع المستلم (إلى)</label>
                       <select 
                           className="w-full glass-dark p-4 rounded-[2rem] outline-none font-bold"
                           value={transferForm.toBranch}
                           onChange={e => setTransferForm({...transferForm, toBranch: e.target.value})}
                       >
                           <option value="">اختر الفرع المستلم...</option>
                           {branches.filter(b => b.id !== transferForm.fromBranch).map(b => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                       </select>
                   </div>
               </div>

               <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الصنف المراد نقله</label>
                       <select 
                           className="w-full glass-dark p-4 rounded-[2rem] outline-none font-bold"
                           value={transferForm.productId}
                           onChange={e => setTransferForm({...transferForm, productId: e.target.value})}
                       >
                           <option value="">بحث في المخزون...</option>
                           {products.map(p => (
                               <option key={p.id} value={p.id}>
                                   {p.name_ar} (المتوفر: {p.branchStocks?.[transferForm.fromBranch] || 0})
                               </option>
                           ))}
                       </select>
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الكمية</label>
                       <input 
                           type="number" 
                           className="w-full glass-dark p-4 rounded-[2rem] outline-none font-black text-center"
                           value={transferForm.quantity}
                           onChange={e => setTransferForm({...transferForm, quantity: parseInt(e.target.value) || 1})}
                       />
                   </div>
               </div>

               <button 
                   onClick={handleTransfer}
                   className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
               >
                   اعتماد التحويل وتحديث الأرصدة
               </button>
           </div>
       )}

       {/* Stocktaking View */}
       {currentView === 'stocktaking' && (
           <div className="bg-white p-10 rounded-[60px] shadow-3xl border border-gray-100 animate-in slide-in-from-bottom-8">
               <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black text-slate-800">الجرد المخزني وتسوية العجز/الزيادة</h3>
                   <button onClick={handleStocktakingSubmit} className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-orange-700 transition-all">اعتماد الجرد النهائي</button>
               </div>

               <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
                   <table className="w-full text-right text-xs">
                       <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                           <tr>
                               <th className="px-8 py-6">الصنف</th>
                               <th className="px-8 py-6 text-center">الرصيد الدفتري (System)</th>
                               <th className="px-8 py-6 text-center">العد الفعلي (Actual)</th>
                               <th className="px-8 py-6 text-center">الفارق</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                           {products.slice(0, 20).map(p => {
                               const actual = stocktakingData[p.id] !== undefined ? stocktakingData[p.id] : p.stock;
                               const diff = actual - p.stock;
                               return (
                                   <tr key={p.id} className="hover:bg-white transition-all">
                                       <td className="px-8 py-5">
                                           <p className="font-black">{p.name_ar}</p>
                                           <p className="text-[9px] text-gray-400">{p.sku}</p>
                                       </td>
                                       <td className="px-8 py-5 text-center text-blue-600">{p.stock}</td>
                                       <td className="px-8 py-5 text-center">
                                           <input 
                                               type="number" 
                                               className="w-24 bg-white border border-gray-200 p-2 rounded-xl text-center font-black outline-none focus:border-blue-400"
                                               value={stocktakingData[p.id] !== undefined ? stocktakingData[p.id] : ''}
                                               placeholder={p.stock.toString()}
                                               onChange={e => setStocktakingData({...stocktakingData, [p.id]: parseInt(e.target.value) || 0})}
                                           />
                                       </td>
                                       <td className={`px-8 py-5 text-center font-black ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-emerald-500' : 'text-gray-300'}`}>
                                           {diff > 0 ? `+${diff}` : diff}
                                       </td>
                                   </tr>
                               )
                           })}
                       </tbody>
                   </table>
               </div>
           </div>
       )}

       {/* Add/Edit Modal */}
       {showModal && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
            <div className="glass w-full max-w-6xl p-10 rounded-[60px] shadow-3xl border-white relative max-h-[95vh] overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{isEditMode ? 'تعديل بطاقة صنف' : 'تعريف صنف جديد'}</h3>
                  <div className="flex gap-4">
                     {isEditMode && <button onClick={() => handleDelete(prodForm.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-red-50 rounded-xl">حذف الصنف 🗑️</button>}
                     <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                  </div>
               </div>
               
               <div className="grid grid-cols-12 gap-8">
                  {/* Left Column: Image & Status */}
                  <div className="col-span-12 lg:col-span-3 space-y-6">
                     <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm text-center relative group cursor-pointer">
                        <div className="w-full aspect-square bg-slate-50 rounded-[30px] flex items-center justify-center mb-4 overflow-hidden relative">
                           {prodForm.image ? (
                              <img src={prodForm.image} className="w-full h-full object-cover" />
                           ) : (
                              <span className="text-4xl opacity-20">📷</span>
                           )}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-bold">تغيير الصورة</p>
                           </div>
                        </div>
                        <input type="text" placeholder="رابط الصورة..." className="w-full text-[9px] bg-gray-50 p-2 rounded-lg text-center outline-none" value={prodForm.image} onChange={e=>setProdForm({...prodForm, image: e.target.value})} />
                     </div>

                     <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-slate-800 border-b pb-2">حالة المنتج</h4>
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-[10px] font-bold text-gray-500">نشط أونلاين</span>
                           <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={prodForm.isOnline} onChange={e=>setProdForm({...prodForm, isOnline: e.target.checked})} />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-[10px] font-bold text-gray-500">تعطيل الجرد (خدمة)</span>
                           <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={prodForm.inventoryDisabled} onChange={e=>setProdForm({...prodForm, inventoryDisabled: e.target.checked})} />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-[10px] font-bold text-gray-500">تتبع الصلاحية</span>
                           <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={prodForm.expiryTracking} onChange={e=>setProdForm({...prodForm, expiryTracking: e.target.checked})} />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-[10px] font-bold text-gray-500">قابل للإرجاع</span>
                           <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={prodForm.isReturnable} onChange={e=>setProdForm({...prodForm, isReturnable: e.target.checked})} />
                        </label>
                     </div>
                  </div>

                  {/* Right Column: Details Form */}
                  <div className="col-span-12 lg:col-span-9 space-y-8">
                     
                     {/* 1. Basic Info */}
                     <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative">
                        <span className="absolute -top-3 right-8 bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">البيانات الأساسية</span>
                        <div className="grid grid-cols-2 gap-6 mt-2">
                           <div className="col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم التجاري *</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-right" value={prodForm.name_ar} onChange={e=>setProdForm({...prodForm, name_ar: e.target.value})} />
                           </div>
                           <div className="col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم العلمي / اللاتيني</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" value={prodForm.scientificName} onChange={e=>setProdForm({...prodForm, scientificName: e.target.value})} />
                           </div>
                           <div className="col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">التصنيف الرئيسي *</label>
                              <select className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-xs" value={prodForm.categoryId} onChange={e => setProdForm({...prodForm, categoryId: e.target.value, subCategoryId: ''})}>
                                 <option value="">اختر التصنيف...</option>
                                 {categories.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name}</option>)}
                              </select>
                           </div>
                           <div className="col-span-2 md:col-span-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">التصنيف الفرعي</label>
                              <select className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-xs" value={prodForm.subCategoryId} onChange={e => setProdForm({...prodForm, subCategoryId: e.target.value})} disabled={!prodForm.categoryId}>
                                 <option value="">اختر الفرعي...</option>
                                 {activeSubCategories.map(s => <option key={s.id} value={s.id}>{lang === 'ar' ? s.name_ar : s.name}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* 2. Units & Pricing */}
                     <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative">
                        <span className="absolute -top-3 right-8 bg-emerald-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">الوحدات والتسعير</span>
                        <div className="grid grid-cols-12 gap-6 mt-2">
                           <div className="col-span-6 md:col-span-4">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الوحدة الكبرى</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" placeholder="كرتون" value={prodForm.majorUnit} onChange={e=>setProdForm({...prodForm, majorUnit: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-4">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الوحدة الصغرى</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" placeholder="حبة" value={prodForm.minorUnit} onChange={e=>setProdForm({...prodForm, minorUnit: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-4">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">محتوى الكبرى</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-center" value={prodForm.unitContent} onChange={e=>setProdForm({...prodForm, unitContent: e.target.value})} />
                           </div>

                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">سعر بيع الصغرى *</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-black text-blue-600" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">سعر بيع الكبرى</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-black text-blue-800" 
                                value={prodForm.majorUnitPrice || (parseFloat(prodForm.price || '0') * parseFloat(prodForm.unitContent || '1')).toString()} 
                                onChange={e=>setProdForm({...prodForm, majorUnitPrice: e.target.value})} 
                              />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">سعر الجملة</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-indigo-600" value={prodForm.wholesalePrice} onChange={e=>setProdForm({...prodForm, wholesalePrice: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">أقصى خصم %</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-red-500" value={prodForm.maxDiscount} onChange={e=>setProdForm({...prodForm, maxDiscount: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     {/* 3. Inventory & Specs */}
                     <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative">
                        <span className="absolute -top-3 right-8 bg-orange-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">المخزون والمواصفات</span>
                        <div className="grid grid-cols-12 gap-6 mt-2">
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">SKU / الكود</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold uppercase" value={prodForm.sku} onChange={e=>setProdForm({...prodForm, sku: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الباركود</label>
                              <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" value={prodForm.barcode} onChange={e=>setProdForm({...prodForm, barcode: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">حد الطلب (Nawasq)</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-orange-500" value={prodForm.minStock} onChange={e=>setProdForm({...prodForm, minStock: e.target.value})} />
                           </div>
                           <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">حد الركود</label>
                              <input type="number" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold text-slate-500" value={prodForm.stagnantLevel} onChange={e=>setProdForm({...prodForm, stagnantLevel: e.target.value})} />
                           </div>
                           <div className="col-span-12">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المواصفات / الاستعمال</label>
                              <textarea className="w-full glass-dark p-4 rounded-2xl outline-none font-bold h-24 resize-none" value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})}></textarea>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <button onClick={() => setShowModal(false)} className="flex-1 py-5 text-gray-400 font-black uppercase text-[10px] bg-gray-50 rounded-[2rem] hover:bg-gray-100">إلغاء</button>
                        <button onClick={handleSaveProduct} className="flex-[3] py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all">{isEditMode ? 'حفظ التعديلات' : 'إضافة البطاقة للمخزون'}</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}

       {showLabelModal && selectedProductForLabel && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in zoom-in duration-300">
            <div className="bg-white w-[350px] p-8 rounded-3xl shadow-3xl text-center relative overflow-hidden">
               <h3 className="text-xl font-black text-slate-800 mb-6">معاينة الملصق (ZPL)</h3>
               <div className="border-2 border-black p-4 rounded-xl mb-6 bg-white">
                  <h4 className="font-bold text-lg">{selectedProductForLabel.name_ar}</h4>
                  {selectedProductForLabel.subCategory && <p className="text-xs text-gray-500 font-bold mb-2">{selectedProductForLabel.subCategory}</p>}
                  <div className="my-2 h-16 bg-black/10 flex items-center justify-center">
                     <span className="font-mono tracking-widest text-2xl">|||||||||||||||||</span>
                  </div>
                  <p className="font-mono text-xs">{selectedProductForLabel.sku}</p>
                  <p className="font-black text-2xl mt-2">${selectedProductForLabel.price.toFixed(2)}</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600">طباعة</button>
                  <button onClick={() => setShowLabelModal(false)} className="flex-1 py-3 bg-gray-100 text-slate-600 rounded-xl font-bold text-xs">إغلاق</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Inventory;
