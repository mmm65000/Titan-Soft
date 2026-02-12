
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';

const WelcomeWizard: React.FC = () => {
  const { user, lang } = useApp();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('titan_welcome_wizard_seen');
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('titan_welcome_wizard_seen', 'true');
    setShow(false);
  };

  if (!show) return null;

  const steps = [
    {
      title: 'مرحباً بك في Titan OS 🚀',
      desc: 'الجيل الجديد من أنظمة تخطيط موارد المؤسسات. لقد تم تجهيز بيئة العمل الخاصة بك وهي جاهزة للانطلاق.',
      icon: '👋',
      bg: 'bg-slate-900',
      text: 'text-white'
    },
    {
      title: 'الذكاء الاصطناعي المركزي (Oracle)',
      desc: 'استخدم أيقونة AI في الأسفل للحصول على تحليلات فورية للمبيعات، المخزون، وتوقعات الأرباح.',
      icon: '🤖',
      bg: 'bg-indigo-600',
      text: 'text-white'
    },
    {
      title: 'الأوامر السريعة (Command Palette)',
      desc: 'اضغط Ctrl + K في أي وقت للوصول السريع لأي وحدة أو وظيفة في النظام دون البحث في القوائم.',
      icon: '⌨️',
      bg: 'bg-white',
      text: 'text-slate-800'
    },
    {
      title: 'أنت جاهز تماماً!',
      desc: 'ابدأ باستكشاف لوحة القيادة أو انتقل للإعدادات لضبط تفاصيل مؤسستك.',
      icon: '✅',
      bg: 'bg-emerald-500',
      text: 'text-white'
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className={`w-full max-w-lg rounded-[60px] p-12 shadow-2xl relative overflow-hidden transition-all duration-500 ${currentStep.bg} ${currentStep.text} border-4 border-white/20`}>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-[3rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-6xl mb-8 shadow-inner animate-bounce-slow">
              {currentStep.icon}
           </div>
           
           <h2 className="text-3xl font-black tracking-tighter mb-4">{currentStep.title}</h2>
           <p className="text-sm font-bold opacity-80 leading-relaxed mb-10 max-w-xs mx-auto">
              {currentStep.desc}
           </p>

           <div className="flex gap-2 mb-8">
              {steps.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-current' : 'w-2 bg-current/30'}`}></div>
              ))}
           </div>

           <button 
             onClick={() => {
                 if (step < steps.length - 1) setStep(step + 1);
                 else handleFinish();
             }}
             className={`px-12 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-transform hover:scale-105 active:scale-95 ${
                 currentStep.text === 'text-white' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
             }`}
           >
              {step < steps.length - 1 ? 'التالي ➜' : 'ابدأ العمل 🚀'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWizard;
