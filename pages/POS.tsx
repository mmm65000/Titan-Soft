
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, Plus, Package } from 'lucide-react';

const POS = () => {
  const { products, processSale, user, tenant } = useApp();
  const [cart, setCart] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState(false);

  // Fix: Standardize nameAr mapping
  const filtered = products.filter(p => p.nameAr.includes(query) || p.barcode.includes(query));

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.salePrice * item.qty), 0);
  const totalVat = total * 0.15;

  const handleComplete = async () => {
    const saleId = `INV-${Date.now()}`;
    // Fix: Standardize Sale type properties
    const sale = {
      id: saleId,
      tenantId: tenant?.id || 't1',
      userId: user?.id || 'u1',
      items: cart.map(i => ({ productId: i.id, name: i.nameAr, quantity: i.qty, price: i.salePrice, vatAmount: i.salePrice * 0.15, total: i.salePrice * 1.15 * i.qty })),
      subtotal: total,
      totalVat: totalVat,
      totalAmount: total + totalVat,
      paymentMethod: 'cash' as const,
      status: 'completed' as const,
      createdAt: new Date().toISOString()
    };
    
    await processSale(sale);
    setCart([]);
    setPaymentMode(false);
    alert('تمت العملية بنجاح! جاري إصدار الفاتورة...');
  };

  return (
    <div className="flex gap-8 h-full" dir="rtl">
       {/* Left: Products Grid */}
       <div className="flex-1 flex flex-col gap-6">
          <div className="relative">
             <input 
               type="text" 
               placeholder="ابحث عن منتج بالاسم أو الباركود..."
               className="w-full bg-white/5 border border-white/10 px-14 py-5 rounded-3xl text-white font-bold focus:ring-4 ring-blue-500/20 transition-all outline-none"
               value={query}
               onChange={e => setQuery(e.target.value)}
             />
             <Search className="absolute right-5 top-5 text-slate-500" size={24} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pr-2 custom-scrollbar">
             {filtered.map(p => (
                <motion.div 
                  key={p.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(p)}
                  className="glass-card p-6 rounded-[2.5rem] cursor-pointer group flex flex-col justify-between"
                >
                   <div className="aspect-square bg-slate-800 rounded-3xl mb-4 overflow-hidden shadow-inner">
                      <img src={`https://picsum.photos/seed/${p.id}/200`} className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <div>
                      <h4 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors">{p.nameAr}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{p.sku}</p>
                      <div className="flex justify-between items-center mt-4">
                         <span className="text-xl font-black text-white">${p.salePrice}</span>
                         <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} />
                         </div>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>

       {/* Right: Cart and Checkout */}
       <div className="w-96 glass-panel rounded-[3rem] border border-white/5 flex flex-col overflow-hidden shadow-3xl">
          <div className="p-8 border-b border-white/5 bg-white/5">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                   <ShoppingCart size={20} className="text-blue-500" />
                   سلة المشتريات
                </h3>
                <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{cart.length} Items</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
             {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-500 text-center px-10">
                   <Package size={64} strokeWidth={1} />
                   <p className="font-black text-sm uppercase tracking-widest mt-4">ابدأ بإضافة منتجات للسلة</p>
                </div>
             )}
             {cart.map((item, i) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={i} 
                  className="flex items-center justify-between p-4 glass-card rounded-2xl group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 font-black">
                         {item.qty}
                      </div>
                      <div>
                         <p className="text-xs font-black text-white truncate w-32">{item.nameAr}</p>
                         <p className="text-[10px] text-slate-500 font-bold">${item.salePrice} / unit</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-white">${(item.salePrice * item.qty).toFixed(2)}</span>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                         <Trash2 size={12} />
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>

          <div className="p-8 bg-slate-900 border-t border-white/5 space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                   <span>المجموع الفرعي</span>
                   <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-blue-400">
                   <span>الضريبة (15%)</span>
                   <span>+${totalVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-3xl font-black text-white pt-4 border-t border-white/5">
                   <span>الإجمالي</span>
                   <span className="text-blue-500">${(total + totalVat).toFixed(2)}</span>
                </div>
             </div>

             <button 
                disabled={cart.length === 0}
                onClick={() => setPaymentMode(true)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-[2rem] font-black text-white tracking-widest text-sm shadow-xl shadow-blue-500/10 transition-all flex items-center justify-center gap-3"
             >
                إتمام البيع <Banknote size={18} />
             </button>
          </div>
       </div>

       {/* Payment Modal */}
       <AnimatePresence>
          {paymentMode && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
             >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-lg glass-panel p-12 rounded-[4rem] text-center relative"
                >
                   <h3 className="text-3xl font-black text-white mb-4">وسيلة الدفع</h3>
                   <p className="text-slate-400 font-bold mb-12">يرجى تحديد طريقة استلام المبلغ</p>

                   <div className="grid grid-cols-2 gap-6 mb-12">
                      <button className="flex flex-col items-center gap-4 p-8 glass-card rounded-[2.5rem] hover:bg-blue-600 transition-all group">
                         <Banknote size={48} className="text-blue-400 group-hover:text-white" />
                         <span className="font-black text-xs uppercase tracking-widest group-hover:text-white">نقدي</span>
                      </button>
                      <button className="flex flex-col items-center gap-4 p-8 glass-card rounded-[2.5rem] hover:bg-purple-600 transition-all group">
                         <CreditCard size={48} className="text-purple-400 group-hover:text-white" />
                         <span className="font-black text-xs uppercase tracking-widest group-hover:text-white">شبكة</span>
                      </button>
                   </div>

                   <div className="flex gap-4">
                      <button onClick={() => setPaymentMode(false)} className="flex-1 py-5 glass-card rounded-3xl font-black text-slate-400 text-xs">إلغاء</button>
                      <button onClick={handleComplete} className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black text-xs shadow-xl shadow-emerald-500/20">تأكيد العملية ✓</button>
                   </div>
                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

export default POS;
