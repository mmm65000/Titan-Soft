
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sale } from '../types';

const Fulfillment: React.FC = () => {
  const { sales, onlineOrders, updateSaleStatus, lang } = useApp();
  const [filter, setFilter] = useState('all');

  // Combine POS sales and Online Orders that need fulfillment
  // Assuming 'completed' POS sales might still need prep in some contexts (e.g., F&B), 
  // but usually we look for a specific status. Let's assume we filter by status 'processing' or 'pending'
  // For demo, we treat all 'processing', 'pending', 'preparing' as active.
  
  const allOrders = [...sales, ...onlineOrders].filter(o => 
      ['pending', 'processing', 'preparing', 'ready'].includes(o.status) || 
      ['pending', 'picking', 'ready'].includes(o.fulfillmentStatus || '')
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getTimerColor = (dateStr: string) => {
      const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 60000; // minutes
      if (diff < 10) return 'bg-emerald-500';
      if (diff < 20) return 'bg-yellow-500';
      return 'bg-red-500';
  };

  const getStatusLabel = (order: any) => {
      if (order.fulfillmentStatus) return order.fulfillmentStatus;
      return order.status;
  };

  const advanceOrder = (order: any) => {
      let nextStatus = '';
      let current = order.fulfillmentStatus || order.status;

      if (current === 'pending') nextStatus = 'preparing'; // or picking
      else if (current === 'preparing' || current === 'picking') nextStatus = 'ready';
      else if (current === 'ready') nextStatus = 'dispatched'; // or completed/delivered

      if (nextStatus) {
          if (nextStatus === 'dispatched' || nextStatus === 'delivered') {
             updateSaleStatus(order.id, 'delivered', 'dispatched'); // Finalize
          } else {
             updateSaleStatus(order.id, nextStatus === 'preparing' ? 'processing' : nextStatus, nextStatus === 'preparing' ? 'picking' : nextStatus);
          }
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">شاشة التجهيز (KDS / WMS)</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Order Fulfillment & Kitchen/Warehouse Display System</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> <span className="text-[10px] font-bold">New</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div> <span className="text-[10px] font-bold">Delayed</span>
                <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div> <span className="text-[10px] font-bold">Critical</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allOrders.map(order => (
              <div key={order.id} className="bg-white rounded-[30px] border-2 border-gray-50 shadow-xl overflow-hidden flex flex-col h-[400px] relative group hover:border-blue-200 transition-all">
                  <div className={`h-2 w-full ${getTimerColor(order.date)}`}></div>
                  <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h4 className="font-black text-xl text-slate-800">#{order.id.slice(-4)}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{order.source || 'POS'}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                              {new Date(order.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-4">
                          {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                  <div className="flex items-center gap-3">
                                      <span className="bg-blue-50 text-blue-600 font-black w-6 h-6 flex items-center justify-center rounded-lg text-xs">{item.quantity}</span>
                                      <span className="text-sm font-bold text-slate-700 leading-tight">{item.name}</span>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto">
                          <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl">
                              <span className="text-[10px] font-black text-gray-400 uppercase">Status</span>
                              <span className="text-xs font-black uppercase text-blue-600">{getStatusLabel(order)}</span>
                          </div>
                          <button 
                            onClick={() => advanceOrder(order)}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg text-white transition-all ${
                                getStatusLabel(order) === 'ready' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-blue-600'
                            }`}
                          >
                              {getStatusLabel(order) === 'ready' ? 'Dispatch / Serve ✅' : 'Next Stage ➜'}
                          </button>
                      </div>
                  </div>
              </div>
          ))}
          {allOrders.length === 0 && (
              <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="font-black text-xl uppercase tracking-widest">All orders cleared</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Fulfillment;
