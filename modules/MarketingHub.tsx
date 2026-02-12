
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Campaign } from '../types';

const MarketingHub: React.FC = () => {
  const { campaigns, products, generateAIContent, addLog, addCampaign, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'studio' | 'campaigns' | 'channels'>('studio');
  
  // AI Studio State Flow
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('sales');
  const [budget, setBudget] = useState('');
  
  const [generatedContent, setGeneratedContent] = useState({ 
     text: '', 
     audience: '', 
     imagePrompt: '',
     channels: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIAnalysis = async () => {
    setIsGenerating(true);
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;

    // Enhanced Prompt for JSON output
    const prompt = `
    Act as a senior marketing expert.
    Product: "${prod.name_ar}" (Category: ${prod.category}, Price: ${prod.price}).
    Goal: ${campaignGoal}.
    Budget: ${budget}.
    
    Generate a marketing campaign strategy.
    
    IMPORTANT: You must return the result as a valid JSON object ONLY, with no extra text.
    The JSON structure must be:
    {
      "ad_copy": "A catchy arabic ad copy with emojis",
      "target_audience": "Description of the best audience in Arabic",
      "visual_description": "A detailed English prompt for an image generator describing the ad visual",
      "recommended_platforms": ["Platform1", "Platform2"]
    }
    `;

    try {
        const result = await generateAIContent(prompt, 'text');
        // Sanitize and parse JSON
        const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        setGeneratedContent({
          text: parsed.ad_copy || "Error generating copy.",
          audience: parsed.target_audience || "General Audience",
          imagePrompt: parsed.visual_description || `Product shot of ${prod.name}`,
          channels: parsed.recommended_platforms || ['Instagram']
        });
        setStep(2);
    } catch (e) {
        console.error(e);
        addToast("حدث خطأ أثناء معالجة رد الذكاء الاصطناعي", 'error');
    }
    
    setIsGenerating(false);
  };

  const handleLaunch = () => {
     const prod = products.find(p => p.id === selectedProduct);
     const camp: Campaign = {
         id: `CAMP-${Date.now()}`,
         title: `Campaign for ${prod?.name}`,
         platform: generatedContent.channels[0] as any || 'instagram',
         status: 'active',
         budget: parseFloat(budget) || 0,
         reach: 0,
         content: generatedContent.text,
         targetAudience: generatedContent.audience,
         date: new Date().toISOString()
     };
     addCampaign(camp);
     addToast("تم جدولة الحملة والنشر على المنصات المحددة بنجاح! 🚀", 'success');
     setStep(1);
     setSelectedProduct('');
     setBudget('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">استوديو التسويق الذكي 🧠</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">AI-Powered Campaign Generator</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            {['studio', 'campaigns', 'channels'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === t ? 'bg-white shadow-sm text-slate-800' : 'text-gray-400'}`}>
                  {t === 'studio' ? 'منشئ الحملات' : t === 'campaigns' ? 'إدارة الحملات' : 'القنوات'}
               </button>
            ))}
        </div>
      </div>

      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Left: Input Form */}
           <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                 <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm shadow-lg">1</span>
                 إعدادات الحملة
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block px-1">المنتج المستهدف</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none"
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      value={selectedProduct}
                    >
                       <option value="">-- اختر من المخزون --</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name_ar} - {p.price} ريال</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block px-1">الهدف</label>
                       <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none" onChange={e=>setCampaignGoal(e.target.value)}>
                          <option value="sales">زيادة المبيعات</option>
                          <option value="awareness">الوعي بالعلامة التجارية</option>
                          <option value="engagement">تفاعل (رسائل)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block px-1">الميزانية ($)</label>
                       <input type="number" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none" placeholder="مثال: 500" value={budget} onChange={e=>setBudget(e.target.value)} />
                    </div>
                 </div>

                 <button 
                   onClick={handleAIAnalysis} 
                   disabled={isGenerating || !selectedProduct}
                   className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                 >
                    {isGenerating ? (
                        <>جاري التحليل والكتابة <span className="animate-spin">⚙️</span></>
                    ) : (
                        <>تحليل وإنشاء المحتوى (JSON) ✨</>
                    )}
                 </button>
              </div>
           </div>

           {/* Right: AI Output Preview */}
           <div className={`glass p-10 rounded-[50px] border border-white bg-white/40 transition-all ${step === 1 ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                 <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg">2</span>
                 النتائج والمراجعة
              </h3>

              {generatedContent.text && (
                 <div className="space-y-6">
                    {/* Content Card */}
                    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-50">
                       <div className="flex gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                             <p className="font-bold text-xs">اسم متجرك</p>
                             <p className="text-[9px] text-gray-400">ممول • Sponsored</p>
                          </div>
                       </div>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line mb-4">{generatedContent.text}</p>
                       <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold border-2 border-dashed border-gray-200 p-4 text-center">
                          PROMPT: {generatedContent.imagePrompt}
                       </div>
                    </div>

                    {/* Audience & Strategy */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                          <p className="text-[9px] font-black text-purple-600 uppercase mb-2">الجمهور المقترح</p>
                          <p className="text-[10px] font-bold text-slate-700">{generatedContent.audience}</p>
                       </div>
                       <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-[9px] font-black text-blue-600 uppercase mb-2">المنصات</p>
                          <div className="flex gap-2 flex-wrap">
                             {generatedContent.channels.map(ch => <span key={ch} className="bg-white px-2 py-1 rounded-lg text-[9px] shadow-sm">{ch}</span>)}
                          </div>
                       </div>
                    </div>

                    <button onClick={handleLaunch} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs">
                       اعتماد وجدولة النشر 🚀
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(camp => (
                  <div key={camp.id} className="glass p-8 rounded-[40px] shadow-xl border-white hover:bg-white transition-all">
                      <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{camp.platform}</span>
                          <span className="text-[9px] font-bold text-gray-400">{new Date(camp.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-black text-lg text-slate-800 mb-2">{camp.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{camp.content}</p>
                      <div className="mt-6 flex justify-between items-center border-t border-slate-50 pt-4">
                          <span className="text-xs font-black text-slate-800">${camp.budget} Budget</span>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                      </div>
                  </div>
              ))}
              {campaigns.length === 0 && <p className="col-span-3 text-center py-20 opacity-30 font-black uppercase">No active campaigns</p>}
          </div>
      )}
    </div>
  );
};

export default MarketingHub;
