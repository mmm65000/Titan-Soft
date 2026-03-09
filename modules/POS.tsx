
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { SaleItem, Sale, PaymentBreakdown, SystemConfig } from '../types';
import ScannerModal from '../components/ScannerModal';

const POS: React.FC = () => {
  const { 
    products, addSale, customers, lang, suspendedSales, 
    setSuspendedSales, offlineSales, setOfflineSales, 
    user, activeBranchId, addLog, categories, isOnline,
    addToast, syncOfflineData
  } = useApp();
  
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [paymentMode, setPaymentMode] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false); 
  
  const [splitValues, setSplitValues] = useState({ cash: '', card: '', credit: '' });
  const [config, setConfig] = useState<SystemConfig | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('titan_system_config');
    if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setPaymentMode(true);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setPaymentMode(false);
        setShowReceipt(null);
        setShowMobileCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.price * item.quantity * ((item.discountPercent || 0) / 100)), 0);
  const totalTax = cart.reduce((acc, item) => acc + ((item.price * item.quantity * (1 - (item.discountPercent || 0) / 100)) * ((item.taxPercent || 0) / 100)), 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const paidCash = parseFloat(splitValues.cash) || 0;
  const paidCard = parseFloat(splitValues.card) || 0;
  const paidCredit = parseFloat(splitValues.credit) || 0;
  const totalPaid = paidCash + paidCard + paidCredit;
  const remaining = Math.max(0, grandTotal - totalPaid);
  const change = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const filteredProducts = products.filter(p => {
      const matchesSearch = p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.barcode?.includes(searchQuery);
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const handleAddItem = (product: any, unitType: 'major' | 'minor' = 'minor') => {
    const qtyNeeded = unitType === 'major' ? (product.unitContent || 1) : 1;
    const currentStock = product.branchStocks?.[activeBranchId] ?? product.stock;
    
    if (currentStock < qtyNeeded) {
        addToast(`تنبيه: الرصيد غير كافٍ للصنف: ${product.nameAr} في هذا الفرع`, 'warning');
    }

    const price = unitType === 'major' ? (product.majorUnitPrice || product.salePrice * (product.unitContent || 1)) : product.salePrice;
    const unitName = unitType === 'major' ? product.majorUnit : product.minorUnit;

    const existingIdx = cart.findIndex(i => i.productId === product.id && i.unit === unitName);
    
    if (existingIdx > -1) {
        const newCart = [...cart];
        newCart[existingIdx].quantity += 1;
        newCart[existingIdx].total = newCart[existingIdx].price * newCart[existingIdx].quantity * (1 + (newCart[existingIdx].taxPercent || 15)/100);
        setCart(newCart);
    } else {
        const newItem: SaleItem = {
            productId: product.id,
            name: product.nameAr,
            unit: unitName || 'Piece',
            quantity: 1,
            price: price,
            discountPercent: 0,
            taxPercent: product.vatRate || 15,
            vatAmount: price * (product.vatRate || 15)/100,
            total: price * (1 + (product.vatRate || 15)/100)
        };
        setCart([newItem, ...cart]);
    }
    setSearchQuery('');
    addToast('تمت إضافة الصنف', 'info');
  };

  const updateItemQty = (index: number, delta: number) => {
      const newCart = [...cart];
      const item = newCart[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
          setCart(cart.filter((_, i) => i !== index));
      } else {
          item.quantity = newQty;
          item.total = item.price * item.quantity * (1 - (item.discountPercent || 0)/100) * (1 + (item.taxPercent || 15)/100);
          setCart(newCart);
      }
  };

  const handleCompleteSale = async () => {
      if (remaining > 0.01) return addToast('يرجى استكمال المبلغ المتبقي', 'error');

      const finalPayments: PaymentBreakdown = {
          cash: paidCash,
          card: paidCard,
          credit: paidCredit,
          transfer: 0,
          bankName: 'POS'
      };

      const sale: Sale = {
          id: `INV-${Date.now()}`,
          tenantId: user?.tenantId || 't1',
          userId: user?.id || 'u1',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          items: cart,
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
          total: grandTotal,
          totalVat: totalTax,
          totalAmount: grandTotal,
          paymentMethod: paidCard > 0 && paidCash > 0 ? 'mixed' : (paidCard > 0 ? 'card' : 'cash'),
          payments: finalPayments,
          branchId: activeBranchId,
          customerId: selectedCustomerId,
          status: isOnline ? 'completed' : 'offline',
          cashierId: user?.id,
          customerName: customers.find(c => c.id === selectedCustomerId)?.name || 'عميل نقدي',
          sellerName: user?.name
      };

      if (isOnline) {
          await addSale(sale);
          setShowReceipt(sale);
          if (config?.receipt?.autoPrint) {
              setTimeout(() => window.print(), 500);
          }
      } else {
          setOfflineSales([sale, ...offlineSales]);
          addToast('تم الحفظ محلياً (Offline Mode)', 'warning');
          setShowReceipt(sale);
          if (config?.receipt?.autoPrint) {
              setTimeout(() => window.print(), 500);
          }
      }
      
      setCart([]);
      setPaymentMode(false);
      setShowMobileCart(false);
      setSplitValues({ cash: '', card: '', credit: '' });
      setSelectedCustomerId('');
  };

  const receiptWidthClass = config?.receipt?.paperSize === 'A4' ? 'w-[210mm] min-h-[297mm] p-10' : 'w-[80mm] p-4';

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 pb-20 lg:pb-4 relative" dir="rtl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: white; color: black; padding: 0; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {showScanner && <ScannerModal onScan={(code) => { 
          const p = products.find(p=>p.barcode===code);
          if(p) { handleAddItem(p); setShowScanner(false); }
          else { addToast('المنتج غير موجود', 'error'); }
      }} onClose={() => setShowScanner(false)} lang={lang} />}

      <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
         <div className="bg-white p-3 lg:p-4 rounded-[20px] lg:rounded-[30px] shadow-sm flex items-center gap-3">
            <div className="flex-1 relative">
               <input 
                 ref={searchInputRef}
                 type="text" 
                 placeholder="بحث (F4)..." 
                 className="w-full bg-gray-100 border-none px-10 py-3 lg:py-4 rounded-[15px] lg:rounded-[20px] font-bold text-slate-800 focus:bg-white focus:ring-2 lg:focus:ring-4 ring-blue-100 transition-all outline-none text-xs lg:text-sm"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
               <span className="absolute right-4 top-3.5 lg:top-4 text-gray-400 text-lg">🔍</span>
            </div>
            <button onClick={() => setShowScanner(true)} className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-900 text-white rounded-[15px] lg:rounded-[20px] flex items-center justify-center text-xl shadow-lg hover:scale-105 transition-transform">📷</button>
         </div>

         <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button 
                onClick={() => setSelectedCategory('all')} 
                className={`px-5 lg:px-8 py-3 lg:py-4 rounded-[15px] lg:rounded-[20px] font-black text-[10px] lg:text-xs transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
            >
                الكل
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)} 
                    className={`px-5 lg:px-8 py-3 lg:py-4 rounded-[15px] lg:rounded-[20px] font-black text-[10px] lg:text-xs transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
                >
                    {lang === 'ar' ? cat.name_ar : cat.name}
                </button>
            ))}
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
               {filteredProducts.map(p => (
                  <div key={p.id} 
                       onClick={() => handleAddItem(p, 'minor')}
                       className="bg-white p-3 lg:p-4 rounded-[20px] lg:rounded-[30px] border border-transparent hover:border-blue-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                     <div className="aspect-square bg-gray-50 rounded-[15px] lg:rounded-[20px] mb-2 relative overflow-hidden w-full">
                        <img src={p.image || 'https://placehold.co/200'} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-black shadow-sm">${p.salePrice}</div>
                     </div>
                     <div>
                        <h4 className="font-bold text-[10px] lg:text-xs text-slate-800 line-clamp-1">{p.nameAr}</h4>
                        <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold">{p.sku}</p>
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <span className={`text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded ${p.stock > 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{p.stock} {p.minorUnit}</span>
                        {p.majorUnit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAddItem(p, 'major'); }}
                                className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[8px] lg:text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                                {p.majorUnit}
                            </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div 
        className={`
            fixed inset-0 z-[100] lg:static lg:z-auto bg-slate-900/50 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none
            transition-all duration-300 ${showMobileCart ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}
        `}
        onClick={() => setShowMobileCart(false)}
      >
        <div 
            className={`
                absolute bottom-0 left-0 right-0 h-[85vh] lg:h-full lg:static lg:w-[400px] 
                bg-white rounded-t-[40px] lg:rounded-[40px] shadow-2xl lg:shadow-2xl 
                flex flex-col overflow-hidden border border-gray-100 transform transition-transform duration-300
                ${showMobileCart ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            `}
            onClick={e => e.stopPropagation()}
        >
            <div className="lg:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setShowMobileCart(false)}>
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-5 lg:p-6 bg-slate-50 border-b border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                <h3 className="font-black text-lg lg:text-xl text-slate-800">الفاتورة الحالية</h3>
                <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-bold cursor-pointer hover:bg-red-100" onClick={() => setCart([])}>إفراغ 🗑️</span>
                </div>
                <select 
                    className="w-full bg-white border-none p-3 rounded-xl font-bold text-xs outline-none shadow-sm"
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                >
                    <option value="">عميل نقدي (عام)</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => updateItemQty(i, 1)} className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-xs hover:bg-emerald-100">+</button>
                            <span className="font-black text-sm">{item.quantity}</span>
                            <button onClick={() => updateItemQty(i, -1)} className="w-6 h-6 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-xs hover:bg-red-100">-</button>
                        </div>
                        <div>
                            <p className="font-bold text-xs text-slate-800 line-clamp-1 w-28 lg:w-32">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{item.unit} • ${item.price}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-sm text-slate-900">${item.total.toFixed(2)}</p>
                        <p className="text-[9px] text-blue-500 font-bold">Tax: {item.taxPercent}%</p>
                    </div>
                </div>
                ))}
                {cart.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="text-6xl mb-4">🛒</div>
                        <p className="font-black uppercase tracking-widest">ابدأ البيع</p>
                    </div>
                )}
            </div>

            <div className="p-5 lg:p-6 bg-slate-900 text-white rounded-t-[30px] lg:rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="space-y-1 lg:space-y-2 mb-4 lg:mb-6">
                    <div className="flex justify-between text-xs font-bold opacity-60">
                        <span>المجموع</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-emerald-400">
                        <span>الضريبة (15%)</span>
                        <span>+${totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl lg:text-3xl font-black pt-3 lg:pt-4 border-t border-white/10">
                        <span>الإجمالي</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => { if(cart.length > 0) setPaymentMode(true); }}
                    className="w-full py-4 lg:py-5 bg-blue-600 rounded-[2rem] font-black text-xs lg:text-sm uppercase tracking-[0.2em] hover:bg-blue-500 active:scale-95 transition-all shadow-xl"
                >
                    دفع (F9) ⚡
                </button>
            </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-24 left-4 right-4 z-40">
          <button 
            onClick={() => setShowMobileCart(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-full shadow-2xl flex justify-between items-center px-6 animate-in slide-in-from-bottom-10"
          >
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-black text-xs">{cart.reduce((a,b)=>a+b.quantity,0)}</div>
                  <span className="font-black text-sm">عرض السلة</span>
              </div>
              <span className="font-black text-lg">${grandTotal.toFixed(2)}</span>
          </button>
      </div>

      {paymentMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in zoom-in duration-200">
              <div className="bg-white w-full max-w-2xl p-6 lg:p-10 rounded-[40px] lg:rounded-[50px] shadow-3xl relative overflow-y-auto max-h-[90vh]">
                  <h3 className="text-2xl lg:text-3xl font-black text-center mb-6 lg:mb-8 text-slate-800">الدفع المتعدد</h3>
                  
                  <div className="text-center mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-black text-gray-400 uppercase">المبلغ المطلوب</p>
                          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">${grandTotal.toFixed(2)}</h2>
                      </div>
                      {remaining > 0.01 ? (
                          <div className="flex justify-between items-center text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold uppercase">المتبقي</span>
                              <span className="font-black text-lg lg:text-xl">${remaining.toFixed(2)}</span>
                          </div>
                      ) : (
                          <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold uppercase">الباقي للعميل</span>
                              <span className="font-black text-lg lg:text-xl">${change.toFixed(2)}</span>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">نقداً (Cash)</label>
                          <input 
                            type="number" 
                            className="w-full glass-dark p-4 lg:p-5 rounded-[2rem] font-black text-xl lg:text-2xl outline-none border focus:border-blue-500 transition-all text-center"
                            placeholder="0.00"
                            value={splitValues.cash}
                            onChange={e => setSplitValues({...splitValues, cash: e.target.value})}
                            autoFocus
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">شبكة (Card)</label>
                          <input 
                            type="number" 
                            className="w-full glass-dark p-4 lg:p-5 rounded-[2rem] font-black text-xl lg:text-2xl outline-none border focus:border-blue-500 transition-all text-center text-blue-600"
                            placeholder="0.00"
                            value={splitValues.card}
                            onChange={e => setSplitValues({...splitValues, card: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="flex gap-2 lg:gap-4 justify-center mb-8">
                      <button onClick={()=>setSplitValues({cash: grandTotal.toString(), card: '', credit: ''})} className="px-4 lg:px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] lg:text-xs hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap">كامل نقداً</button>
                      <button onClick={()=>setSplitValues({card: grandTotal.toString(), cash: '', credit: ''})} className="px-4 lg:px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] lg:text-xs hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap">كامل شبكة</button>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setPaymentMode(false)} className="flex-1 py-4 lg:py-5 text-gray-400 font-black uppercase text-xs hover:text-red-500 bg-gray-50 rounded-[2rem]">إلغاء</button>
                      <button 
                        onClick={handleCompleteSale}
                        disabled={remaining > 0.01} 
                        className="flex-[2] py-4 lg:py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {remaining > 0.01 ? `متبقي $${remaining.toFixed(2)}` : 'إتمام ✓'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showReceipt && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className={`bg-white shadow-2xl text-center relative overflow-hidden font-mono text-black print-section rounded-none mx-auto my-auto ${receiptWidthClass}`}>
                <div className="mb-4 border-b border-black pb-4">
                    {config?.receipt?.showLogo && <div className="w-16 h-16 bg-black mx-auto mb-4 rounded flex items-center justify-center text-white font-bold">LOGO</div>}
                    <h2 className="text-xl font-bold mb-1">{config?.tax?.companyName || user?.businessName || 'TITAN STORE'}</h2>
                    {config?.receipt?.header && <p className="text-[10px] mb-2 whitespace-pre-wrap">{config.receipt.header}</p>}
                    <p className="text-[10px]">VAT: {config?.tax?.vatNumber || '3000xxxxxx'}</p>
                    <p className="text-[10px] mt-1">{new Date(showReceipt.date || showReceipt.createdAt).toLocaleString()}</p>
                    <p className="text-[10px]">INV: #{showReceipt.id.slice(-6)}</p>
                    <p className="text-[10px]">Cashier: {showReceipt.sellerName || user?.name}</p>
                </div>
                <div className="space-y-1 text-[10px] mb-4 text-right">
                    {showReceipt.items.map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-dashed border-gray-300 py-1">
                            <span>{item.quantity} x {item.name}</span>
                            <span className="font-bold">{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-black pt-2 mb-4">
                    <div className="flex justify-between text-sm font-bold">
                        <span>TOTAL</span>
                        <span>{showReceipt.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1">
                        <span>VAT (15%)</span>
                        <span>{(showReceipt.totalVat).toFixed(2)}</span>
                    </div>
                </div>
                {config?.receipt?.footer && <p className="text-[10px] font-bold mb-4 whitespace-pre-wrap">{config.receipt.footer}</p>}
                
                {config?.receipt?.showQr !== false && (
                    <div className="flex justify-center mb-4">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/orders/' + showReceipt.id)}`} 
                            className="w-24 h-24 mx-auto"
                            alt="Order QR Code"
                        />
                    </div>
                )}
                
                <div className="flex gap-2 no-print mt-4">
                    <button onClick={() => window.print()} className="flex-1 py-2 bg-black text-white font-bold text-xs rounded hover:bg-gray-800">PRINT</button>
                    <button onClick={() => setShowReceipt(null)} className="flex-1 py-2 bg-gray-200 text-black font-bold text-xs rounded hover:bg-gray-300">CLOSE</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default POS;
