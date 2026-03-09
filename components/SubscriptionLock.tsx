
import React from 'react';
import { useApp } from '../AppContext';

const SubscriptionLock: React.FC = () => {
  const { user, logout } = useApp();

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="glass p-12 rounded-[50px] max-w-2xl w-full border border-white/10 shadow-2xl relative z-10 animate-in zoom-in duration-500">
         <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 mx-auto shadow-2xl shadow-orange-500/20">
            🔒
         </div>
         
         <h1 className="text-4xl font-black mb-4 tracking-tighter">انتهت الفترة التجريبية</h1>
         <p className="text-gray-300 text-lg mb-8 leading-relaxed font-medium">
            لقد استمتعت بتجربة منصة <strong>Titan</strong> لمدة 3 أيام مجانية. 
            للاستمرار في إدارة أعمالك والوصول إلى بياناتك، يرجى تفعيل اشتراكك الآن.
         </p>

         <div className="bg-white/5 rounded-3xl p-6 mb-10 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 font-bold text-sm">الباقة الحالية</span>
                <span className="text-white font-black">Titan Enterprise Trial</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold text-sm">تاريخ الانتهاء</span>
                <span className="text-red-400 font-black">{user?.trialStartDate ? new Date(new Date(user.trialStartDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'اليوم'}</span>
            </div>
         </div>

         <div className="flex gap-4">
             <button onClick={logout} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all">تسجيل خروج</button>
             <button className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 transition-all uppercase tracking-widest">
                ترقية الاشتراك وتفعيل الحساب 🚀
             </button>
         </div>
         
         <p className="mt-6 text-[10px] text-gray-500 font-bold">
            جميع بياناتك محفوظة بأمان وسيتم استعادتها فور الدفع.
         </p>
      </div>
    </div>
  );
};

export default SubscriptionLock;
