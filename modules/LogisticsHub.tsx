
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Shipment, Vehicle } from '../types';

const LogisticsHub: React.FC = () => {
  const { shipments, updateShipmentStatus, lang, addShipment, addLog, fleet, fieldAgents } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'fleet' | 'map'>('tracking');
  const [showModal, setShowModal] = useState(false);
  const [newShp, setNewShp] = useState({ origin: '', dest: '', carrier: 'Titan Logistics', weight: '' });

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'in_transit': return '🚚';
        case 'delivered': return '✅';
        case 'picked_up': return '📦';
        default: return '📍';
    }
  };

  const handleAdd = () => {
    if(!newShp.origin || !newShp.dest) return;
    const s: Shipment = {
        id: `SHP-${Date.now()}`,
        trackingNumber: `TRK-${Math.floor(Math.random()*10000)}`,
        orderId: 'ORD-MANUAL',
        origin: newShp.origin,
        destination: newShp.dest,
        carrier: newShp.carrier,
        weight: parseFloat(newShp.weight) || 1,
        status: 'pending'
    };
    addShipment(s);
    setShowModal(false);
    setNewShp({ origin: '', dest: '', carrier: 'Titan Logistics', weight: '' });
  };

  const handleUpdateStatus = (id: string, currentStatus: string) => {
      const nextStatus = currentStatus === 'pending' ? 'picked_up' : 
                         currentStatus === 'picked_up' ? 'in_transit' : 
                         currentStatus === 'in_transit' ? 'delivered' : 'delivered';
      
      if (currentStatus !== 'delivered') {
          updateShipmentStatus(id, nextStatus);
          addLog(`Shipment ${id} updated to ${nextStatus}`, 'info', 'Logistics');
      } else {
          alert('هذه الشحنة تم تسليمها بالفعل.');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز العمليات اللوجستية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Global Shipment Tracking, Fleet Management & Last-Mile Analytics</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
          <button onClick={() => setActiveSubTab('tracking')} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'tracking' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>التتبع</button>
          <button onClick={() => setActiveSubTab('map')} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'map' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>الخريطة الحية 🗺️</button>
          <button onClick={() => setActiveSubTab('fleet')} className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'fleet' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>الأسطول</button>
        </div>
      </div>

      {activeSubTab === 'tracking' && (
          <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">شحنات قيد العبور</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{shipments.filter(s=>s.status==='in_transit').length} شحنة</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">On Schedule 94%</span>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">تغطية الأسطول</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">12 مدينة</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Expansion Active</span>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-slate-900 text-white flex flex-col justify-between h-56">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">تنبيهات التأخير</p>
                    <h3 className="text-4xl font-black tracking-tighter">1 تنبيه</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 animate-pulse">تحتاج تدخل يدوي</span>
                </div>
                <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40 flex flex-col justify-between h-56">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">شحنات مكتملة (اليوم)</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">28 شحنة</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">All Clear</span>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <div className="w-2.5 h-8 bg-blue-600 rounded-full"></div>
                        رادار تتبع الشحنات اللحظي
                    </h3>
                    <button onClick={() => setShowModal(true)} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">إنشاء بوليصة +</button>
                </div>
                
                <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-white/60">
                    <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                        <tr>
                            <th className="px-10 py-7">بوليصة الشحن</th>
                            <th className="px-10 py-7">المسار</th>
                            <th className="px-10 py-7">الناقل</th>
                            <th className="px-10 py-7 text-center">الوزن</th>
                            <th className="px-10 py-7 text-center">الحالة</th>
                            <th className="px-10 py-7 text-center">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold text-slate-700">
                        {shipments.map(shp => (
                            <tr key={shp.id} className="hover:bg-blue-50/20 transition-all group">
                                <td className="px-10 py-6">
                                <p className="font-black text-slate-900 tracking-tighter text-sm uppercase">{shp.trackingNumber}</p>
                                <p className="text-[9px] text-gray-400 uppercase">Order Ref: {shp.orderId}</p>
                                </td>
                                <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                    <span>{shp.origin}</span>
                                    <span className="text-gray-300">→</span>
                                    <span className="text-blue-600">{shp.destination}</span>
                                </div>
                                </td>
                                <td className="px-10 py-6">{shp.carrier}</td>
                                <td className="px-10 py-6 text-center">{shp.weight} كجم</td>
                                <td className="px-10 py-6 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                    shp.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                                    shp.status === 'in_transit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                    {getStatusIcon(shp.status)} {shp.status.replace('_', ' ')}
                                </span>
                                </td>
                                <td className="px-10 py-6 text-center">
                                <button onClick={() => handleUpdateStatus(shp.id, shp.status)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-md">
                                    {shp.status === 'delivered' ? 'تم التسليم' : 'تحديث المسار'}
                                </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
          </div>
      )}

      {activeSubTab === 'map' && (
          <div className="bg-slate-900 rounded-[60px] p-10 h-[700px] shadow-3xl relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <h3 className="text-white text-2xl font-black mb-2">رادار الأسطول الحي (Live HQ)</h3>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                          مزامنة فورية مع GPS المناديب
                      </p>
                  </div>
                  <div className="flex gap-4">
                      <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white">
                          <p className="text-[8px] font-black opacity-60 uppercase">المركبات النشطة</p>
                          <p className="text-xl font-black">{fleet.filter(v=>v.status==='busy').length + fieldAgents.filter(a=>a.status==='online').length}</p>
                      </div>
                  </div>
              </div>

              {/* Mock Map UI */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-[120%] h-[120%] border-[1px] border-blue-500/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
                  <div className="absolute w-[80%] h-[80%] border-[1px] border-blue-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
              </div>

              {/* Pulsating Vehicle Dots */}
              <div className="absolute top-1/4 right-1/3 group cursor-pointer pointer-events-auto">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_20px_#10b981]"></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg text-[9px] font-black whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">مندوب: علي (بانتظار التحميل)</div>
              </div>
              <div className="absolute bottom-1/3 left-1/4 group cursor-pointer pointer-events-auto">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-[0_0_20px_#3b82f6]"></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg text-[9px] font-black whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">شاحنة TRK-22: في الطريق لجدة</div>
              </div>
              <div className="absolute top-1/2 left-1/2 group cursor-pointer pointer-events-auto">
                  <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_#f59e0b]"></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg text-[9px] font-black whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">مندوب: خالد (تم التسليم)</div>
              </div>

              {/* Map Footer Overlay */}
              <div className="absolute bottom-10 left-10 right-10 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {fieldAgents.filter(a=>a.status==='online').map(agent => (
                      <div key={agent.id} className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl min-w-[200px] text-white flex items-center gap-4 hover:bg-white/20 transition-all cursor-pointer">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xs font-black shadow-lg">{agent.name.charAt(0)}</div>
                          <div>
                              <p className="font-bold text-xs">{agent.name}</p>
                              <p className="text-[9px] opacity-60">موقع: حي النخيل</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeSubTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5">
              {fleet.map(vehicle => (
                  <div key={vehicle.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 w-2 h-full ${vehicle.status === 'available' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                      <div className="flex justify-between items-start mb-8">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{vehicle.type === 'truck' ? '🚛' : '🚐'}</div>
                          <div className="text-right">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مستوى الوقود</p>
                              <p className={`text-2xl font-black ${vehicle.fuelLevel < 20 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{vehicle.fuelLevel}%</p>
                          </div>
                      </div>
                      <h4 className="text-xl font-black text-slate-800 mb-1">{vehicle.model}</h4>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">Plate: {vehicle.plateNumber}</p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                          <div className={`h-full ${vehicle.fuelLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${vehicle.fuelLevel}%`}}></div>
                      </div>
                      <div className="flex gap-4">
                          <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">سجل الصيانة</button>
                          <button className="px-6 py-4 glass border border-gray-100 rounded-2xl">⚙️</button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">إصدار بوليصة شحن</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">مدينة الشحن</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newShp.origin} onChange={e=>setNewShp({...newShp, origin: e.target.value})} placeholder="الرياض" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">مدينة الوصول</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newShp.dest} onChange={e=>setNewShp({...newShp, dest: e.target.value})} placeholder="جدة" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">شركة النقل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newShp.carrier} onChange={e=>setNewShp({...newShp, carrier: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الوزن التقديري (كجم)</label>
                    <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-black text-blue-600" value={newShp.weight} onChange={e=>setNewShp({...newShp, weight: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إصدار البوليصة</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsHub;
