
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Campaign } from '../types';
import { GoogleGenAI } from "@google/genai";

const MarketingHub: React.FC = () => {
  const { campaigns, products, generateAIContent, addLog, addCampaign, addToast, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState<'studio' | 'campaigns' | 'channels' | 'creative'>('studio');
  
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

  // Creative Studio State
  const [creativeMode, setCreativeMode] = useState<'image' | 'video'>('image');
  const [imgPrompt, setImgPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K'); // New State for Image Size
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [veoLoading, setVeoLoading] = useState(false);

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
     const budgetVal = parseFloat(budget) || 0;
     const camp: Campaign = {
         id: `CAMP-${Date.now()}`,
         title: `Campaign for ${prod?.name}`,
         platform: generatedContent.channels[0] as any || 'instagram',
         status: 'active',
         budget: budgetVal,
         reach: 0,
         content: generatedContent.text,
         targetAudience: generatedContent.audience,
         date: new Date().toISOString()
     };
     addCampaign(camp);
     
     // Deduct Budget as Expense
     addExpense({
         category: 'Marketing Ads',
         amount: budgetVal,
         note: `Ad Campaign Launch: ${camp.title}`,
         type: 'marketing'
     });

     addToast("تم جدولة الحملة، خصم الميزانية، والنشر على المنصات المحددة بنجاح! 🚀", 'success');
     setStep(1);
     setSelectedProduct('');
     setBudget('');
  };

  const handleGenerateImage = async () => {
      if(!imgPrompt) return;
      
      if (!process.env.API_KEY) {
          setIsGenerating(true);
          setTimeout(() => {
              setGeneratedImage(`https://placehold.co/600x600?text=Generated+Image+${imageSize}`);
              setIsGenerating(false);
              addToast("⚠️ Demo Mode: Simulated Image Generation", "info");
          }, 1500);
          return;
      }

      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-image-preview',
              contents: { parts: [{ text: imgPrompt }] },
              config: {
                  imageConfig: {
                      aspectRatio: aspectRatio as any,
                      imageSize: imageSize as any // Dynamic Image Size
                  }
              }
          });
          
          // Iterate to find image part
          if (response.candidates && response.candidates[0].content.parts) {
              for (const part of response.candidates[0].content.parts) {
                  if (part.inlineData) {
                      setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                      break;
                  }
              }
          }
      } catch (e) {
          console.error(e);
          addToast('Failed to generate image', 'error');
      }
      setIsGenerating(false);
  };

  const handleGenerateVideo = async () => {
      if(!videoPrompt) return;
      
      if (!process.env.API_KEY) {
          setVeoLoading(true);
          setTimeout(() => {
              setGeneratedVideo("https://www.w3schools.com/html/mov_bbb.mp4"); // Dummy video
              setVeoLoading(false);
              addToast("⚠️ Demo Mode: Simulated Video Generation", "info");
          }, 2000);
          return;
      }

      setVeoLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          let operation = await ai.models.generateVideos({
              model: 'veo-3.1-fast-generate-preview',
              prompt: videoPrompt,
              config: {
                  numberOfVideos: 1,
                  resolution: '720p',
                  aspectRatio: '16:9'
              }
          });

          // Polling
          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              operation = await ai.operations.getVideosOperation({operation: operation});
          }

          const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (videoUri) {
              // Fetch the actual video bytes using the key
              const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              setGeneratedVideo(url);
          }

      } catch (e) {
          console.error(e);
          addToast('Failed to generate video', 'error');
      }
      setVeoLoading(false);
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
            {['studio', 'creative', 'campaigns', 'channels'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === t ? 'bg-white shadow-sm text-slate-800' : 'text-gray-400'}`}>
                  {t === 'studio' ? 'منشئ الحملات' : t === 'creative' ? 'المعمل الإبداعي' : t === 'campaigns' ? 'إدارة الحملات' : 'القنوات'}
               </button>
            ))}
        </div>
      </div>

      {activeTab === 'creative' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass p-10 rounded-[50px] shadow-2xl border-white bg-white/40">
                  <h3 className="text-xl font-black text-slate-800 mb-8">المعمل الإبداعي (Generative AI)</h3>
                  
                  <div className="flex bg-white/50 p-1 rounded-xl mb-6 w-fit">
                      <button onClick={()=>setCreativeMode('image')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${creativeMode==='image'?'bg-slate-900 text-white shadow-lg':'text-slate-500'}`}>Image (Nano Pro)</button>
                      <button onClick={()=>setCreativeMode('video')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${creativeMode==='video'?'bg-slate-900 text-white shadow-lg':'text-slate-500'}`}>Video (Veo)</button>
                  </div>

                  {creativeMode === 'image' ? (
                      <div className="space-y-6">
                          <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">وصف الصورة (Prompt)</label>
                              <textarea 
                                value={imgPrompt}
                                onChange={e => setImgPrompt(e.target.value)}
                                className="w-full glass-dark p-4 rounded-2xl outline-none font-bold min-h-[100px]"
                                placeholder="A cinematic shot of a luxury perfume bottle on a marble table..."
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">الأبعاد (Aspect Ratio)</label>
                                  <div className="flex gap-2 flex-wrap">
                                      {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => (
                                          <button 
                                            key={r} 
                                            onClick={()=>setAspectRatio(r)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black border ${aspectRatio === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                                          >
                                              {r}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">الدقة (Size)</label>
                                  <div className="flex gap-2 flex-wrap">
                                      {['1K', '2K', '4K'].map(s => (
                                          <button 
                                            key={s} 
                                            onClick={()=>setImageSize(s)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black border ${imageSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                                          >
                                              {s}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          <button 
                            onClick={handleGenerateImage}
                            disabled={isGenerating || !imgPrompt}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                              {isGenerating ? 'جاري التوليد...' : 'توليد الصورة ✨'}
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">وصف الفيديو (Prompt)</label>
                              <textarea 
                                value={videoPrompt}
                                onChange={e => setVideoPrompt(e.target.value)}
                                className="w-full glass-dark p-4 rounded-2xl outline-none font-bold min-h-[100px]"
                                placeholder="A neon hologram of a cat driving at top speed..."
                              />
                          </div>
                          <button 
                            onClick={handleGenerateVideo}
                            disabled={veoLoading || !videoPrompt}
                            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                          >
                              {veoLoading ? 'جاري المعالجة (Veo)...' : 'إنشاء فيديو 🎥'}
                          </button>
                      </div>
                  )}
              </div>

              <div className="glass p-10 rounded-[50px] border border-white bg-slate-900 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
                  
                  {creativeMode === 'image' && generatedImage ? (
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                          <img src={generatedImage} alt="AI Generated" className="rounded-3xl shadow-2xl max-h-[400px] object-contain" />
                          <button className="mt-6 px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-emerald-400 transition-all">تنزيل ({imageSize})</button>
                      </div>
                  ) : creativeMode === 'video' && generatedVideo ? (
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                          <video src={generatedVideo} controls className="rounded-3xl shadow-2xl w-full max-h-[400px]" />
                          <button className="mt-6 px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-emerald-400 transition-all">تنزيل MP4</button>
                      </div>
                  ) : (
                      <div className="text-center opacity-30">
                          <div className="text-6xl mb-4">🎨</div>
                          <p className="text-white font-black uppercase tracking-widest">النتائج ستظهر هنا</p>
                      </div>
                  )}
              </div>
          </div>
      )}

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
