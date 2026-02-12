
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const OrdersHub: React.FC<{ activeSubTab?: string }> = ({ activeSubTab }) => {
  const { lang, t, onlineOrders, updateOnlineOrderStatus } = useApp();
  const currentView = activeSubTab || 'orders-my';

  const getTitle = () => {
    switch(currentView) {
        case 'orders-my': return 'طلبياتي الشخصية';
        case 'orders-branch': return 'تحويلات الفروع الصادرة';
        case 'orders-customer': return 'طلبيات العملاء الخارجية';
        case 'orders-store': return 'مبيعات المتجر الإلكتروني';
        default: return 'الطلبيات';
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'processing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-center mb-6">
        <h2 className="text-4xl font-black text-blue-600 border-b-4 border-blue-600 pb-3 px-10 uppercase tracking-tighter">
           تايتان - {getTitle()}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'طلبات اليوم', val: onlineOrders.length, color: 'blue' },
          { label: 'قيد الشحن', val: onlineOrders.filter(o=>o.status==='shipped').length, color: 'orange' },
          { label: 'تم التسليم', val: onlineOrders.filter(o=>o.status==='delivered').length, color: 'emerald' },
          { label: 'مرتجعات', val: '0', color: 'rose' },
        ].map(s => (
          <div key={s.label} className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 flex flex-col items-center group hover:bg-slate-900 transition-all cursor-pointer">
            <span className={`text-4xl font-black text-${s.color}-600 group-hover:text-white mb-2`}>{s.val}</span>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-gray-300 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100" dir="rtl">
         <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex-1 flex gap-4 w-full">
                <button className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <input type="text" placeholder="بحث برقم الطلبية أو اسم المستلم..." className="flex-1 bg-gray-50 border border-gray-100 px-8 py-4 rounded-2xl outline-none font-bold shadow-inner focus:bg-white transition-all" />
            </div>
         </div>

         <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20">
            <table className="w-full text-right text-xs">
               <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-10 py-7">الرقم المرجعي</th>
                     <th className="px-10 py-7">التاريخ</th>
                     <th className="px-10 py-7">العميل / الوجهة</th>
                     <th className="px-10 py-7">القيمة الإجمالية</th>
                     <th className="px-10 py-7 text-center">الحالة</th>
                     <th className="px-10 py-7 text-center">تحديث الحالة</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                  {onlineOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white transition-all group">
                       <td className="px-10 py-5 text-blue-600 font-black">#{order.id}</td>
                       <td className="px-10 py-5">
                          <p>{new Date(order.date).toLocaleDateString()}</p>
                          <p className="text-[9px] text-gray-400 font-bold">{new Date(order.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                       </td>
                       <td className="px-10 py-5">{order.customerName}</td>
                       <td className="px-10 py-5 font-black text-slate-800">${order.total}</td>
                       <td className="px-10 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusColor(order.status)}`}>
                             {order.status}
                          </span>
                       </td>
                       <td className="px-10 py-5 text-center flex justify-center gap-2">
                          {order.status === 'pending' && (
                              <button onClick={()=>updateOnlineOrderStatus(order.id, 'processing')} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white" title="قبول الطلب">⚙️</button>
                          )}
                          {(order.status === 'processing' || order.status === 'pending') && (
                              <button onClick={()=>updateOnlineOrderStatus(order.id, 'shipped')} className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white" title="شحن">🚚</button>
                          )}
                          {order.status === 'shipped' && (
                              <button onClick={()=>updateOnlineOrderStatus(order.id, 'delivered')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white" title="تم التسليم">✅</button>
                          )}
                          {order.status === 'delivered' && (
                              <span className="text-emerald-500 font-black">✓</span>
                          )}
                       </td>
                    </tr>
                  ))}
                  {onlineOrders.length === 0 && (
                    <tr><td colSpan={6} className="py-20 text-center opacity-30 font-black uppercase italic">لا توجد طلبيات مسجلة</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default OrdersHub;
