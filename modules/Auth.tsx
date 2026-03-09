
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Auth: React.FC = () => {
  const { setUser, user } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', businessName: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateStoreLink = (name: string) => {
      const slug = name.trim().replace(/\s+/g, '-').toLowerCase();
      return `https://titan.deals/Titan/${slug}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate Auth API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trialStart = new Date().toISOString();
    const storeLink = isLogin ? (user?.storeUrl || '') : generateStoreLink(formData.businessName);
    
    // Mock user login/creation
    setUser({
      id: '1',
      name: isLogin ? 'Demo User' : 'New Merchant',
      email: formData.email,
      role: 'admin',
      permissions: ['*'],
      avatar: 'https://i.pravatar.cc/150',
      branchId: 'main',
      businessName: isLogin ? 'Existing Store' : formData.businessName,
      storeUrl: storeLink || 'https://titan.deals/Titan/demo-store', // Fallback for demo login
      trialStartDate: trialStart, // Set trial start
      subscriptionStatus: 'trial'
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600 rounded-full blur-[150px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center">
          {/* Brand Side */}
          <div className="hidden lg:flex flex-col justify-center h-full p-10 text-white">
              <h1 className="text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">TITAN</h1>
              <p className="text-xl font-bold text-blue-200 mb-8 max-w-md leading-relaxed">
                  منصة إدارة الموارد المؤسسية المتكاملة. تحكم في مخزونك، مبيعاتك، وموظفيك من مكان واحد.
              </p>
              <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                      <p className="text-3xl font-black text-emerald-400">+45%</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">كفاءة التشغيل</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                      <p className="text-3xl font-black text-blue-400">99.9%</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">وقت التشغيل</p>
                  </div>
              </div>
          </div>

          {/* Form Side */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
            
            <div className="text-center mb-10 lg:hidden">
               <h1 className="text-4xl font-black text-white tracking-tighter mb-2">منصة Titan</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {!isLogin && (
                 <div className="animate-in slide-in-from-top-4">
                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">اسم النشاط التجاري</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                      placeholder="مثال: متجر الأناقة"
                      onChange={e => {
                          setFormData({...formData, businessName: e.target.value});
                          setGeneratedLink(generateStoreLink(e.target.value));
                      }}
                    />
                    {formData.businessName && (
                        <p className="text-[10px] text-emerald-400 mt-2 font-bold dir-ltr text-left animate-in fade-in bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 inline-block">
                            Store Link: <span className="underline">{generatedLink}</span>
                        </p>
                    )}
                 </div>
               )}
               <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                    placeholder="name@company.com"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest px-2">كلمة المرور</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
               </div>

               <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 mt-4"
               >
                  {isLoading ? <div className="w-5 h-5 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : null}
                  {isLogin ? 'تسجيل الدخول' : 'بدء التجربة المجانية (3 أيام)'}
               </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-white/5">
               <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
                  {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                  <span className="underline decoration-indigo-500 decoration-2 underline-offset-4 text-indigo-300 hover:text-indigo-200">
                      {isLogin ? 'أنشئ متجرك الآن' : 'تسجيل الدخول'}
                  </span>
               </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Auth;
