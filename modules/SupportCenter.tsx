
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Ticket } from '../types';

const SupportCenter: React.FC = () => {
  const { user, activeTab, tickets, addTicket, generateAIContent } = useApp();
  const [currentView, setCurrentView] = useState<'tickets' | 'tutorials'>(
    activeTab === 'tutorials' ? 'tutorials' : 'tickets'
  );

  const [newTicket, setNewTicket] = useState({ subject: '', desc: '' });
  const [aiSolution, setAiSolution] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleSendTicket = () => {
      if(!newTicket.subject || !newTicket.desc) return;
      const t: Ticket = {
          id: `T-${Date.now()}`,
          subject: newTicket.subject,
          description: newTicket.desc,
          status: 'open',
          date: new Date().toLocaleDateString(),
          priority: 'medium'
      };
      addTicket(t);
      setNewTicket({ subject: '', desc: '' });
      setAiSolution('');
  };

  const handleAIAnalyze = async () => {
      if(!newTicket.desc) return;
      setIsAnalysing(true);
      const prompt = `
        User is facing this issue in an ERP system (POS/Inventory/Accounting): "${newTicket.desc}".
        Subject: "${newTicket.subject}".
        
        Provide a short, technical step-by-step solution to try before contacting support.
        Answer in Arabic.
      `;
      const solution = await generateAIContent(prompt, 'text');
      setAiSolution(solution);
      setIsAnalysing(false);
  };

  const tutorials = [
    { id: 1, title: 'كيف تبدأ البيع في 5 دقائق', duration: '3:20', category: 'POS' },
    { id: 2, title: 'إدارة المخزون والجرد الذكي', duration: '8:45', category: 'Inventory' },
    { id: 3, title: 'ربط المتجر الإلكتروني', duration: '5:10', category: 'E-commerce' },
    { id: 4, title: 'إصدار التقارير الضريبية', duration: '4:00', category: 'Finance' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز الدعم والمساعدة</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Support Tickets & Knowledge Base</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50">
          <button 
            onClick={() => setCurrentView('tickets')} 
            className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'tickets' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
          >
            التذاكر الفنية 🎫
          </button>
          <button 
            onClick={() => setCurrentView('tutorials')} 
            className={`px-10 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'tutorials' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
          >
            الشروحات 🎥
          </button>
        </div>
      </div>

      {currentView === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-6">
              {tickets.map(ticket => (
                 <div key={ticket.id} className="glass p-8 rounded-[40px] border border-white shadow-lg bg-white/40 hover:bg-white transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${ticket.status === 'open' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h4 className="text-lg font-black text-slate-800">{ticket.subject}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {ticket.id} • {ticket.date}</p>
                       </div>
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${ticket.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                       </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-6">{ticket.description}</p>
                    <div className="flex gap-4">
                       <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">متابعة الردود</button>
                       {ticket.status === 'open' && <button className="px-6 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">إغلاق</button>}
                    </div>
                 </div>
              ))}
           </div>

           <div className="lg:col-span-1 glass p-10 rounded-[50px] shadow-2xl border-white bg-slate-900 text-white h-fit">
              <h3 className="text-xl font-black mb-6">فتح تذكرة جديدة</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">الموضوع</label>
                    <input type="text" className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl outline-none font-bold text-sm focus:bg-white/20 transition-all" placeholder="عنوان المشكلة..." value={newTicket.subject} onChange={e=>setNewTicket({...newTicket, subject: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">الوصف</label>
                    <textarea className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl outline-none font-bold text-sm min-h-[120px] focus:bg-white/20 transition-all" placeholder="تفاصيل المشكلة..." value={newTicket.desc} onChange={e=>setNewTicket({...newTicket, desc: e.target.value})} />
                 </div>
                 
                 {aiSolution && (
                     <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl animate-in slide-in-from-top-2">
                         <div className="flex items-center gap-2 mb-2">
                             <span className="text-xl">🤖</span>
                             <span className="text-[10px] font-black text-emerald-400 uppercase">اقتراح الذكاء الاصطناعي</span>
                         </div>
                         <p className="text-xs leading-relaxed text-emerald-100">{aiSolution}</p>
                     </div>
                 )}

                 <div className="flex gap-2">
                    <button 
                        onClick={handleAIAnalyze}
                        disabled={isAnalysing || !newTicket.desc}
                        className="flex-1 py-4 bg-white/10 border border-white/20 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                        {isAnalysing ? 'جاري التحليل...' : 'اسأل AI أولاً ✨'}
                    </button>
                    <button onClick={handleSendTicket} className="flex-1 py-4 bg-blue-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all">إرسال الطلب</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {currentView === 'tutorials' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tutorials.map(tut => (
               <div key={tut.id} className="bg-white p-6 rounded-[40px] shadow-xl border border-gray-100 hover:-translate-y-2 transition-all cursor-pointer group">
                  <div className="aspect-video bg-slate-100 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600 pl-1 text-xl">▶</div>
                  </div>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{tut.category}</span>
                  <h4 className="text-sm font-black text-slate-800 mt-3 leading-snug">{tut.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">{tut.duration} دقيقة</p>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default SupportCenter;
