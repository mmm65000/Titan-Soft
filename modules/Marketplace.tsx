
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { BuyRequest, Bid } from '../types';

const Marketplace: React.FC = () => {
  const { buyRequests, bids, user, lang, acceptBid, setBuyRequests, setBids, t, addLog } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compareMode, setCompareMode] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({ description: '', items: '' });

  const handleAddRequest = () => {
    if (!newRequest.description || !newRequest.items) return;
    const request: BuyRequest = {
      id: `req-${Date.now()}`,
      retailerId: user?.id || 'guest',
      retailerName: user?.name || 'Retailer',
      items: newRequest.items.split(',').map(i => ({ productName: i.trim(), quantity: 1 })),
      status: 'active',
      date: new Date().toISOString(),
      description: newRequest.description
    };
    setBuyRequests([request, ...buyRequests]);
    addLog(`Broadcasted new supply request: ${request.description.slice(0, 30)}...`, 'info');
    setIsModalOpen(false);
    setNewRequest({ description: '', items: '' });
  };

  const handlePlaceBid = (reqId: string) => {
    const bidAmount = Math.floor(Math.random() * 4000) + 800;
    const bid: Bid = {
      id: `bid-${Date.now()}`,
      requestId: reqId,
      supplierId: user?.id || 's-guest',
      supplierName: user?.name || 'Partner Supplier',
      amount: bidAmount,
      deliveryTime: '3-5 Days',
      status: 'pending',
      notes: 'Includes expedited shipping and bulk discount.'
    };
    setBids([bid, ...bids]);
    addLog(`Submitted competitive bid: $${bidAmount} for Request #${reqId.slice(-4)}`, 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{t('marketplace')}</h2>
          <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Supply chain competition & negotiation floor</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'wholesaler') && (
          <button onClick={() => setIsModalOpen(true)} className="neumorph-btn px-10 py-5 bg-blue-600 text-white font-black flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Request Quote
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {buyRequests.filter(r => r.status !== 'closed').length === 0 ? (
             <div className="py-20 text-center opacity-30 font-black uppercase tracking-widest italic">No active supply requests.</div>
          ) : (
            buyRequests.filter(r => r.status !== 'closed').map(req => (
              <div key={req.id} className="glass p-10 rounded-[50px] border-l-[10px] border-blue-600 shadow-xl group hover:bg-white transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-2xl text-slate-800 tracking-tight">{req.retailerName}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Ref: {req.id.slice(-6)} • {new Date(req.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCompareMode(req.id)} className="px-6 py-2 glass text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-full">Compare Bids</button>
                  </div>
                </div>
                <p className="text-slate-600 font-bold mb-8 text-lg">{req.description}</p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {req.items.map((item, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">#{item.productName}</span>
                  ))}
                </div>
                {user?.role === 'supplier' && (
                  <button onClick={() => handlePlaceBid(req.id)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px]">Submit Quote</button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-black px-2 flex items-center gap-3">
             <div className="w-2.5 h-7 bg-indigo-600 rounded-full"></div>
             Recent Activity
          </h3>
          <div className="space-y-5">
            {bids.filter(b => b.status === 'pending').slice(0, 5).map(bid => (
              <div key={bid.id} className="glass p-8 rounded-[40px] shadow-lg border border-white/60">
                 <div className="flex justify-between items-center mb-3">
                    <h5 className="font-black text-sm text-slate-800">{bid.supplierName}</h5>
                    <span className="text-xl font-black text-blue-600">${bid.amount}</span>
                 </div>
                 <p className="text-[10px] text-slate-500 mb-6 italic truncate">"{bid.notes}"</p>
                 <button onClick={() => acceptBid(bid.id)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Quick Approve</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {compareMode && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass w-full max-w-5xl p-14 rounded-[70px] shadow-3xl border-white flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Market Comparison Engine</h3>
                 <button onClick={() => setCompareMode(null)} className="p-4 glass rounded-3xl hover:text-red-500 transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="flex-1 overflow-x-auto pb-6">
                 <div className="flex gap-6 min-w-max px-4">
                    {bids.filter(b => b.requestId === compareMode).map(bid => (
                       <div key={bid.id} className="w-80 glass p-10 rounded-[50px] border border-white/40 flex flex-col justify-between hover:bg-white transition-all shadow-xl group">
                          <div>
                             <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center text-2xl font-black mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">{bid.supplierName.charAt(0)}</div>
                             <h4 className="text-xl font-black text-slate-800 mb-1">{bid.supplierName}</h4>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Partner ID: {bid.supplierId}</p>
                             <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                                   <span className="text-[10px] font-black text-gray-400 uppercase">Quote Total</span>
                                   <span className="text-2xl font-black text-slate-900">${bid.amount}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                                   <span className="text-[10px] font-black text-gray-400 uppercase">Fulfillment</span>
                                   <span className="text-xs font-black text-indigo-600">{bid.deliveryTime}</span>
                                </div>
                             </div>
                          </div>
                          <button onClick={() => { acceptBid(bid.id); setCompareMode(null); }} className="mt-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl">Confirm Partner</button>
                       </div>
                    ))}
                    {bids.filter(b => b.requestId === compareMode).length === 0 && (
                        <div className="w-full text-center py-20 opacity-30 font-black uppercase text-sm">Awaiting supplier quotes for this request.</div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-xl p-14 rounded-[60px] shadow-2xl scale-in-center border border-white">
            <h3 className="text-3xl font-black mb-4 text-center tracking-tighter text-slate-800">Global Supply Request</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">Contract Details</label>
                <textarea value={newRequest.description} onChange={(e) => setNewRequest({...newRequest, description: e.target.value})} className="w-full glass-dark p-6 rounded-[2.5rem] outline-none min-h-[120px] font-bold border-white/20" placeholder="E.g. Seeking 50 units of Elite Laptops..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">Products</label>
                <input type="text" value={newRequest.items} onChange={(e) => setNewRequest({...newRequest, items: e.target.value})} className="w-full glass-dark p-5 rounded-[2rem] outline-none font-black" placeholder="Laptops, Servers..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                <button onClick={handleAddRequest} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl uppercase tracking-widest text-[10px]">Publish Broadcast</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
