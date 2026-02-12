
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { SaleItem, Sale, PaymentBreakdown } from '../types';
import ScannerModal from '../components/ScannerModal';

const POS: React.FC = () => {
  const { 
    products, addSale, customers, lang, suspendedSales, 
    setSuspendedSales, offlineSales, setOfflineSales, 
    user, activeBranchId, addLog, categories, isOnline,
    addToast
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'sales' | 'suspended' | 'offline'>('sales');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [paymentMode, setPaymentMode] = useState(false); // Toggle Payment Modal
  
  // Split Payment State
  const [splitValues, setSplitValues] = useState({ cash: '', card: '', credit: '' });
  const [receiptConfig, setReceiptConfig] = useState(JSON.parse(localStorage.getItem('titan_receipt_config') || '{"header": "", "footer": "Thank you for shopping!"}'));

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.price * item.quantity * (item.discountPercent / 100)), 0);
  const totalTax = cart.reduce((acc, item) => acc + ((item.price * item.quantity * (1 - item.discountPercent / 100)) * (item.taxPercent / 100)), 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  // Split Payment Logic
  const paidCash = parseFloat(splitValues.cash) || 0;
  const paidCard = parseFloat(splitValues.card) || 0;
  const paidCredit = parseFloat(splitValues.credit) || 0;
  const totalPaid = paidCash + paidCard + paidCredit;
  const remaining = grandTotal - totalPaid;
  const change = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  // Filter Logic
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.barcode?.includes(searchQuery);
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const handleAddItem = (product: any, unitType: 'major' | 'minor' = 'minor') => {
    // Check Stock
    const qtyNeeded = unitType === 'major' ? (product.unitContent || 1) : 1;
    if (product.stock < qtyNeeded) {
        addToast(`الرصيد غير كافٍ للصنف: ${product.name_ar}`, 'error');
        return;
    }

    const price = unitType === 'major' ? (product.majorUnitPrice || product.price * product.unitContent) : product.price;
    const unitName = unitType === 'major' ? product.majorUnit : product.minorUnit;

    const existingIdx = cart.findIndex(i => i.productId === product.id && i.unit === unitName);
    
    if (existingIdx > -1) {
        const newCart = [...cart];
        newCart[existingIdx].quantity += 1;
        newCart[existingIdx].total = newCart[existingIdx].price * newCart[existingIdx].quantity * (1 + newCart[existingIdx].taxPercent/100);
        setCart(newCart);
    } else {
        const newItem: SaleItem = {
            productId: product.id,
            name: product.name_ar,
            unit: unitName || 'Piece',
            quantity: 1,
            price: price,
            discountPercent: 0,
            taxPercent: 15, // Default VAT
            total: price * 1.15
        };
        setCart([newItem, ...cart]);
    }
    setSearchQuery('');
  };

  const updateItemQty = (index: number, delta: number) => {
      const newCart = [...cart];
      const item = newCart[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
          setCart(cart.filter((_, i) => i !== index));
      } else {
          item.quantity = newQty;
          item.total = item.price * item.quantity * (1 - item.discountPercent/100) * (1 + item.taxPercent/100);
          setCart(newCart);
      }
  };

  const handleCompleteSale = () => {
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
          date: new Date().toISOString(),
          items: cart,
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
          total: grandTotal,
          paymentMethod: paidCard > 0 && paidCash > 0 ? 'mixed' : (paidCard > 0 ? 'card' : 'cash'),
          payments: finalPayments,
          branchId: activeBranchId,
          customerId: selectedCustomerId,
          status: isOnline ? 'completed' : 'offline',
          cashierId: user?.id,
          customerName: customers.find(c => c.id === selectedCustomerId)?.name,
          sellerName: user?.name
      };

      if (isOnline) {
          addSale(sale);
          setShowReceipt(sale);
      } else {
          setOfflineSales([sale, ...offlineSales]);
          addToast('تم الحفظ محلياً (Offline Mode)', 'warning');
      }
      
      setCart([]);
      setPaymentMode(false);
      setSplitValues({ cash: '', card: '', credit: '' });
      setSelectedCustomerId('');
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 pb-4" dir="rtl">
      {showScanner && <ScannerModal onScan={(code) => { handleAddItem(products.find(p=>p.barcode===code)||products[0]); setShowScanner(false); }} onClose={() => setShowScanner(false)} lang={lang} />}

      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col gap-6 h-full">
         {/* Top Bar */}
         <div className="bg-white p-4 rounded-[30px] shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
               <input 
                 ref={searchInputRef}
                 type="text" 
                 placeholder="بحث سريع (F4)..." 
                 className="w-full bg-gray-100 border-none px-12 py-4 rounded-[20px] font-bold text-slate-800 focus:bg-white focus:ring-4 ring-blue-100 transition-all outline-none"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 autoFocus
               />
               <span className="absolute right-5 top-4 text-gray-400 text-xl">🔍</span>
            </div>
            <button onClick={() => setShowScanner(true)} className="w-14 h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-transform">📷</button>
         </div>

         {/* Categories */}
         <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button 
                onClick={() => setSelectedCategory('all')} 
                className={`px-8 py-4 rounded-[20px] font-black text-xs transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
            >
                الكل
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)} 
                    className={`px-8 py-4 rounded-[20px] font-black text-xs transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
                >
                    {lang === 'ar' ? cat.name_ar : cat.name}
                </button>
            ))}
         </div>

         {/* Grid */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
               {filteredProducts.map(p => (
                  <div key={p.id} 
                       onClick={() => handleAddItem(p, 'minor')}
                       className="bg-white p-4 rounded-[30px] border border-transparent hover:border-blue-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                  >
                     <div className="aspect-square bg-gray-50 rounded-[20px] mb-3 relative overflow-hidden">
                        <img src={p.image} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">${p.price}</div>
                     </div>
                     <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{p.name_ar}</h4>
                     <div className="flex justify-between items-center mt-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${p.stock > 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{p.stock} مخزون</span>
                        {p.majorUnit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAddItem(p, 'major'); }}
                                className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-colors"
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

      {/* RIGHT: Cart Panel */}
      <div className="w-[400px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
         {/* Cart Header */}
         <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <h3 className="font-black text-xl text-slate-800">الفاتورة الحالية</h3>
               <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer hover:bg-red-100" onClick={() => setCart([])}>إفراغ 🗑️</span>
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

         {/* Items List */}
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
                        <p className="font-bold text-xs text-slate-800 line-clamp-1 w-32">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.unit} • ${item.price}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-black text-sm text-slate-900">${item.total.toFixed(2)}</p>
                     <p className="text-[9px] text-blue-500 font-bold">Tax: 15%</p>
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

         {/* Totals & Actions */}
         <div className="p-6 bg-slate-900 text-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="space-y-2 mb-6">
               <div className="flex justify-between text-xs font-bold opacity-60">
                  <span>المجموع</span>
                  <span>${subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-emerald-400">
                  <span>الضريبة (15%)</span>
                  <span>+${totalTax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-3xl font-black pt-4 border-t border-white/10">
                  <span>الإجمالي</span>
                  <span>${grandTotal.toFixed(2)}</span>
               </div>
            </div>
            
            <button 
                onClick={() => { if(cart.length > 0) setPaymentMode(true); }}
                className="w-full py-5 bg-blue-600 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
                دفع (F9) ⚡
            </button>
         </div>
      </div>

      {/* Split Payment Modal */}
      {paymentMode && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in zoom-in duration-200">
              <div className="bg-white w-full max-w-2xl p-10 rounded-[50px] shadow-3xl relative">
                  <h3 className="text-3xl font-black text-center mb-8 text-slate-800">الدفع المتعدد (Split Payment)</h3>
                  
                  <div className="text-center mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-black text-gray-400 uppercase">المبلغ المطلوب</p>
                          <h2 className="text-4xl font-black text-slate-900">${grandTotal.toFixed(2)}</h2>
                      </div>
                      {remaining > 0 ? (
                          <div className="flex justify-between items-center text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold uppercase">المتبقي</span>
                              <span className="font-black text-xl">${remaining.toFixed(2)}</span>
                          </div>
                      ) : (
                          <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                              <span className="text-[10px] font-bold uppercase">الباقي للعميل</span>
                              <span className="font-black text-xl">${change.toFixed(2)}</span>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                      <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">نقداً (Cash)</label>
                          <input 
                            type="number" 
                            className="w-full glass-dark p-5 rounded-[2rem] font-black text-2xl outline-none border focus:border-blue-500 transition-all text-center"
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
                            className="w-full glass-dark p-5 rounded-[2rem] font-black text-2xl outline-none border focus:border-blue-500 transition-all text-center text-blue-600"
                            placeholder="0.00"
                            value={splitValues.card}
                            onChange={e => setSplitValues({...splitValues, card: e.target.value})}
                          />
                      </div>
                  </div>

                  {/* Fast Action */}
                  <div className="flex gap-4 justify-center mb-10">
                      <button onClick={()=>setSplitValues({...splitValues, cash: grandTotal.toString()})} className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all">كامل المبلغ نقداً</button>
                      <button onClick={()=>setSplitValues({...splitValues, card: grandTotal.toString()})} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all">كامل المبلغ شبكة</button>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setPaymentMode(false)} className="flex-1 py-5 text-gray-400 font-black uppercase text-xs hover:text-red-500 bg-gray-50 rounded-[2rem]">إلغاء (ESC)</button>
                      <button 
                        onClick={handleCompleteSale}
                        disabled={remaining > 0.01} 
                        className="flex-[2] py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {remaining > 0.01 ? `متبقي $${remaining.toFixed(2)}` : 'إتمام العملية ✓'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-[380px] p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden font-mono print-section">
                <div className="mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                    <h2 className="text-xl font-black mb-1">{user?.businessName || 'TITAN STORE'}</h2>
                    {receiptConfig.header && <p className="text-xs text-gray-600 mb-2">{receiptConfig.header}</p>}
                    <p className="text-xs text-gray-500">Tax Invoice / فاتورة ضريبية</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(showReceipt.date).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">INV: #{showReceipt.id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">Cashier: {showReceipt.sellerName || user?.name}</p>
                </div>
                <div className="space-y-2 text-xs mb-6 text-right">
                    {showReceipt.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span className="font-bold">{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-6">
                    <div className="flex justify-between text-lg font-black">
                        <span>TOTAL</span>
                        <span>{showReceipt.total.toFixed(2)} SAR</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Includes VAT 15%</span>
                        <span>{(showReceipt.tax).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        {showReceipt.payments.cash > 0 && <div className="flex justify-between text-xs"><span>Paid Cash:</span><span>{showReceipt.payments.cash.toFixed(2)}</span></div>}
                        {showReceipt.payments.card > 0 && <div className="flex justify-between text-xs"><span>Paid Card:</span><span>{showReceipt.payments.card.toFixed(2)}</span></div>}
                        {showReceipt.payments.credit > 0 && <div className="flex justify-between text-xs"><span>On Credit:</span><span>{showReceipt.payments.credit.toFixed(2)}</span></div>}
                    </div>
                </div>
                {receiptConfig.footer && <p className="text-[10px] text-gray-500 font-bold mb-4">{receiptConfig.footer}</p>}
                <div className="flex justify-center mb-4">
                    {/* Mock QR Code */}
                    <div className="w-24 h-24 bg-gray-900 flex items-center justify-center text-white text-[8px]">QR CODE</div>
                </div>
                <div className="flex gap-2 no-print">
                    <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs">Print 🖨️</button>
                    <button onClick={() => setShowReceipt(null)} className="flex-1 py-3 bg-gray-100 text-slate-600 rounded-xl font-bold text-xs">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default POS;
