
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Auth: React.FC = () => {
  const { setUser, user } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', businessName: '' });
  const [generatedLink, setGeneratedLink] = useState('');

  const generateStoreLink = (name: string) => {
      const slug = name.trim().replace(/\s+/g, '-').toLowerCase();
      return `https://titan.deals/Titan/${slug}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate Auth API Logic
    const trialStart = new Date();
    const storeLink = isLogin ? (user?.storeUrl || '') : generateStoreLink(formData.businessName);
    
    // Mock user login/creation
    setUser({
      id: '1',
      name: isLogin ? 'Demo User' : 'New Merchant',
      email: formData.email,
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150',
      branchId: 'main',
      businessName: isLogin ? 'Existing Store' : formData.businessName,
      storeUrl: storeLink || 'https://titan.deals/Titan/demo-store', // Fallback for demo login
      trialStartDate: trialStart.toISOString(),
      subscriptionStatus: 'trial'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
         <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 md:p-12 rounded-[3rem] w-full max-w-lg shadow-2xl relative z-10 text-white">
        <div className="text-center mb-10">
           <h1 className="text-4xl font-black tracking-tighter mb-2">منصة Titan</h1>
           <p className="text-gray-300 text-sm font-medium">نظام تخطيط موارد المؤسسات السحابي (ERP SaaS)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           {!isLogin && (
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">اسم النشاط التجاري</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="مثال: متجر الأناقة"
                  onChange={e => {
                      setFormData({...formData, businessName: e.target.value});
                      setGeneratedLink(generateStoreLink(e.target.value));
                  }}
                />
                {formData.businessName && (
                    <p className="text-[10px] text-emerald-400 mt-2 font-bold dir-ltr text-left">
                        Store Link: <span className="underline">{generatedLink}</span>
                    </p>
                )}
             </div>
           )}
           <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">البريد الإلكتروني</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="name@company.com"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">كلمة المرور</label>
              <input 
                type="password" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
           </div>

           <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 py-4 rounded-xl font-bold text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-transform">
              {isLogin ? 'تسجيل الدخول' : 'بدء التجربة المجانية (7 أيام)'}
           </button>
        </form>

        <div className="mt-8 text-center">
           <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-white underline">
              {isLogin ? 'ليس لديك حساب؟ أنشئ متجرك الآن واحصل على رابطك الخاص' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
