
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Coupon } from '../types';

const Ecommerce: React.FC = () => {
  const { products, sales, lang, onlineOrders, coupons, addCoupon, updateOnlineOrderStatus, fieldAgents, user } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'coupons' | 'shipping' | 'design'>('dashboard');
  
  // Store Design State
  const [storeDesign, setStoreDesign] = useState({
      primaryColor: '#4f46e5',
      logo: user?.avatar || 'https://via.placeholder.com/150',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      layout: 'grid',
      font: 'Cairo'
  });

  // Dynamic Calculations based on onlineOrders
  const onlineSalesTotal = onlineOrders.filter(o => o.status !== 'cancelled').reduce((acc, order) => acc + order.total, 0);
  const activeBasketsCount = onlineOrders.filter(o => o.status === 'pending').length;
  const uniqueCustomers = new Set(onlineOrders.map(o => o.customerName)).size;

  const handleAddCoupon = () => {
      const code = prompt("Enter Coupon Code:");
      if(code) {
          const c: Coupon = {
              id: `C-${Date.now()}`,
              code: code.toUpperCase(),
              type: 'نسبة مئوية',
              value: '10%',
              uses: 0,
              status: 'active'
          };
          addCoupon(c);
      }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter">إدارة المتجر السيادي</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[11px]">Titan Direct-to-Consumer (D2C) Sovereign Control Panel</p>
        </div>
        <div className="flex glass rounded-[3rem] p-2 shadow-2xl border-white/50 bg-white/40 backdrop-blur-3xl overflow-x-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'الذكاء التجاري' },
            { id: 'orders', label: 'الطلبات' },
            { id: 'design', label: 'تصميم الواجهة 🎨' },
            { id: 'coupons', label: 'أكواد الخصم' },
            { id: 'shipping', label: 'لوجستيات الشحن' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-8 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-12 animate-in slide-in-from-right-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                { label: 'إيرادات أونلاين', value: `$${onlineSalesTotal.toLocaleString()}`, icon: '⚡', color: 'blue' },
                { label: 'سلال نشطة (Pending)', value: activeBasketsCount.toString(), icon: '🛒', color: 'orange' },
                { label: 'معدل التحويل', value: '3.2%', icon: '📉', color: 'emerald' },
                { label: 'عملاء فريدين', value: uniqueCustomers.toString(), icon: '👥', color: 'indigo' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-10 rounded-[50px] shadow-3xl border border-gray-50 flex items-center gap-8 group hover:bg-slate-900 transition-all duration-700">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner group-hover:bg-white/10 group-hover:scale-110 transition-all">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 group-hover:text-gray-500 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-4xl font-black text-slate-800 group-hover:text-white mt-1 tracking-tighter">{stat.value}</h4>
                  </div>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 bg-white p-14 rounded-[70px] shadow-3xl border border-gray-100 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-[0_0_20px_#4f46e5]"></div>
                 <h3 className="text-2xl font-black mb-12 flex items-center gap-5"><div className="w-3 h-10 bg-indigo-600 rounded-full"></div> كتالوج المتجر المنشور (Public Catalog)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {products.filter(p=>p.isOnline).slice(0, 4).map(p => (
                       <div key={p.id} className="p-8 bg-slate-50/50 rounded-[3rem] border border-gray-100 flex gap-8 items-center hover:bg-white transition-all shadow-md group">
                          <img src={p.image} className="w-28 h-28 rounded-[2rem] object-cover shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                          <div className="flex-1">
                             <h4 className="font-black text-lg text-slate-800 leading-tight">{p.name_ar}</h4>
                             <p className="text-indigo-600 font-black text-lg mt-2">${p.price}</p>
                             <div className="mt-4 flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${p.stock > 0 ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{p.stock > 0 ? 'Available' : 'Out of Stock'}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                    {products.filter(p=>p.isOnline).length === 0 && (
                        <div className="col-span-2 text-center py-20 opacity-30 font-black uppercase text-xl">لا توجد منتجات منشورة على المتجر حالياً</div>
                    )}
                 </div>
              </div>
              
              <div className="bg-slate-900 p-14 rounded-[70px] shadow-3xl text-white flex flex-col justify-between relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-[100px]"></div>
                 <div>
                    <h3 className="text-2xl font-black mb-10 tracking-tighter">ذكاء التجارة (Oracle BI)</h3>
                    <div className="space-y-8">
                       <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 italic text-base leading-relaxed text-indigo-100 font-medium">
                          "متوسط السلة في المتجر أقل من نقاط البيع بـ 15%. ننصح بإطلاق حملة شحن مجاني للطلبات فوق $200."
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="opacity-40">قوة البراند</span>
                             <span className="text-emerald-400">96.4%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{width: '96%'}}></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <button className="w-full py-6 bg-indigo-600 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-500 transition-all mt-12 border border-white/10">تحليل مسار العملاء الكامل</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'design' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-500">
              <div className="lg:col-span-1 bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 h-fit">
                  <h3 className="text-xl font-black mb-8 text-slate-800">إعدادات الهوية البصرية</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">اللون الأساسي</label>
                          <div className="flex gap-2">
                              {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                                  <button 
                                    key={c} 
                                    onClick={() => setStoreDesign({...storeDesign, primaryColor: c})}
                                    className={`w-8 h-8 rounded-full border-2 ${storeDesign.primaryColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                  ></button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">صورة البانر</label>
                          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 relative group cursor-pointer border border-gray-200">
                              <img src={storeDesign.banner} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-white text-xs font-bold">تغيير</span>
                              </div>
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">نمط العرض</label>
                          <div className="flex bg-gray-100 p-1 rounded-xl">
                              <button onClick={()=>setStoreDesign({...storeDesign, layout: 'grid'})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${storeDesign.layout === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>شبكة</button>
                              <button onClick={()=>setStoreDesign({...storeDesign, layout: 'list'})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${storeDesign.layout === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>قائمة</button>
                          </div>
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl mt-4">حفظ ونشر التعديلات</button>
                  </div>
              </div>

              <div className="lg:col-span-2 flex justify-center">
                  <div className="w-[320px] h-[650px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative border-8 border-slate-800">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
                          {/* Live Preview Header */}
                          <div className="h-40 bg-gray-200 relative">
                              <img src={storeDesign.banner} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-4 right-4 text-white">
                                  <h4 className="font-bold text-lg">{user?.businessName || 'اسم المتجر'}</h4>
                                  <p className="text-[10px] opacity-80">أفضل المنتجات المختارة لك</p>
                              </div>
                          </div>
                          
                          {/* Categories Chip */}
                          <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
                              {['الكل', 'إلكترونيات', 'ملابس', 'عروض'].map(c => (
                                  <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold whitespace-nowrap text-slate-600">{c}</span>
                              ))}
                          </div>

                          {/* Products Grid */}
                          <div className="flex-1 bg-gray-50 overflow-y-auto p-4 custom-scrollbar">
                              <div className={`grid gap-3 ${storeDesign.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                  {products.slice(0, 4).map(p => (
                                      <div key={p.id} className={`bg-white p-3 rounded-xl shadow-sm ${storeDesign.layout === 'list' ? 'flex gap-3' : ''}`}>
                                          <div className={`${storeDesign.layout === 'list' ? 'w-16 h-16' : 'aspect-square mb-2'} bg-gray-100 rounded-lg overflow-hidden`}>
                                              <img src={p.image} className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                              <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{p.name_ar}</p>
                                              <p className="text-[9px] font-black mt-1" style={{ color: storeDesign.primaryColor }}>${p.price}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Bottom Nav */}
                          <div className="h-14 bg-white border-t flex justify-around items-center px-4">
                              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: storeDesign.primaryColor }}>🛍️</div>
                              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'orders' && (
          <div className="bg-white p-14 rounded-[70px] shadow-3xl border border-gray-100 animate-in slide-in-from-left-8">
              <h3 className="text-3xl font-black mb-10 text-slate-800">سجل الطلبات الواردة</h3>
              <div className="space-y-6">
                  {onlineOrders.map(order => (
                      <div key={order.id} className="p-8 bg-slate-50/50 rounded-[3rem] border border-gray-100 flex justify-between items-center hover:bg-white transition-all shadow-sm">
                          <div>
                              <div className="flex items-center gap-3">
                                  <h4 className="text-xl font-black text-slate-900">#{order.id}</h4>
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                              </div>
                              <p className="text-gray-400 font-bold text-xs mt-2">{order.customerName} • {new Date(order.date).toLocaleString()}</p>
                              <div className="mt-3 flex gap-2">
                                {order.items.map((item, i) => (
                                    <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                                        {item.quantity}x {item.name}
                                    </span>
                                ))}
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-2xl font-black text-slate-800">${order.total}</p>
                              {order.status === 'pending' && (
                                  <button onClick={() => updateOnlineOrderStatus(order.id, 'processing')} className="mt-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">قبول وتجهيز</button>
                              )}
                          </div>
                      </div>
                  ))}
                  {onlineOrders.length === 0 && (
                      <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest">لا توجد طلبات جديدة</div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-white p-14 rounded-[70px] shadow-3xl border border-gray-100 animate-in slide-in-from-bottom-10">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">نظام القسائم والولاء الذكي</h3>
              <button onClick={handleAddCoupon} className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">إصدار كود خصم جديد +</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {coupons.map((c, i) => (
                <div key={i} className={`p-10 rounded-[50px] border-2 border-dashed relative overflow-hidden transition-all duration-500 ${c.status === 'active' ? 'border-indigo-200 bg-white hover:border-indigo-500 shadow-2xl hover:-translate-y-2' : 'border-gray-100 opacity-40 grayscale'}`}>
                   <div className="flex justify-between items-start mb-8">
                      <span className={`bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100`}>{c.code}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase">{c.status}</span>
                   </div>
                   <h4 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{c.value}</h4>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">{c.type} Discount Script</p>
                   <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                      <div>
                         <p className="text-[8px] font-black text-gray-400 uppercase">Usage Count</p>
                         <span className="text-xl font-black text-slate-800">{c.uses.toLocaleString()}</span>
                      </div>
                      <button className="text-[10px] font-black text-blue-600 uppercase hover:underline transition-all">تعديل القواعد ←</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'shipping' && (
          <div className="bg-white p-14 rounded-[70px] shadow-3xl border border-gray-100 animate-in slide-in-from-bottom-10">
              <h3 className="text-3xl font-black mb-10 text-slate-800 flex items-center gap-4">
                  <div className="w-3 h-10 bg-purple-600 rounded-full"></div>
                  منصة إسناد الشحنات (Dispatch Hub)
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الطلبات الجاهزة للشحن (Processing)</p>
                      {onlineOrders.filter(o => o.status === 'processing').map(order => (
                          <div key={order.id} className="p-8 bg-blue-50/30 rounded-[3rem] border border-blue-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                              <div>
                                  <h4 className="text-lg font-black text-slate-800">Order #{order.id}</h4>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">الوجهة: {order.customerName}</p>
                                  {order.shippingAddress && <p className="text-[9px] text-indigo-500 font-bold mt-1">📍 {order.shippingAddress}</p>}
                              </div>
                              <button 
                                onClick={() => updateOnlineOrderStatus(order.id, 'shipped')}
                                className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-purple-700 transition-all flex items-center gap-2"
                              >
                                  <span>إنشاء بوليصة شحن</span>
                                  <span className="text-lg">🚚</span>
                              </button>
                          </div>
                      ))}
                      {onlineOrders.filter(o => o.status === 'processing').length === 0 && (
                          <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[3rem] opacity-40">
                              <p className="font-black text-sm uppercase">لا توجد طلبات جاهزة للشحن حالياً</p>
                          </div>
                      )}
                  </div>

                  <div className="glass p-10 rounded-[50px] bg-slate-900 text-white h-fit">
                      <h4 className="text-xl font-black mb-6">الأسطول المتاح</h4>
                      <div className="space-y-4">
                          {fieldAgents.filter(a => a.status === 'online').slice(0, 3).map(agent => (
                              <div key={agent.id} className="flex items-center gap-4 p-4 bg-white/10 rounded-3xl border border-white/10">
                                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                                      {agent.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm">{agent.name}</p>
                                      <p className="text-[9px] opacity-60 uppercase">{agent.phone}</p>
                                  </div>
                              </div>
                          ))}
                          <button className="w-full py-4 mt-4 bg-white/20 rounded-2xl font-black text-[9px] uppercase hover:bg-white/30 transition-all">عرض الخريطة الحية</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Ecommerce;
