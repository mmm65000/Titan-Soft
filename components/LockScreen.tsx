
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { user } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      // In production, this should check against a hashed PIN from user settings
      if (pin === '1234') { 
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, onUnlock]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key >= '0' && e.key <= '9') {
            handleNum(e.key);
        } else if (e.key === 'Backspace') {
            setPin(prev => prev.slice(0, -1));
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white animate-in fade-in duration-300 select-none">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="mb-10 text-center animate-in slide-in-from-top-10 relative z-10">
        <div className="relative inline-block group">
            <img src={user?.avatar || "https://i.pravatar.cc/150"} className="w-28 h-28 rounded-full border-4 border-white/10 mx-auto mb-6 shadow-2xl object-cover transition-transform group-hover:scale-105" />
            <div className="absolute bottom-6 right-0 w-6 h-6 bg-red-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-black tracking-tight">{user?.name}</h2>
        <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">نظام تايتان مغلق</p>
      </div>

      <div className="flex gap-6 mb-12 relative z-10">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-white scale-125 border-white' : 'border-white/20'} ${error ? 'border-red-500 bg-red-500' : ''}`}></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-80 relative z-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => handleNum(n.toString())} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center text-3xl font-black backdrop-blur-md border border-white/5 shadow-lg active:scale-95 hover:border-white/20">
            {n}
          </button>
        ))}
        <div className="col-start-2">
          <button onClick={() => handleNum('0')} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center text-3xl font-black backdrop-blur-md border border-white/5 shadow-lg active:scale-95 hover:border-white/20">
            0
          </button>
        </div>
        <button onClick={handleClear} className="w-20 h-20 rounded-full flex items-center justify-center text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest active:scale-95 transition-all">
          مسح
        </button>
      </div>
      
      <p className="mt-16 text-[10px] text-gray-600 font-mono relative z-10">Default PIN: 1234</p>
    </div>
  );
};

export default LockScreen;
